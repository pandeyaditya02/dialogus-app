"use client";

import { useMemo } from "react";
import MarkdownEditor, { type BodyImage } from "./MarkdownEditor";

export interface BlogContent {
  title: string;
  slug: string;
  description: string;
  body: string;
  imagePrompt: string;
}

interface ContentEditorProps {
  blog: BlogContent | null;
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
  isGenerating?: boolean;
  streamedText?: string;
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

function extractPartialJSON(jsonStr: string): Partial<BlogContent> {
  const result: Partial<BlogContent> = {};
  if (!jsonStr) return result;

  // Extract title
  const titleMatch = jsonStr.match(/"title"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
  if (titleMatch) {
    try {
      result.title = JSON.parse(`"${titleMatch[1]}"`);
    } catch {
      result.title = titleMatch[1];
    }
  }

  // Extract description
  const descMatch = jsonStr.match(/"description"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
  if (descMatch) {
    try {
      result.description = JSON.parse(`"${descMatch[1]}"`);
    } catch {
      result.description = descMatch[1];
    }
  }

  // Extract body
  const bodyMatch = jsonStr.match(/"body"\s*:\s*"([^"\\]*(?:\\.[^"\\]*)*)"/);
  if (bodyMatch) {
    try {
      result.body = JSON.parse(`"${bodyMatch[1]}"`);
    } catch {
      result.body = bodyMatch[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
    }
  } else {
    // If body string quote isn't closed yet in streaming JSON
    const openBodyIdx = jsonStr.indexOf('"body":');
    if (openBodyIdx !== -1) {
      const startQuoteIdx = jsonStr.indexOf('"', openBodyIdx + 7);
      if (startQuoteIdx !== -1) {
        const rawPartial = jsonStr.slice(startQuoteIdx + 1);
        result.body = rawPartial.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\t/g, "\t");
      }
    }
  }

  return result;
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
  isGenerating = false,
  streamedText = "",
}: ContentEditorProps) {
  // Extract real-time streaming values if generation is active
  const partial = useMemo(() => {
    if (isGenerating && streamedText) {
      return extractPartialJSON(streamedText);
    }
    return null;
  }, [isGenerating, streamedText]);

  const currentTitle = isGenerating
    ? partial?.title || blog?.title || ""
    : blog?.title || "";

  const currentSlug = isGenerating
    ? currentTitle ? slugify(currentTitle) : blog?.slug || ""
    : blog?.slug || "";

  const currentDescription = isGenerating
    ? partial?.description || blog?.description || ""
    : blog?.description || "";

  const currentBody = isGenerating
    ? partial?.body || (streamedText ? "Receiving article tokens from AI..." : "")
    : blog?.body || "";

  function update(field: keyof BlogContent, value: string) {
    if (!blog) {
      setBlog({
        title: "",
        slug: "",
        description: "",
        body: "",
        imagePrompt: "",
        [field]: value,
      });
    } else {
      setBlog({ ...blog, [field]: value });
    }
  }

  function handleTitleChange(value: string) {
    update("title", value);
    update("slug", slugify(value));
  }

  const wordCount = countWords(currentBody);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
          Article Editor
          {isGenerating && (
            <span className="inline-flex items-center gap-1 text-xs font-normal text-fuchsia-600 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
              Streaming content live...
            </span>
          )}
        </h2>
      </div>

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={currentTitle}
          readOnly={isGenerating}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Headline will stream here live..."
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 transition-all ${
            isGenerating
              ? "bg-slate-50 border-fuchsia-300 font-medium text-fuchsia-950"
              : "bg-white border-gray-300"
          }`}
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
            value={currentSlug}
            readOnly={isGenerating}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="url-friendly-slug"
            className={`flex-1 px-3 py-2 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 font-mono transition-all ${
              isGenerating
                ? "bg-slate-50 border-gray-200 text-gray-500"
                : "bg-white border-gray-300"
            }`}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
          <span
            className={`ml-2 text-xs font-normal ${
              currentDescription.length > 200 ? "text-red-500" : "text-gray-400"
            }`}
          >
            {currentDescription.length}/200
          </span>
        </label>
        <textarea
          value={currentDescription}
          readOnly={isGenerating}
          onChange={(e) => update("description", e.target.value)}
          rows={2}
          maxLength={210}
          placeholder="SEO summary preview..."
          className={`w-full px-3 py-2 border rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 resize-none transition-all ${
            isGenerating
              ? "bg-slate-50 border-fuchsia-200 text-gray-800"
              : "bg-white border-gray-300"
          }`}
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
            disabled={isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white disabled:bg-slate-50"
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
            disabled={isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white disabled:bg-slate-50"
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

      {/* Body Editor */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Article Body (Markdown)
          </label>
          <span className={`text-xs ${wordCount > 550 ? "text-amber-600" : "text-gray-400"}`}>
            {wordCount} words
          </span>
        </div>

        {/* Live streaming preview or Interactive Markdown Editor */}
        <MarkdownEditor
          value={currentBody}
          onChange={(v) => update("body", v)}
          bodyImages={bodyImages}
          onInsertImage={onInsertImage}
          onRemoveImage={onRemoveImage}
          isGeneratingBodyImage={isGeneratingBodyImage}
          onGenerateBodyImage={onGenerateBodyImage}
          readOnly={isGenerating}
        />
      </div>
    </div>
  );
}
