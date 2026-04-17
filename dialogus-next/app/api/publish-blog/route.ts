import { NextRequest, NextResponse } from "next/server";
import { createDocument, uploadImage, fetchCategories, fetchAuthors } from "@/lib/sanity.write";
import { markdownToPortableText } from "@/lib/markdown-to-portable-text";

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      bodyMarkdown,
      authorId,
      categoryId,
      coverImageBase64,
      coverImageMimeType,
      publishMode,
    } = body;

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

    const portableTextBody = markdownToPortableText(bodyMarkdown);

    const doc: Record<string, unknown> = {
      _type: "insightPost",
      title,
      slug: { _type: "slug", current: slug },
      description,
      date: new Date().toISOString().split("T")[0],
      author: { _type: "reference", _ref: authorId },
      category: { _type: "reference", _ref: categoryId },
      body: portableTextBody,
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
