"use client";

import { useState } from "react";
import DOMPurify from "dompurify";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/** Tags produced by the markdown-ish pipeline below — anything else is stripped. */
const PREVIEW_SANITIZE = {
  ALLOWED_TAGS: [
    "p",
    "h2",
    "h3",
    "h4",
    "blockquote",
    "strong",
    "em",
    "a",
    "ul",
    "li",
    "br",
  ],
  ALLOWED_ATTR: ["href", "target", "rel"],
};

function renderMarkdownToHtml(md: string): string {
  let html = md
    // Headings
    .replace(/^#### (.+)$/gm, "<h4>$1</h4>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    // Blockquote
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
    // Bold
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    // Italic
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Links
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Bullet list items
    .replace(/^[-*+] (.+)$/gm, "<li>$1</li>")
    // Paragraphs & line breaks
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br/>");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/(<li>[\s\S]*?<\/li>(\s*<br\/>)?)+/g, (match) => {
    const items = match.replace(/<br\/>/g, "");
    return `<ul>${items}</ul>`;
  });

  const raw = `<p>${html}</p>`;
  return DOMPurify.sanitize(raw, PREVIEW_SANITIZE);
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={24}
          spellCheck
          className="w-full px-4 py-3 text-sm text-gray-900 font-mono resize-y focus:outline-none"
          placeholder="Write your article in Markdown…"
        />
      )}

      {/* Preview pane */}
      {tab === "preview" && (
        <div
          className="px-4 py-3 min-h-[400px] prose prose-sm max-w-none text-gray-900 overflow-auto"
          style={{
            fontFamily: "Georgia, serif",
            lineHeight: 1.75,
          }}
          dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(value) }}
        />
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
      `}</style>
    </div>
  );
}
