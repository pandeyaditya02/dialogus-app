# AI Blog Generator — Complete Code Changes

This document contains every file that was created for the AI Blog Generator feature, with complete file paths and full contents. No existing files were modified (except one route file that was updated in-place). Zero new npm dependencies were added.

## Table of Contents

1. [Library Files (5 files)](#library-files)
   - [lib/auth.ts](#1-libauthts)
   - [lib/sanity.write.ts](#2-libsanitywritets)
   - [lib/ai-blog-generator.ts](#3-libai-blog-generatorts)
   - [lib/imagen.ts](#4-libimagents)
   - [lib/markdown-to-portable-text.ts](#5-libmarkdown-to-portable-textts)
2. [Middleware (1 file)](#middleware)
   - [middleware.ts](#6-middlewarets)
3. [API Routes (5 files)](#api-routes)
   - [app/api/auth/login/route.ts](#7-appapiauth loginroutets)
   - [app/api/auth/logout/route.ts](#8-appapiauthlogoutroutets)
   - [app/api/generate-blog/route.ts](#9-appapigenerate-blogroutets)
   - [app/api/generate-image/route.ts](#10-appapigenerate-imageroutets)
   - [app/api/publish-blog/route.ts](#11-appapipublish-blogroutets)
4. [Admin Pages (3 files)](#admin-pages)
   - [app/admin/layout.tsx](#12-appadminlayouttsx)
   - [app/admin/login/page.tsx](#13-appadminloginpagetsx)
   - [app/admin/generate/page.tsx](#14-appadmingeneratepagetsx)
5. [Admin Components (5 files)](#admin-components)
   - [app/admin/generate/components/GenerateForm.tsx](#15-generateformtsx)
   - [app/admin/generate/components/ContentEditor.tsx](#16-contenteditortsx)
   - [app/admin/generate/components/MarkdownEditor.tsx](#17-markdowneditortsx)
   - [app/admin/generate/components/ImagePreview.tsx](#18-imagepreviewtsx)
   - [app/admin/generate/components/PublishBar.tsx](#19-publishbartsx)

---

## Library Files

### 1. `lib/auth.ts`

**Path:** `dialogus-next/lib/auth.ts`

Session cookie management using Web Crypto API (HMAC-SHA256) and Sanity project membership verification.

```ts
const SESSION_SECRET = process.env.SESSION_SECRET!;
const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

interface SessionPayload {
  userId: string;
  userName: string;
  expiry: number;
}

async function getSigningKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SESSION_SECRET);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const key = await getSigningKey();
  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = btoa(payloadStr);

  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payloadB64)
  );

  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifySession(cookie: string): Promise<SessionPayload | null> {
  try {
    const [payloadB64, signatureB64] = cookie.split(".");
    if (!payloadB64 || !signatureB64) return null;

    const key = await getSigningKey();
    const encoder = new TextEncoder();
    const signature = fromBase64Url(signatureB64);

    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      encoder.encode(payloadB64)
    );

    if (!valid) return null;

    const payload: SessionPayload = JSON.parse(atob(payloadB64));

    if (Date.now() > payload.expiry) return null;

    return payload;
  } catch {
    return null;
  }
}

interface SanityUser {
  id: string;
  name: string;
  email: string;
}

export async function verifySanityToken(token: string): Promise<SanityUser | null> {
  try {
    const userRes = await fetch("https://api.sanity.io/v1/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!userRes.ok) return null;

    const user = await userRes.json();
    if (!user?.id) return null;

    const projectRes = await fetch(
      `https://api.sanity.io/v1/projects/${SANITY_PROJECT_ID}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!projectRes.ok) return null;

    const project = await projectRes.json();
    const isMember = project.members?.some(
      (m: { id: string }) => m.id === user.id
    );

    if (!isMember) return null;

    return { id: user.id, name: user.name || user.email, email: user.email };
  } catch {
    return null;
  }
}

export function createSessionPayload(user: SanityUser): SessionPayload {
  return {
    userId: user.id,
    userName: user.name,
    expiry: Date.now() + SESSION_DURATION_MS,
  };
}

export const SESSION_COOKIE_NAME = "dialogus_admin_session";
```

---

### 2. `lib/sanity.write.ts`

**Path:** `dialogus-next/lib/sanity.write.ts`

Write-capable Sanity client using raw fetch to the Mutations API and Assets API.

```ts
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET!;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION!;
const writeToken = process.env.SANITY_WRITE_TOKEN!;

const BASE_URL = `https://${projectId}.api.sanity.io/v${apiVersion}`;

interface SanityMutationResult {
  transactionId: string;
  documentId: string;
}

export async function createDocument(
  doc: Record<string, unknown>,
  isDraft: boolean
): Promise<SanityMutationResult> {
  const docId = crypto.randomUUID();
  const _id = isDraft ? `drafts.${docId}` : docId;

  const body = {
    mutations: [
      {
        createOrReplace: {
          ...doc,
          _id,
        },
      },
    ],
  };

  const res = await fetch(`${BASE_URL}/data/mutate/${dataset}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${writeToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Sanity mutation failed: ${error}`);
  }

  const result = await res.json();
  return {
    transactionId: result.transactionId,
    documentId: _id,
  };
}

interface SanityImageAsset {
  _type: "image";
  asset: {
    _type: "reference";
    _ref: string;
  };
}

export async function uploadImage(
  imageBuffer: Buffer,
  filename: string,
  contentType: string = "image/png"
): Promise<SanityImageAsset> {
  const res = await fetch(
    `${BASE_URL}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Authorization: `Bearer ${writeToken}`,
      },
      body: imageBuffer,
    }
  );

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Sanity image upload failed: ${error}`);
  }

  const result = await res.json();
  return {
    _type: "image",
    asset: {
      _type: "reference",
      _ref: result.document._id,
    },
  };
}

export async function fetchCategories(): Promise<
  Array<{ _id: string; title: string }>
> {
  const query = encodeURIComponent('*[_type == "category"]{_id, title}');
  const res = await fetch(`${BASE_URL}/data/query/${dataset}?query=${query}`, {
    headers: { Authorization: `Bearer ${writeToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch categories");
  const data = await res.json();
  return data.result;
}

export async function fetchAuthors(): Promise<
  Array<{ _id: string; name: string }>
> {
  const query = encodeURIComponent('*[_type == "author"]{_id, name}');
  const res = await fetch(`${BASE_URL}/data/query/${dataset}?query=${query}`, {
    headers: { Authorization: `Bearer ${writeToken}` },
  });

  if (!res.ok) throw new Error("Failed to fetch authors");
  const data = await res.json();
  return data.result;
}
```

---

### 3. `lib/ai-blog-generator.ts`

**Path:** `dialogus-next/lib/ai-blog-generator.ts`

Claude Sonnet content generation via raw fetch to the Anthropic Messages API. Supports first generation and regeneration with editor feedback.

```ts
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface GeneratedBlog {
  title: string;
  slug: string;
  description: string;
  body: string;
  imagePrompt: string;
}

interface GenerateOptions {
  topic: string;
  instructions?: string;
  previousContent?: {
    title: string;
    description: string;
    body: string;
  } | null;
  regenerateInstructions?: string | null;
}

const SYSTEM_PROMPT = `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Your task is to write a complete blog article. Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters. Front-load with keywords.",
  "body": "Full article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image for this article"
}

Article requirements:
- Length: 800-1500 words
- Structure: Introduction paragraph, 3-5 sections with H2 headings (##), optional H3 subheadings (###), conclusion
- Tone: Analytical, data-driven, journalistic. Not sensational, not academic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for notable quotes, - for bullet lists, [text](url) for links
- Never use H1 (#) — the title is rendered separately
- Include specific data points, dates, and factual references where possible
- Write in a way that is accessible to educated general readers

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;

const REGENERATE_SYSTEM_PROMPT = `You are a senior editorial writer for Dialogus, a digital media platform. You are revising a previously generated article based on editor feedback.

Review the previous article and the editor's instructions, then produce an improved version. Preserve the parts that work well and focus your changes on what the editor has asked for.

Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters",
  "body": "Full revised article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image"
}

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;

export async function generateBlog(
  options: GenerateOptions
): Promise<GeneratedBlog> {
  const isRegeneration =
    options.previousContent && options.regenerateInstructions;

  let userMessage: string;
  let systemPrompt: string;

  if (isRegeneration) {
    systemPrompt = REGENERATE_SYSTEM_PROMPT;
    userMessage = `## Previous Article

**Title:** ${options.previousContent!.title}

**Description:** ${options.previousContent!.description}

**Body:**
${options.previousContent!.body}

## Editor Feedback
${options.regenerateInstructions}

${options.instructions ? `## Additional Instructions\n${options.instructions}` : ""}

Please revise the article based on the editor's feedback.`;
  } else {
    systemPrompt = SYSTEM_PROMPT;
    userMessage = `Write a blog article about: ${options.topic}`;

    if (options.instructions) {
      userMessage += `\n\nAdditional instructions from the editor:\n${options.instructions}`;
    }
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const content = data.content?.[0]?.text;

  if (!content) {
    throw new Error("No content in Anthropic response");
  }

  let jsonStr = content.trim();
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const blog: GeneratedBlog = JSON.parse(jsonStr);

  if (!blog.title || !blog.slug || !blog.description || !blog.body) {
    throw new Error("Incomplete blog generated — missing required fields");
  }

  if (blog.description.length > 200) {
    blog.description = blog.description.slice(0, 197) + "...";
  }

  return blog;
}
```

---

### 4. `lib/imagen.ts`

**Path:** `dialogus-next/lib/imagen.ts`

Google Imagen 3 image generation via raw fetch.

```ts
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

interface ImagenResult {
  imageBase64: string;
  mimeType: string;
}

export async function generateImage(prompt: string): Promise<ImagenResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GOOGLE_AI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Imagen API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const prediction = data.predictions?.[0];

  if (!prediction?.bytesBase64Encoded) {
    throw new Error("No image data in Imagen response");
  }

  return {
    imageBase64: prediction.bytesBase64Encoded,
    mimeType: prediction.mimeType || "image/png",
  };
}
```

---

### 5. `lib/markdown-to-portable-text.ts`

**Path:** `dialogus-next/lib/markdown-to-portable-text.ts`

Custom markdown-to-Portable-Text converter matching the Sanity `blockContent` schema. Supports h2, h3, h4, normal, blockquote, bullet lists, strong, em, and link annotations.

```ts
/**
 * Custom markdown-to-Portable-Text converter.
 * Supports: h2, h3, h4, normal, blockquote, bullet lists,
 * strong, em, and link annotations — matching the blockContent schema.
 */

interface PortableTextSpan {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

interface PortableTextMarkDef {
  _type: "link";
  _key: string;
  href: string;
}

interface PortableTextBlock {
  _type: "block";
  _key: string;
  style: "normal" | "h2" | "h3" | "h4" | "blockquote";
  markDefs: PortableTextMarkDef[];
  children: PortableTextSpan[];
  listItem?: "bullet";
  level?: number;
}

type PortableTextNode = PortableTextBlock;

let keyCounter = 0;
function genKey(): string {
  return `k${Date.now().toString(36)}${(keyCounter++).toString(36)}`;
}

interface InlineToken {
  text: string;
  marks: string[];
  linkKey?: string;
}

function parseInlineMarks(
  text: string
): { tokens: InlineToken[]; markDefs: PortableTextMarkDef[] } {
  const tokens: InlineToken[] = [];
  const markDefs: PortableTextMarkDef[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === "*" && text[i + 1] === "*") {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        const innerResult = parseInlineMarks(inner);
        for (const t of innerResult.tokens) {
          t.marks = ["strong", ...t.marks];
        }
        tokens.push(...innerResult.tokens);
        markDefs.push(...innerResult.markDefs);
        i = end + 2;
        continue;
      }
    }

    if (text[i] === "*" && text[i + 1] !== "*") {
      const end = text.indexOf("*", i + 1);
      if (end !== -1 && text[end + 1] !== "*") {
        const inner = text.slice(i + 1, end);
        const innerResult = parseInlineMarks(inner);
        for (const t of innerResult.tokens) {
          t.marks = ["em", ...t.marks];
        }
        tokens.push(...innerResult.tokens);
        markDefs.push(...innerResult.markDefs);
        i = end + 1;
        continue;
      }
    }

    if (text[i] === "[") {
      const closeBracket = text.indexOf("]", i);
      if (closeBracket !== -1 && text[closeBracket + 1] === "(") {
        const closeParen = text.indexOf(")", closeBracket + 2);
        if (closeParen !== -1) {
          const linkText = text.slice(i + 1, closeBracket);
          const href = text.slice(closeBracket + 2, closeParen);
          const linkKey = genKey();
          markDefs.push({ _type: "link", _key: linkKey, href });
          tokens.push({ text: linkText, marks: [], linkKey });
          i = closeParen + 1;
          continue;
        }
      }
    }

    let plainEnd = i + 1;
    while (plainEnd < text.length) {
      if (text[plainEnd] === "*" || text[plainEnd] === "[") break;
      plainEnd++;
    }
    tokens.push({ text: text.slice(i, plainEnd), marks: [] });
    i = plainEnd;
  }

  return { tokens, markDefs };
}

function createBlock(
  line: string,
  style: PortableTextBlock["style"],
  listItem?: "bullet"
): PortableTextBlock {
  const { tokens, markDefs } = parseInlineMarks(line);

  const children: PortableTextSpan[] = tokens.map((t) => ({
    _type: "span" as const,
    _key: genKey(),
    text: t.text,
    marks: t.linkKey ? [...t.marks, t.linkKey] : t.marks,
  }));

  if (children.length === 0) {
    children.push({
      _type: "span",
      _key: genKey(),
      text: "",
      marks: [],
    });
  }

  const block: PortableTextBlock = {
    _type: "block",
    _key: genKey(),
    style,
    markDefs,
    children,
  };

  if (listItem) {
    block.listItem = listItem;
    block.level = 1;
  }

  return block;
}

export function markdownToPortableText(markdown: string): PortableTextNode[] {
  keyCounter = 0;
  const blocks: PortableTextNode[] = [];
  const lines = markdown.split("\n");

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i++;
      continue;
    }

    if (line.startsWith("#### ")) {
      blocks.push(createBlock(line.slice(5).trim(), "h4"));
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push(createBlock(line.slice(4).trim(), "h3"));
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push(createBlock(line.slice(3).trim(), "h2"));
      i++;
      continue;
    }

    if (line.startsWith("> ")) {
      blocks.push(createBlock(line.slice(2).trim(), "blockquote"));
      i++;
      continue;
    }

    if (/^[-*+]\s/.test(line)) {
      blocks.push(createBlock(line.replace(/^[-*+]\s/, "").trim(), "normal", "bullet"));
      i++;
      continue;
    }

    let paragraph = line;
    i++;
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("> ") &&
      !/^[-*+]\s/.test(lines[i])
    ) {
      paragraph += " " + lines[i];
      i++;
    }

    blocks.push(createBlock(paragraph.trim(), "normal"));
  }

  return blocks;
}
```

---

## Middleware

### 6. `middleware.ts`

**Path:** `dialogus-next/middleware.ts`

Edge middleware that protects admin pages and API routes by verifying the session cookie.

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifySession, SESSION_COOKIE_NAME } from "@/lib/auth";

const PROTECTED_PATHS = ["/admin/generate"];
const PROTECTED_API_PATHS = [
  "/api/generate-blog",
  "/api/generate-image",
  "/api/publish-blog",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPage = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isProtectedApi = PROTECTED_API_PATHS.some((p) => pathname.startsWith(p));

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionCookie) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const session = await verifySession(sessionCookie);

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId);
  requestHeaders.set("x-user-name", session.userName);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/admin/generate/:path*", "/api/generate-blog", "/api/generate-image", "/api/publish-blog"],
};
```

---

## API Routes

### 7. `app/api/auth/login/route.ts`

**Path:** `dialogus-next/app/api/auth/login/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import {
  verifySanityToken,
  createSessionPayload,
  signSession,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { sanityToken } = await request.json();

    if (!sanityToken || typeof sanityToken !== "string") {
      return NextResponse.json(
        { error: "Sanity API token is required" },
        { status: 400 }
      );
    }

    const user = await verifySanityToken(sanityToken);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid token or you are not a member of this Sanity project" },
        { status: 401 }
      );
    }

    const payload = createSessionPayload(user);
    const sessionCookie = await signSession(payload);

    const response = NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

---

### 8. `app/api/auth/logout/route.ts`

**Path:** `dialogus-next/app/api/auth/logout/route.ts`

```ts
import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}
```

---

### 9. `app/api/generate-blog/route.ts`

**Path:** `dialogus-next/app/api/generate-blog/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { generateBlog } from "@/lib/ai-blog-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, instructions, previousContent, regenerateInstructions } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const blog = await generateBlog({
      topic,
      instructions: instructions || undefined,
      previousContent: previousContent || null,
      regenerateInstructions: regenerateInstructions || null,
    });

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### 10. `app/api/generate-image/route.ts`

**Path:** `dialogus-next/app/api/generate-image/route.ts`

```ts
import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/imagen";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Image prompt is required" },
        { status: 400 }
      );
    }

    const result = await generateImage(prompt);

    return NextResponse.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### 11. `app/api/publish-blog/route.ts`

**Path:** `dialogus-next/app/api/publish-blog/route.ts`

```ts
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
```

---

## Admin Pages

### 12. `app/admin/layout.tsx`

**Path:** `dialogus-next/app/admin/layout.tsx`

```tsx
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}
```

---

### 13. `app/admin/login/page.tsx`

**Path:** `dialogus-next/app/admin/login/page.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sanityToken: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      router.push("/admin/generate");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">
              Dialogus Admin
            </h1>
            <p className="text-gray-500 mt-2 text-sm">
              Sign in with your Sanity API token
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="token"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sanity Personal API Token
              </label>
              <input
                id="token"
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="sk..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !token.trim()}
              className="w-full py-3 px-4 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? "Verifying..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              To get your token, go to{" "}
              <a
                href="https://www.sanity.io/manage"
                target="_blank"
                rel="noopener noreferrer"
                className="text-fuchsia-600 hover:underline"
              >
                manage.sanity.io
              </a>{" "}
              → your project → API → Tokens → Add API Token (Editor role).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### 14. `app/admin/generate/page.tsx`

**Path:** `dialogus-next/app/admin/generate/page.tsx`

This is the main dashboard page. Due to its length, see the actual file at `dialogus-next/app/admin/generate/page.tsx` for the full source. It is a `"use client"` component with three view states (input, edit, success) that orchestrates all the components below.

---

## Admin Components

### 15. `GenerateForm.tsx`

**Path:** `dialogus-next/app/admin/generate/components/GenerateForm.tsx`

Input form with topic, instructions, category/author dropdowns, and generate button. See the actual file for full source.

---

### 16. `ContentEditor.tsx`

**Path:** `dialogus-next/app/admin/generate/components/ContentEditor.tsx`

Editable fields for title (auto-generates slug), slug, description (with character counter), and body (uses MarkdownEditor). See the actual file for full source.

---

### 17. `MarkdownEditor.tsx`

**Path:** `dialogus-next/app/admin/generate/components/MarkdownEditor.tsx`

Custom markdown editor with Write/Preview tabs. Includes a built-in markdown-to-HTML renderer for the preview pane. See the actual file for full source.

---

### 18. `ImagePreview.tsx`

**Path:** `dialogus-next/app/admin/generate/components/ImagePreview.tsx`

Cover image preview with editable prompt, regenerate button, and custom file upload. See the actual file for full source.

---

### 19. `PublishBar.tsx`

**Path:** `dialogus-next/app/admin/generate/components/PublishBar.tsx`

Action bar with Publish, Save as Draft, Regenerate (with instructions textarea), and Start Over buttons. See the actual file for full source.

---

## Summary

| Category | Files Created | Files Modified |
|---|---|---|
| Library (`lib/`) | 5 | 0 |
| Middleware | 1 | 0 |
| API Routes (`app/api/`) | 5 | 0 |
| Admin Pages (`app/admin/`) | 3 | 0 |
| Admin Components | 5 | 0 |
| **Total** | **19** | **0** |

**New npm dependencies:** None. All external APIs are called via raw `fetch()`.
