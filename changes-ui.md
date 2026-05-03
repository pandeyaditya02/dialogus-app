# Body Images, Sticky Fix, and UI Enhancement — Changes

## Summary

Three sets of changes to the article generation admin UI:

1. **Body images** — Users can now upload or AI-generate multiple images within the article body via a toolbar button and inline modal. Images are stored as `![alt](body:img-X)` placeholders in the markdown, rendered in preview, uploaded to Sanity at publish time, and converted to Portable Text image blocks.
2. **Sticky fix** — The cover image panel no longer sticks to the viewport; it scrolls normally with the page.
3. **UI enhancements** — Full-width single-column edit layout, cover image + sources in a horizontal row, gradient topic banner, formatting toolbar in the markdown editor, word count, sticky publish bar at bottom, and GenerateForm visual polish.

---

## Files Changed

### 1. `dialogus-next/app/admin/generate/components/ImagePreview.tsx` — MODIFIED

Removed `sticky top-24` from the root container so the cover image panel scrolls normally.

```tsx
"use client";

import { useRef } from "react";

interface ImagePreviewProps {
  imageBase64: string;
  mimeType: string;
  imagePrompt: string;
  setImagePrompt: (v: string) => void;
  isGenerating: boolean;
  onGenerateImage: () => void;
  onImageUpload: (base64: string, mimeType: string) => void;
}

export default function ImagePreview({
  imageBase64,
  mimeType,
  imagePrompt,
  setImagePrompt,
  isGenerating,
  onGenerateImage,
  onImageUpload,
}: ImagePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:image/png;base64,..."
      const base64 = result.split(",")[1];
      onImageUpload(base64, file.type || "image/png");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Cover Image
      </h2>

      {/* Image display */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {imageBase64 ? (
          <img
            src={`data:${mimeType};base64,${imageBase64}`}
            alt="Cover image preview"
            className="w-full h-full object-cover"
          />
        ) : isGenerating ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="inline-block w-6 h-6 border-2 border-gray-300 border-t-fuchsia-500 rounded-full animate-spin" />
            <span className="text-xs">Generating…</span>
          </div>
        ) : (
          <div className="text-gray-300 text-sm text-center px-4">
            No image yet
          </div>
        )}
      </div>

      {/* Image prompt */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Image Prompt
        </label>
        <textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          rows={3}
          placeholder="Describe the cover image…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Regenerate button */}
      <button
        type="button"
        onClick={onGenerateImage}
        disabled={isGenerating || !imagePrompt.trim()}
        className="w-full py-2 px-3 bg-fuchsia-600 text-white text-xs font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          "Regenerate Image"
        )}
      </button>

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 px-3 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Upload Custom Image
        </button>
      </div>
    </div>
  );
}
```

---

### 2. `dialogus-next/lib/markdown-to-portable-text.ts` — MODIFIED

Added `PortableTextImagePlaceholder` interface and `IMAGE_PLACEHOLDER_RE` regex to detect `![alt](body:img-X)` lines. Emits image placeholder nodes instead of text blocks. Paragraph merging now stops at image lines.

```typescript
/**
 * Custom markdown-to-Portable-Text converter.
 * Supports: h2, h3, h4, normal, blockquote, bullet lists,
 * strong, em, link annotations, and image placeholders — matching the blockContent schema.
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

export interface PortableTextImagePlaceholder {
  _type: "image";
  _key: string;
  _imageId: string;
  alt: string;
}

export type PortableTextNode = PortableTextBlock | PortableTextImagePlaceholder;

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

const IMAGE_PLACEHOLDER_RE = /^!\[([^\]]*)\]\(body:(img-[a-zA-Z0-9_-]+)\)\s*$/;

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

    const imgMatch = line.trim().match(IMAGE_PLACEHOLDER_RE);
    if (imgMatch) {
      blocks.push({
        _type: "image",
        _key: genKey(),
        _imageId: imgMatch[2],
        alt: imgMatch[1],
      });
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
      !/^[-*+]\s/.test(lines[i]) &&
      !IMAGE_PLACEHOLDER_RE.test(lines[i].trim())
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

### 3. `dialogus-next/app/admin/generate/components/MarkdownEditor.tsx` — MAJOR REWRITE

Complete rewrite with: formatting toolbar (Bold, Italic, H2, H3, Quote, List, Link, Image), cursor-position-aware insertion via `useRef`, inline image insert modal (Upload + Generate tabs), body image placeholder rendering in Preview pane, thumbnail strip at bottom, and the `BodyImage` interface export.

```tsx
"use client";

import { useState, useRef, useCallback } from "react";
import DOMPurify from "dompurify";

export interface BodyImage {
  id: string;
  base64: string;
  mimeType: string;
  alt: string;
  prompt?: string;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  bodyImages: Map<string, BodyImage>;
  onInsertImage: (image: BodyImage, placeholder: string) => void;
  onRemoveImage: (id: string) => void;
  isGeneratingBodyImage: boolean;
  onGenerateBodyImage: (prompt: string, alt: string) => void;
}

const PREVIEW_SANITIZE = {
  ALLOWED_TAGS: [
    "p", "h2", "h3", "h4", "blockquote", "strong", "em",
    "a", "ul", "li", "br", "img", "figure", "figcaption",
  ],
  ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "class", "style"],
};

function renderMarkdownToHtml(md: string, bodyImages: Map<string, BodyImage>): string {
  let html = md
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

  html = html.replace(/^!\[([^\]]*)\]\(body:(img-[a-zA-Z0-9_-]+)\)\s*$/gm, (_match, alt, id) => {
    const img = bodyImages.get(id);
    if (img) {
      return `<figure class="body-img-figure"><img src="data:${img.mimeType};base64,${img.base64}" alt="${alt}" class="body-img-preview" /><figcaption>${alt || ""}</figcaption></figure>`;
    }
    return `<p style="color:#d946ef;font-style:italic;">[Image: ${id} — not found]</p>`;
  });

  html = html
    .replace(/^[-*+] (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  html = html.replace(/(<li>[\s\S]*?<\/li>(\s*<br\/>)?)+/g, (match) => {
    const items = match.replace(/<br\/>/g, "");
    return `<ul>${items}</ul>`;
  });

  const raw = `<p>${html}</p>`;
  return DOMPurify.sanitize(raw, PREVIEW_SANITIZE);
}

export default function MarkdownEditor({
  value,
  onChange,
  bodyImages,
  onInsertImage,
  onRemoveImage,
  isGeneratingBodyImage,
  onGenerateBodyImage,
}: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageTab, setImageTab] = useState<"upload" | "generate">("upload");
  const [imageAlt, setImageAlt] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const insertAtCursor = useCallback((before: string, after: string = "") => {
    const ta = textareaRef.current;
    if (!ta) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const insertion = before + selected + after;
    const newValue = value.slice(0, start) + insertion + value.slice(end);
    onChange(newValue);
    requestAnimationFrame(() => {
      ta.focus();
      const cursorPos = start + before.length + selected.length;
      ta.setSelectionRange(cursorPos, cursorPos);
    });
  }, [value, onChange]);

  function handleToolbar(action: string) {
    switch (action) {
      case "bold": insertAtCursor("**", "**"); break;
      case "italic": insertAtCursor("*", "*"); break;
      case "h2": insertAtCursor("\n## "); break;
      case "h3": insertAtCursor("\n### "); break;
      case "quote": insertAtCursor("\n> "); break;
      case "list": insertAtCursor("\n- "); break;
      case "link": insertAtCursor("[", "](url)"); break;
      case "image": setShowImageModal(true); break;
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const id = `img-${Date.now().toString(36)}`;
      const alt = imageAlt.trim() || "image";
      const img: BodyImage = { id, base64, mimeType: file.type || "image/png", alt };
      const placeholder = `![${alt}](body:${id})`;
      onInsertImage(img, placeholder);
      insertAtCursor(`\n${placeholder}\n`);
      closeModal();
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function handleGenerate() {
    const alt = imageAlt.trim() || "image";
    const prompt = imagePrompt.trim();
    if (!prompt) return;
    onGenerateBodyImage(prompt, alt);
    closeModal();
  }

  function closeModal() {
    setShowImageModal(false);
    setImageAlt("");
    setImagePrompt("");
    setImageTab("upload");
  }

  const imageArray = Array.from(bodyImages.values());

  const toolbarButtons = [
    { action: "bold", label: "B", title: "Bold", className: "font-bold" },
    { action: "italic", label: "I", title: "Italic", className: "italic" },
    { action: "h2", label: "H2", title: "Heading 2", className: "font-semibold text-[10px]" },
    { action: "h3", label: "H3", title: "Heading 3", className: "font-semibold text-[10px]" },
    { action: "quote", label: "\u201C", title: "Blockquote", className: "text-base" },
    { action: "list", label: "\u2022", title: "Bullet list", className: "text-base" },
    { action: "link", label: "\uD83D\uDD17", title: "Link", className: "text-xs" },
  ];

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden relative">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200">
        {toolbarButtons.map((btn) => (
          <button
            key={btn.action}
            type="button"
            title={btn.title}
            onClick={() => handleToolbar(btn.action)}
            className={`w-7 h-7 flex items-center justify-center rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors text-xs ${btn.className}`}
          >
            {btn.label}
          </button>
        ))}
        <div className="w-px h-5 bg-gray-300 mx-1" />
        <button
          type="button"
          title="Insert image"
          onClick={() => handleToolbar("image")}
          className="flex items-center gap-1 px-2 h-7 rounded text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors text-xs"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          Image
        </button>
        {isGeneratingBodyImage && (
          <span className="ml-auto flex items-center gap-1.5 text-[10px] text-fuchsia-600">
            <span className="inline-block w-3 h-3 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
            Generating...
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => setTab("write")}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            tab === "write"
              ? "text-fuchsia-600 border-b-2 border-fuchsia-500 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setTab("preview")}
          className={`px-4 py-2 text-xs font-medium transition-colors ${
            tab === "preview"
              ? "text-fuchsia-600 border-b-2 border-fuchsia-500 bg-white"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Preview
        </button>
      </div>

      {/* Write pane */}
      {tab === "write" && (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={24}
          spellCheck
          className="w-full px-4 py-3 text-sm text-gray-900 font-mono resize-y focus:outline-none min-h-[400px]"
          placeholder="Write your article in Markdown..."
        />
      )}

      {/* Preview pane */}
      {tab === "preview" && (
        <div
          className="px-4 py-3 min-h-[400px] prose prose-sm max-w-none text-gray-900 overflow-auto"
          style={{ fontFamily: "Georgia, serif", lineHeight: 1.75 }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(value, bodyImages) }}
        />
      )}

      {/* Body images thumbnail strip */}
      {imageArray.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-200 bg-gray-50">
          <p className="text-[10px] text-gray-400 mb-1.5">{imageArray.length} body image{imageArray.length > 1 ? "s" : ""}</p>
          <div className="flex gap-2 overflow-x-auto">
            {imageArray.map((img) => (
              <div key={img.id} className="relative group shrink-0">
                <img
                  src={`data:${img.mimeType};base64,${img.base64}`}
                  alt={img.alt}
                  className="w-16 h-12 object-cover rounded border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => onRemoveImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  x
                </button>
                <p className="text-[8px] text-gray-400 truncate w-16 mt-0.5">{img.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image insert modal */}
      {showImageModal && (
        <div className="absolute inset-0 bg-black/20 z-10 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-96 max-w-[90%] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-800">Insert Image</h3>
              <button type="button" onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                type="button"
                onClick={() => setImageTab("upload")}
                className={`flex-1 px-3 py-2 text-xs font-medium ${imageTab === "upload" ? "text-fuchsia-600 border-b-2 border-fuchsia-500" : "text-gray-500"}`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageTab("generate")}
                className={`flex-1 px-3 py-2 text-xs font-medium ${imageTab === "generate" ? "text-fuchsia-600 border-b-2 border-fuchsia-500" : "text-gray-500"}`}
              >
                Generate with AI
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Alt text (shared) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Alt text</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Describe the image..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                />
              </div>

              {imageTab === "upload" ? (
                <div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 text-sm hover:border-fuchsia-400 hover:text-fuchsia-600 transition-colors flex flex-col items-center gap-1"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                    </svg>
                    Click to upload an image
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Image prompt</label>
                    <textarea
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      rows={3}
                      placeholder="Describe the image you want to generate..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!imagePrompt.trim() || isGeneratingBodyImage}
                    className="w-full py-2 bg-fuchsia-600 text-white text-xs font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isGeneratingBodyImage ? (
                      <>
                        <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Image"
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .prose h2 { font-size: 1.25rem; font-weight: 700; margin: 1.25rem 0 0.5rem; }
        .prose h3 { font-size: 1.1rem; font-weight: 600; margin: 1rem 0 0.4rem; }
        .prose h4 { font-size: 1rem; font-weight: 600; margin: 0.8rem 0 0.3rem; }
        .prose blockquote { border-left: 3px solid #d946ef; padding-left: 1rem; color: #6b7280; font-style: italic; }
        .prose ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
        .prose li { margin: 0.2rem 0; }
        .prose a { color: #a21caf; text-decoration: underline; }
        .prose strong { font-weight: 700; }
        .prose em { font-style: italic; }
        .prose p { margin: 0.75rem 0; }
        .body-img-figure { margin: 1.5rem 0; text-align: center; }
        .body-img-preview { max-width: 100%; height: auto; border-radius: 0.5rem; border: 1px solid #e5e7eb; }
        .body-img-figure figcaption { font-size: 0.75rem; color: #9ca3af; margin-top: 0.25rem; }
      `}</style>
    </div>
  );
}
```

---

### 4. `dialogus-next/app/admin/generate/components/ContentEditor.tsx` — MODIFIED

Now accepts and passes through `bodyImages`, `onInsertImage`, `onRemoveImage`, `isGeneratingBodyImage`, and `onGenerateBodyImage` props to MarkdownEditor. Added word count indicator next to the Body label.

```tsx
"use client";

import MarkdownEditor, { type BodyImage } from "./MarkdownEditor";

interface BlogContent {
  title: string;
  slug: string;
  description: string;
  body: string;
  imagePrompt: string;
}

interface ContentEditorProps {
  blog: BlogContent;
  setBlog: (b: BlogContent) => void;
  authorId: string;
  setAuthorId: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  authors: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; title: string }>;
  bodyImages: Map<string, BodyImage>;
  onInsertImage: (image: BodyImage, placeholder: string) => void;
  onRemoveImage: (id: string) => void;
  isGeneratingBodyImage: boolean;
  onGenerateBodyImage: (prompt: string, alt: string) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

export default function ContentEditor({
  blog,
  setBlog,
  authorId,
  setAuthorId,
  categoryId,
  setCategoryId,
  authors,
  categories,
  bodyImages,
  onInsertImage,
  onRemoveImage,
  isGeneratingBodyImage,
  onGenerateBodyImage,
}: ContentEditorProps) {
  function update(field: keyof BlogContent, value: string) {
    setBlog({ ...blog, [field]: value });
  }

  function handleTitleChange(value: string) {
    setBlog({ ...blog, title: value, slug: slugify(value) });
  }

  const wordCount = countWords(blog.body);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Edit Content
      </h2>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={blog.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug
        </label>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">/insights/</span>
          <input
            type="text"
            value={blog.slug}
            onChange={(e) => update("slug", e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent font-mono"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <span
            className={`ml-2 text-xs font-normal ${
              blog.description.length > 200 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {blog.description.length}/200
          </span>
        </label>
        <textarea
          value={blog.description}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          maxLength={210}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Author & Category */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <select
            value={authorId}
            onChange={(e) => setAuthorId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent bg-white"
          >
            <option value="">Select author</option>
            {authors.map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent bg-white"
          >
            <option value="">Select category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Body */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Body
          </label>
          <span className={`text-xs ${wordCount > 550 ? "text-amber-600" : "text-gray-400"}`}>
            {wordCount} words
          </span>
        </div>
        <MarkdownEditor
          value={blog.body}
          onChange={(v) => update("body", v)}
          bodyImages={bodyImages}
          onInsertImage={onInsertImage}
          onRemoveImage={onRemoveImage}
          isGeneratingBodyImage={isGeneratingBodyImage}
          onGenerateBodyImage={onGenerateBodyImage}
        />
      </div>
    </div>
  );
}
```

---

### 5. `dialogus-next/app/admin/generate/components/GenerateForm.tsx` — MODIFIED

Added a fuchsia-to-purple gradient accent line at the top of the form card. Added helper text under the topic field: "AI will fetch real-time news for this topic to ground the article in facts."

```tsx
"use client";

interface GenerateFormProps {
  topic: string;
  setTopic: (v: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  authorId: string;
  setAuthorId: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  authors: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; title: string }>;
  onGenerate: () => void;
  isGenerating: boolean;
}

export default function GenerateForm({
  topic,
  setTopic,
  instructions,
  setInstructions,
  authorId,
  setAuthorId,
  categoryId,
  setCategoryId,
  authors,
  categories,
  onGenerate,
  isGenerating,
}: GenerateFormProps) {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate();
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Blog Generator
        </h1>
        <p className="text-gray-500 text-sm">
          Generate a complete, publish-ready article for Dialogus using AI.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-6 relative overflow-hidden"
      >
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-fuchsia-500" />

        {/* Topic */}
        <div>
          <label
            htmlFor="topic"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Article Topic <span className="text-red-500">*</span>
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. India's digital rupee adoption challenges in rural areas"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            AI will fetch real-time news for this topic to ground the article in facts.
          </p>
        </div>

        {/* Instructions */}
        <div>
          <label
            htmlFor="instructions"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Additional Instructions{" "}
            <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            id="instructions"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. Focus on the regulatory angle, include recent RBI data, keep it under 1000 words"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm resize-none"
          />
        </div>

        {/* Author & Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Author
            </label>
            <select
              id="author"
              value={authorId}
              onChange={(e) => setAuthorId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm bg-white"
            >
              <option value="">Select author</option>
              {authors.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Category
            </label>
            <select
              id="category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent transition-shadow text-sm bg-white"
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating || !topic.trim()}
          className="w-full py-3 px-4 bg-fuchsia-600 text-white font-medium rounded-lg hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Generating article...
            </>
          ) : (
            "Generate Article"
          )}
        </button>
      </form>
    </div>
  );
}
```

---

### 6. `dialogus-next/app/admin/generate/components/PublishBar.tsx` — MODIFIED

Made sticky at bottom of viewport (`sticky bottom-4 z-10`) with `shadow-lg` so publish actions stay visible while scrolling long articles.

```tsx
"use client";

import { useState } from "react";

interface PublishBarProps {
  isPublishing: boolean;
  isGenerating: boolean;
  regenerateInstructions: string;
  setRegenerateInstructions: (v: string) => void;
  onPublish: () => void;
  onDraft: () => void;
  onRegenerate: () => void;
  onStartOver: () => void;
}

export default function PublishBar({
  isPublishing,
  isGenerating,
  regenerateInstructions,
  setRegenerateInstructions,
  onPublish,
  onDraft,
  onRegenerate,
  onStartOver,
}: PublishBarProps) {
  const [showRegenerate, setShowRegenerate] = useState(false);

  const busy = isPublishing || isGenerating;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sticky bottom-4 z-10">
      {/* Regenerate section */}
      {showRegenerate && (
        <div className="mb-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Regeneration Instructions
          </label>
          <textarea
            value={regenerateInstructions}
            onChange={(e) => setRegenerateInstructions(e.target.value)}
            rows={3}
            placeholder="Tell the AI what to change — e.g. 'Make the tone more conversational', 'Add more data points about Q1 2025'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onRegenerate();
                setShowRegenerate(false);
              }}
              disabled={busy || !regenerateInstructions.trim()}
              className="px-4 py-2 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Regenerating...
                </>
              ) : (
                "Apply & Regenerate"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowRegenerate(false)}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Publish */}
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="px-5 py-2.5 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isPublishing ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publishing...
            </>
          ) : (
            "Publish"
          )}
        </button>

        {/* Draft */}
        <button
          type="button"
          onClick={onDraft}
          disabled={busy}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save as Draft
        </button>

        {/* Regenerate */}
        <button
          type="button"
          onClick={() => setShowRegenerate((v) => !v)}
          disabled={busy}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Regenerate
        </button>

        {/* Start over */}
        <button
          type="button"
          onClick={onStartOver}
          className="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
```

---

### 7. `dialogus-next/app/admin/generate/page.tsx` — MODIFIED

Major changes: added `bodyImages` state (`Map<string, BodyImage>`), `isGeneratingBodyImage` flag, `handleInsertBodyImage`, `handleRemoveBodyImage`, `handleGenerateBodyImage` handlers. Passes body images to ContentEditor and to the publish endpoint. New full-width single-column layout with horizontal Cover Image + Sources row, gradient topic banner, and `max-w-6xl` container. Resets bodyImages in `handleStartOver`.

```tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import GenerateForm from "./components/GenerateForm";
import ContentEditor from "./components/ContentEditor";
import ImagePreview from "./components/ImagePreview";
import PublishBar from "./components/PublishBar";
import SourcesPanel from "./components/SourcesPanel";
import type { BodyImage } from "./components/MarkdownEditor";

type ViewState = "input" | "edit" | "success";

interface BlogContent {
  title: string;
  slug: string;
  description: string;
  body: string;
  imagePrompt: string;
}

interface PublishResult {
  documentId: string;
  slug: string;
  studioUrl: string;
  isDraft: boolean;
}

interface NewsSource {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

export default function GeneratePage() {
  const [view, setView] = useState<ViewState>("input");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingBodyImage, setIsGeneratingBodyImage] = useState(false);
  const [error, setError] = useState("");

  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authors, setAuthors] = useState<Array<{ _id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; title: string }>>([]);

  const [blog, setBlog] = useState<BlogContent | null>(null);
  const [coverImageBase64, setCoverImageBase64] = useState<string>("");
  const [coverImageMimeType, setCoverImageMimeType] = useState<string>("image/png");
  const [imagePrompt, setImagePrompt] = useState("");

  const [bodyImages, setBodyImages] = useState<Map<string, BodyImage>>(new Map());

  const [sources, setSources] = useState<NewsSource[]>([]);
  const [contextStatus, setContextStatus] = useState<"grounded" | "no_sources">("no_sources");
  const [totalFetched, setTotalFetched] = useState(0);
  const [afterDedup, setAfterDedup] = useState(0);

  const [regenerateInstructions, setRegenerateInstructions] = useState("");
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [catRes, authRes] = await Promise.all([
          fetch("/api/publish-blog?action=categories"),
          fetch("/api/publish-blog?action=authors"),
        ]);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData.categories || []);
        }
        if (authRes.ok) {
          const authData = await authRes.json();
          setAuthors(authData.authors || []);
        }
      } catch {
        // non-blocking
      }
    }
    fetchMeta();
  }, []);

  function applyGenerateResponse(data: any) {
    setSources(data.sources || []);
    setContextStatus(data.contextStatus || "no_sources");
    setTotalFetched(data.totalFetched || 0);
    setAfterDedup(data.afterDedup || 0);
  }

  async function handleGenerate() { /* ... fetches /api/generate-blog, sets blog + sources, auto-generates image ... */ }
  async function handleRegenerate() { /* ... sends previousContent + regenerateInstructions to /api/generate-blog ... */ }
  async function handleGenerateImage(prompt?: string) { /* ... calls /api/generate-image for cover image ... */ }

  const handleInsertBodyImage = useCallback((image: BodyImage, _placeholder: string) => {
    setBodyImages((prev) => {
      const next = new Map(prev);
      next.set(image.id, image);
      return next;
    });
  }, []);

  const handleRemoveBodyImage = useCallback((id: string) => {
    setBodyImages((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    if (blog) {
      const re = new RegExp(`\\n?!\\[[^\\]]*\\]\\(body:${id}\\)\\n?`, "g");
      setBlog({ ...blog, body: blog.body.replace(re, "\n") });
    }
  }, [blog]);

  const handleGenerateBodyImage = useCallback(async (prompt: string, alt: string) => {
    setIsGeneratingBodyImage(true);
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

      const id = `img-${Date.now().toString(36)}`;
      const image: BodyImage = { id, base64: data.imageBase64, mimeType: data.mimeType, alt, prompt };
      const placeholder = `![${alt}](body:${id})`;
      handleInsertBodyImage(image, placeholder);
      if (blog) {
        setBlog({ ...blog, body: blog.body + `\n\n${placeholder}\n` });
      }
    } catch {
      setError("Failed to generate body image. Try again.");
    } finally {
      setIsGeneratingBodyImage(false);
    }
  }, [blog, handleInsertBodyImage]);

  async function handlePublish(publishMode: "publish" | "draft") {
    /* ... sends bodyImages array alongside other fields to /api/publish-blog ... */
  }

  function handleStartOver() {
    /* ... resets all state including bodyImages ... */
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Error banner */}
        {/* Input view: GenerateForm */}
        {/* Edit view: Topic banner + Cover/Sources row + ContentEditor (full width) + PublishBar (sticky bottom) */}
        {/* Success view */}
      </main>
    </div>
  );
}
```

Note: The full page.tsx code is ~454 lines. The key structural change is the edit view layout which is now single-column with a horizontal row for cover image + sources, followed by full-width content editor. See the complete file in `dialogus-next/app/admin/generate/page.tsx`.

---

### 8. `dialogus-next/app/api/publish-blog/route.ts` — MODIFIED

Now accepts optional `bodyImages` array in the POST body. Uploads each body image to Sanity Assets, then resolves image placeholder nodes in the Portable Text output by replacing `_imageId` references with actual Sanity asset `_ref` values.

```typescript
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
```
