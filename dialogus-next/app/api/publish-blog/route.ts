import { NextRequest, NextResponse } from "next/server";
import { createDocument, uploadImage, fetchCategories, fetchAuthors } from "@/lib/sanity.write";
import { markdownToPortableText, type PortableTextImagePlaceholder } from "@/lib/markdown-to-portable-text";

export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");

    if (action === "categories") {
      const categories = await fetchCategories();
      return NextResponse.json({ categories });
    }

    if (action === "authors") {
      const authors = await fetchAuthors();
      return NextResponse.json({ authors });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Fetch failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface BodyImagePayload {
  id: string;
  base64: string;
  mimeType: string;
  alt: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const clean = (val: any) => 
      typeof val === "string" ? (val.trim() || "") : val;

    const title = clean(body.title);
    const slug = clean(body.slug);
    const description = clean(body.description);
    const bodyMarkdown = clean(body.bodyMarkdown);
    const authorId = clean(body.authorId);
    const categoryId = clean(body.categoryId);
    const coverImageBase64 = body.coverImageBase64;
    const coverImageMimeType = body.coverImageMimeType;
    const bodyImagesPayload: BodyImagePayload[] = body.bodyImages || [];
    const publishMode = body.publishMode;

    if (!title || !slug || !description || !bodyMarkdown || !authorId || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["publish", "draft"].includes(publishMode)) {
      return NextResponse.json(
        { error: "publishMode must be 'publish' or 'draft'" },
        { status: 400 }
      );
    }

    let coverImage = undefined;
    if (coverImageBase64) {
      const buffer = Buffer.from(coverImageBase64, "base64");
      const ext = coverImageMimeType === "image/jpeg" ? "jpg" : "png";
      coverImage = await uploadImage(
        buffer,
        `${slug}-cover.${ext}`,
        coverImageMimeType || "image/png"
      );
    }

    const uploadedBodyImages = new Map<string, { _ref: string }>();
    for (const img of bodyImagesPayload) {
      const buffer = Buffer.from(img.base64, "base64");
      const ext = img.mimeType === "image/jpeg" ? "jpg" : "png";
      const result = await uploadImage(
        buffer,
        `${slug}-body-${img.id}.${ext}`,
        img.mimeType || "image/png"
      );
      uploadedBodyImages.set(img.id, { _ref: result.asset._ref });
    }

    const portableTextBody = markdownToPortableText(bodyMarkdown);

    const resolvedBody = portableTextBody.map((node) => {
      if (node._type === "image") {
        const placeholder = node as PortableTextImagePlaceholder;
        const uploaded = uploadedBodyImages.get(placeholder._imageId);
        if (uploaded) {
          return {
            _type: "image" as const,
            _key: placeholder._key,
            asset: { _type: "reference" as const, _ref: uploaded._ref },
          };
        }
        return null;
      }
      return node;
    }).filter(Boolean);

    const doc: Record<string, unknown> = {
      _type: "insightPost",
      title,
      slug: { _type: "slug", current: slug },
      description,
      date: new Date().toISOString().split("T")[0],
      author: { _type: "reference", _ref: authorId },
      category: { _type: "reference", _ref: categoryId },
      body: resolvedBody,
    };

    if (coverImage) {
      doc.coverImage = coverImage;
    }

    const isDraft = publishMode === "draft";
    const result = await createDocument(doc, isDraft);

    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const studioUrl = `https://${projectId}.sanity.studio/intent/edit/id=${result.documentId}`;

    return NextResponse.json({
      success: true,
      documentId: result.documentId,
      slug,
      studioUrl,
      isDraft,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Publishing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
