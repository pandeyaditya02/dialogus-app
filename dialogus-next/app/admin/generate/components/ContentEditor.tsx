"use client";

import MarkdownEditor from "./MarkdownEditor";

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
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
}: ContentEditorProps) {
  function update(field: keyof BlogContent, value: string) {
    setBlog({ ...blog, [field]: value });
  }

  function handleTitleChange(value: string) {
    setBlog({ ...blog, title: value, slug: slugify(value) });
  }

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
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Body
        </label>
        <MarkdownEditor
          value={blog.body}
          onChange={(v) => update("body", v)}
        />
      </div>
    </div>
  );
}
