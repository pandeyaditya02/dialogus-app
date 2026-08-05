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
  readOnly?: boolean;
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
  readOnly = false,
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
          readOnly={readOnly}
          rows={24}
          spellCheck
          className={`w-full px-4 py-3 text-sm font-mono resize-y focus:outline-none min-h-[400px] transition-colors ${
            readOnly
              ? "bg-slate-50 text-fuchsia-950 border-fuchsia-200"
              : "text-gray-900 bg-white"
          }`}
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
