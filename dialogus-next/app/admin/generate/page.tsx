"use client";

import { useState, useEffect, useCallback } from "react";
import GenerateForm from "./components/GenerateForm";
import ContentEditor from "./components/ContentEditor";
import ImagePreview from "./components/ImagePreview";
import PublishBar, { DraftStatus } from "./components/PublishBar";
import SourcesPanel from "./components/SourcesPanel";
import ProgressIndicator, { StageStatus } from "./components/ProgressIndicator";
import UnifiedPipelineHeader from "./components/UnifiedPipelineHeader";
import type { BodyImage } from "./components/MarkdownEditor";
import { parseCompletedMarkdown } from "@/lib/ai-blog-generator";

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
  snippet?: string;
  isAcademic?: boolean;
}

export default function GeneratePage() {
  const [view, setView] = useState<ViewState>("input");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingBodyImage, setIsGeneratingBodyImage] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [authorId, setAuthorId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authors, setAuthors] = useState<Array<{ _id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; title: string }>>([]);

  // Real-time streaming pipeline state
  const [stages, setStages] = useState<Record<string, StageStatus>>({});
  const [serperItems, setSerperItems] = useState<NewsSource[]>([]);
  const [scholarItems, setScholarItems] = useState<NewsSource[]>([]);
  const [streamedText, setStreamedText] = useState("");

  // Content state
  const [blog, setBlog] = useState<BlogContent | null>(null);
  const [coverImageBase64, setCoverImageBase64] = useState<string>("");
  const [coverImageMimeType, setCoverImageMimeType] = useState<string>("image/png");
  const [imagePrompt, setImagePrompt] = useState("");

  // Body images state
  const [bodyImages, setBodyImages] = useState<Map<string, BodyImage>>(new Map());

  // RAG sources state
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [contextStatus, setContextStatus] = useState<"grounded" | "no_sources">("no_sources");
  const [totalFetched, setTotalFetched] = useState(0);
  const [afterDedup, setAfterDedup] = useState(0);
  const [withSnippets, setWithSnippets] = useState(0);

  // Regenerate state
  const [regenerateInstructions, setRegenerateInstructions] = useState("");

  // In-place draft tracking state
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [studioUrl, setStudioUrl] = useState<string | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
    studioUrl?: string;
  } | null>(null);

  // Publish result
  const [publishResult, setPublishResult] = useState<PublishResult | null>(null);

  useEffect(() => {
    async function initPage() {
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

      // Restore draft from URL ?draft= parameter if present
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const draftParam = params.get("draft");
        if (draftParam) {
          try {
            const res = await fetch(
              `/api/publish-blog?action=get-draft&draftId=${encodeURIComponent(draftParam)}`
            );
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.draft) {
                const d = data.draft;
                setBlog({
                  title: d.title,
                  slug: d.slug,
                  description: d.description,
                  body: d.bodyMarkdown,
                  imagePrompt: "",
                });
                setTopic(d.title);
                if (d.authorId) setAuthorId(d.authorId);
                if (d.categoryId) setCategoryId(d.categoryId);
                setSavedDraftId(draftParam);
                const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
                if (projectId) {
                  const studioBase = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || `https://${projectId}.sanity.studio`;
                  setStudioUrl(`${studioBase}/structure/insightPost;${draftParam}`);
                }
                setDraftStatus("saved");
                setLastSavedTime("loaded from Sanity");
                setView("edit");
              }
            }
          } catch (err) {
            console.error("Failed to restore draft from URL:", err);
          }
        }
      }
    }
    initPage();
  }, []);

  function applyGenerateResponse(data: any) {
    setSources(data.sources || []);
    setContextStatus(data.contextStatus || "no_sources");
    setTotalFetched(data.totalFetched || 0);
    setAfterDedup(data.afterDedup || 0);
    setWithSnippets(data.withSnippets || 0);
  }

  async function processStream(requestBody: any) {
    setStages({});
    setSerperItems([]);
    setScholarItems([]);
    setStreamedText("");
    setIsGenerating(true);
    setError("");

    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok && res.headers.get("content-type")?.includes("application/json")) {
        const errData = await res.json();
        throw new Error(errData.error || "Generation failed");
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("Response stream is unreadable");

      const decoder = new TextDecoder();
      let buffer = "";
      let completedBlog: BlogContent | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim()) continue;
          let eventType = "message";
          let dataStr = "";

          for (const line of block.split("\n")) {
            if (line.startsWith("event: ")) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.slice(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (eventType === "stage") {
              setStages((prev) => ({
                ...prev,
                [data.id]: data,
              }));
            } else if (eventType === "serper_results") {
              setSerperItems(data.items || []);
            } else if (eventType === "scholar_results") {
              setScholarItems(data.items || []);
            } else if (eventType === "context_ready") {
              applyGenerateResponse(data);
            } else if (eventType === "generation_chunk") {
              setStreamedText((prev) => prev + (data.text || ""));
            } else if (eventType === "complete") {
              completedBlog = data.blog;
              setBlog(data.blog);
              setImagePrompt(data.blog.imagePrompt);
              applyGenerateResponse(data);
              setView("edit");
              handleGenerateImage(data.blog.imagePrompt);
            } else if (eventType === "error") {
              throw new Error(data.error || "Generation failed");
            }
          } catch (e) {
            if (e instanceof Error && eventType === "error") throw e;
          }
        }
      }

      if (!completedBlog) {
        if (buffer.trim()) {
          // Attempt parsing any residual content left in buffer
          try {
            const parsed = parseCompletedMarkdown(buffer);
            setBlog(parsed);
            setImagePrompt(parsed.imagePrompt);
            setView("edit");
          } catch {
            // non-fatal fallback
          }
        } else {
          throw new Error("Pipeline terminated before blog completion");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleGenerate() {
    if (!topic.trim()) return;
    await processStream({ topic, instructions });
  }

  async function handleRegenerate() {
    if (!blog) return;
    const prevBody = blog.body;
    setRegenerateInstructions("");
    await processStream({
      topic,
      instructions,
      previousContent: {
        title: blog.title,
        description: blog.description,
        body: prevBody,
      },
      regenerateInstructions,
    });
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
    if (!blog) return;
    if (!authorId || !categoryId) {
      setError("Please select an author and category before saving or publishing.");
      return;
    }

    if (publishMode === "draft") {
      setDraftStatus("saving");
    } else {
      setIsPublishing(true);
    }
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
          bodyImages: Array.from(bodyImages.values()),
          publishMode,
          documentId: savedDraftId || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Saving failed");

      if (publishMode === "draft") {
        setSavedDraftId(data.documentId);
        setStudioUrl(data.studioUrl);
        setDraftStatus("saved");
        const formattedTime = new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
        setLastSavedTime(formattedTime);

        // Show success notification toast
        setToast({
          message: `Article saved as draft in Sanity (${formattedTime})`,
          type: "success",
          studioUrl: data.studioUrl,
        });

        // Update URL query parameter without page reload
        if (typeof window !== "undefined") {
          const newUrl = `${window.location.pathname}?draft=${encodeURIComponent(data.documentId)}`;
          window.history.replaceState(null, "", newUrl);
        }
      } else {
        setPublishResult(data);
        setView("success");
      }
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Saving failed";
      if (publishMode === "draft") {
        setDraftStatus("error");
        setToast({
          message: `Failed to save draft: ${errMsg}`,
          type: "error",
        });
      }
      setError(errMsg);
    } finally {
      if (publishMode === "publish") {
        setIsPublishing(false);
      }
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
    setSources([]);
    setContextStatus("no_sources");
    setTotalFetched(0);
    setAfterDedup(0);
    setWithSnippets(0);
    setBodyImages(new Map());
    setStages({});
    setSerperItems([]);
    setScholarItems([]);
    setStreamedText("");
    setSavedDraftId(null);
    setDraftStatus("idle");
    setLastSavedTime(null);
    setStudioUrl(null);

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 relative">
      {/* Floating Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 max-w-md px-4 py-3 rounded-2xl shadow-2xl border flex items-center gap-3 transition-all ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-700"
              : "bg-red-950 text-white border-red-800"
          }`}
        >
          <span className={`text-base font-bold ${toast.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
            {toast.type === "success" ? "✓" : "✕"}
          </span>
          <div className="flex-1 text-sm font-medium">
            <div>{toast.message}</div>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-start gap-2 shadow-sm">
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

        {/* Success View */}
        {view === "success" && publishResult ? (
          <div className="max-w-lg mx-auto text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
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
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-fuchsia-600 text-white rounded-xl text-sm font-medium hover:bg-fuchsia-700 transition-colors shadow-sm"
              >
                Open in Sanity Studio ↗
              </a>
              {!publishResult.isDraft && (
                <a
                  href={`/insights/${publishResult.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  View Post ↗
                </a>
              )}
              <button
                onClick={handleStartOver}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors py-2 font-medium"
              >
                Generate another post
              </button>
            </div>
          </div>
        ) : (
          /* 1 UNIFIED WORKSPACE LAYOUT */
          <div className="space-y-6">
            {/* Unified Pipeline Header */}
            <UnifiedPipelineHeader
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
              stages={stages}
              hasGenerated={!!blog}
            />

            {/* Continuous Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Cover Image & Sources Panel (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
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
                <SourcesPanel
                  sources={
                    sources.length > 0
                      ? sources
                      : [...scholarItems, ...serperItems]
                  }
                  contextStatus={contextStatus}
                  totalFetched={totalFetched || serperItems.length + scholarItems.length}
                  afterDedup={afterDedup || serperItems.length + scholarItems.length}
                  withSnippets={withSnippets}
                  isGenerating={isGenerating}
                />
              </div>

              {/* Right Column: Article Content Editor & Sticky Publish Bar (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                <ContentEditor
                  blog={blog}
                  setBlog={setBlog}
                  authorId={authorId}
                  setAuthorId={setAuthorId}
                  categoryId={categoryId}
                  setCategoryId={setCategoryId}
                  authors={authors}
                  categories={categories}
                  bodyImages={bodyImages}
                  onInsertImage={handleInsertBodyImage}
                  onRemoveImage={handleRemoveBodyImage}
                  isGeneratingBodyImage={isGeneratingBodyImage}
                  onGenerateBodyImage={handleGenerateBodyImage}
                  isGenerating={isGenerating}
                  streamedText={streamedText}
                />

                {(blog || isGenerating) && (
                  <PublishBar
                    isPublishing={isPublishing}
                    isGenerating={isGenerating}
                    draftStatus={draftStatus}
                    lastSavedTime={lastSavedTime}
                    studioUrl={studioUrl}
                    regenerateInstructions={regenerateInstructions}
                    setRegenerateInstructions={setRegenerateInstructions}
                    onPublish={() => handlePublish("publish")}
                    onDraft={() => handlePublish("draft")}
                    onRegenerate={handleRegenerate}
                    onStartOver={handleStartOver}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
