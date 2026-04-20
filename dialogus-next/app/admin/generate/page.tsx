"use client";

import { useState, useEffect } from "react";
import GenerateForm from "./components/GenerateForm";
import ContentEditor from "./components/ContentEditor";
import ImagePreview from "./components/ImagePreview";
import PublishBar from "./components/PublishBar";

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

export default function GeneratePage() {
  const [view, setView] = useState<ViewState>("input");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authors, setAuthors] = useState<Array<{ _id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; title: string }>>([]);

  // Content state
  const [blog, setBlog] = useState<BlogContent | null>(null);
  const [coverImageBase64, setCoverImageBase64] = useState<string>("");
  const [coverImageMimeType, setCoverImageMimeType] = useState<string>("image/png");
  const [imagePrompt, setImagePrompt] = useState("");

  // Regenerate state
  const [regenerateInstructions, setRegenerateInstructions] = useState("");

  // Publish result
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

  async function handleGenerate() {
    if (!topic.trim()) return;
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, instructions }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setBlog(data.blog);
      setImagePrompt(data.blog.imagePrompt);
      setView("edit");

      // Auto-generate image
      handleGenerateImage(data.blog.imagePrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleRegenerate() {
    if (!blog) return;
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          instructions,
          previousContent: {
            title: blog.title,
            description: blog.description,
            body: blog.body,
          },
          regenerateInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");

      setBlog(data.blog);
      setImagePrompt(data.blog.imagePrompt);
      setRegenerateInstructions("");

      // Auto-generate new image
      handleGenerateImage(data.blog.imagePrompt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Regeneration failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerateImage(prompt?: string) {
    const promptToUse = prompt ?? imagePrompt;
    if (!promptToUse) return;
    setIsGeneratingImage(true);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed");

      setCoverImageBase64(data.imageBase64);
      setCoverImageMimeType(data.mimeType);
    } catch {
      // Image generation failure is non-fatal
    } finally {
      setIsGeneratingImage(false);
    }
  }

  async function handlePublish(publishMode: "publish" | "draft") {
    if (!blog) return;
    if (!authorId || !categoryId) {
      setError("Please select an author and category before publishing.");
      return;
    }
    setIsPublishing(true);
    setError("");

    try {
      const res = await fetch("/api/publish-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: blog.title,
          slug: blog.slug,
          description: blog.description,
          bodyMarkdown: blog.body,
          authorId,
          categoryId,
          coverImageBase64: coverImageBase64 || undefined,
          coverImageMimeType: coverImageMimeType || "image/png",
          publishMode,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Publishing failed");

      setPublishResult(data);
      setView("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publishing failed");
    } finally {
      setIsPublishing(false);
    }
  }

  function handleStartOver() {
    setView("input");
    setBlog(null);
    setCoverImageBase64("");
    setCoverImageMimeType("image/png");
    setImagePrompt("");
    setRegenerateInstructions("");
    setPublishResult(null);
    setError("");
    setTopic("");
    setInstructions("");
  }

  return (
    <div className="min-h-screen">

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Error banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <span className="mt-0.5">⚠</span>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input view */}
        {view === "input" && (
          <GenerateForm
            topic={topic}
            setTopic={setTopic}
            instructions={instructions}
            setInstructions={setInstructions}
            authorId={authorId}
            setAuthorId={setAuthorId}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            authors={authors}
            categories={categories}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        )}

        {/* Edit view */}
        {view === "edit" && blog && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <ContentEditor
                  blog={blog}
                  setBlog={setBlog}
                  authorId={authorId}
                  setAuthorId={setAuthorId}
                  categoryId={categoryId}
                  setCategoryId={setCategoryId}
                  authors={authors}
                  categories={categories}
                />
              </div>
              <div>
                <ImagePreview
                  imageBase64={coverImageBase64}
                  mimeType={coverImageMimeType}
                  imagePrompt={imagePrompt}
                  setImagePrompt={setImagePrompt}
                  isGenerating={isGeneratingImage}
                  onGenerateImage={() => handleGenerateImage()}
                  onImageUpload={(base64, mime) => {
                    setCoverImageBase64(base64);
                    setCoverImageMimeType(mime);
                  }}
                />
              </div>
            </div>

            <PublishBar
              isPublishing={isPublishing}
              isGenerating={isGenerating}
              regenerateInstructions={regenerateInstructions}
              setRegenerateInstructions={setRegenerateInstructions}
              onPublish={() => handlePublish("publish")}
              onDraft={() => handlePublish("draft")}
              onRegenerate={handleRegenerate}
              onStartOver={handleStartOver}
            />
          </div>
        )}

        {/* Success view */}
        {view === "success" && publishResult && (
          <div className="max-w-lg mx-auto text-center py-16">
            <div className="text-5xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {publishResult.isDraft ? "Saved as Draft!" : "Published!"}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              {publishResult.isDraft
                ? "Your post has been saved as a draft in Sanity."
                : `Your post is live at /insights/${publishResult.slug}`}
            </p>
            <div className="flex flex-col gap-3">
              <a
                href={publishResult.studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-fuchsia-600 text-white rounded-lg text-sm font-medium hover:bg-fuchsia-700 transition-colors"
              >
                Open in Sanity Studio ↗
              </a>
              {!publishResult.isDraft && (
                <a
                  href={`/insights/${publishResult.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View Post ↗
                </a>
              )}
              <button
                onClick={handleStartOver}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
              >
                Generate another post
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
