"use client";

import { useState, useEffect, useCallback } from "react";
import GenerateForm from "./components/GenerateForm";
import ContentEditor from "./components/ContentEditor";
import ImagePreview from "./components/ImagePreview";
import PublishBar from "./components/PublishBar";
import SourcesPanel from "./components/SourcesPanel";
import ProgressIndicator, { StageStatus } from "./components/ProgressIndicator";
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
        throw new Error("Pipeline terminated before blog completion");
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
          bodyImages: Array.from(bodyImages.values()),
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
  }

  return (
    <div className="min-h-screen">
      <main className="max-w-6xl mx-auto px-6 py-10">
        {/* Error banner */}
        {error && !isGenerating && (
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

        {/* Progress Indicator View during live generation */}
        {isGenerating && (
          <ProgressIndicator
            topic={topic}
            stages={stages}
            serperItems={serperItems}
            scholarItems={scholarItems}
            streamedText={streamedText}
            error={error}
          />
        )}

        {/* Input view */}
        {!isGenerating && view === "input" && (
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
        {!isGenerating && view === "edit" && blog && (
          <div className="space-y-8">
            {/* Topic banner */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-fuchsia-500" />
              <p className="text-[10px] font-bold text-fuchsia-600 uppercase tracking-widest mb-1">Generating article for:</p>
              <h1 className="text-xl font-bold text-gray-900">{topic}</h1>
            </div>

            {/* Horizontal row for Cover and Sources */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                sources={sources}
                contextStatus={contextStatus}
                totalFetched={totalFetched}
                afterDedup={afterDedup}
                withSnippets={withSnippets}
              />
            </div>

            {/* Full-width Content Editor */}
            <div className="w-full">
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
              />
            </div>

            {/* Sticky Publish Bar */}
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
