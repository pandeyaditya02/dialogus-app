# RAG-Enhanced Article Generation Pipeline — Changes

## Summary

Enhanced the article generation pipeline with a RAG (Retrieval-Augmented Generation) system. The system now fetches real-time news via Google News RSS (primary) and Serper API (optional secondary), processes/deduplicates/ranks results, builds structured context, and injects it into Gemini's prompt so articles are grounded in real facts. A new Sources Panel in the admin UI shows which sources grounded the article.

## New Environment Variable

```
SERPER_API_KEY=...    # Optional — enables Serper as secondary news source
```

No new npm dependencies were added.

---

## Files Changed

### 1. `dialogus-next/lib/news-fetcher.ts` — CREATED

Google News RSS fetcher. Fetches headlines from `news.google.com/rss/search`, parses XML with regex, decodes HTML entities, extracts title/link/source/pubDate. 5-second timeout, returns empty array on failure.

```typescript
export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function extractTag(xml: string, tag: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`));
  return match ? match[1].trim() : "";
}

function extractTagAttribute(xml: string, tag: string, attr: string): string {
  const match = xml.match(new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, "i"));
  return match ? match[1].trim() : "";
}

export async function fetchGoogleNews(topic: string): Promise<NewsItem[]> {
  const encoded = encodeURIComponent(topic);
  const url = `https://news.google.com/rss/search?q=${encoded}&hl=en-IN&gl=IN&ceid=IN:en`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Dialogus/1.0 (news aggregator)" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const xml = await res.text();

    const items: NewsItem[] = [];
    const itemBlocks = xml.match(/<item>[\s\S]*?<\/item>/g) || [];

    for (const block of itemBlocks) {
      const title = decodeHtmlEntities(extractTag(block, "title"));
      const link = extractTag(block, "link") || extractTagAttribute(block, "link", "href");
      const source = extractTag(block, "source") || extractTagAttribute(block, "source", "url");
      const pubDate = extractTag(block, "pubDate");

      if (title && link) {
        items.push({ title, link, source, pubDate });
      }
    }

    return items;
  } catch {
    return [];
  }
}
```

---

### 2. `dialogus-next/lib/serper-fetcher.ts` — CREATED

Optional Serper API news fetcher. Only activates when `SERPER_API_KEY` env var is set. Returns the same `NewsItem` interface for seamless merging. Returns empty array silently if no key or on error.

```typescript
import type { NewsItem } from "./news-fetcher";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function fetchSerperNews(topic: string): Promise<NewsItem[]> {
  if (!SERPER_API_KEY) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const res = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: topic, num: 10 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const articles: Array<{
      title?: string;
      link?: string;
      source?: string;
      date?: string;
    }> = data.news || [];

    return articles
      .filter((a) => a.title && a.link)
      .map((a) => ({
        title: a.title!,
        link: a.link!,
        source: a.source || "",
        pubDate: a.date || "",
      }));
  } catch {
    return [];
  }
}
```

---

### 3. `dialogus-next/lib/context-builder.ts` — CREATED

Processing layer that merges results from both fetchers, deduplicates using Jaccard similarity on word sets (70% threshold), scores by recency + topic-keyword relevance, selects top 8 items, and formats a structured `[CONTEXT]` string for the LLM.

```typescript
import type { NewsItem } from "./news-fetcher";

export interface ContextResult {
  contextString: string;
  sources: NewsItem[];
  totalFetched: number;
  afterDedup: number;
}

function normalizeTitle(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 2)
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  let intersection = 0;
  for (const word of a) {
    if (b.has(word)) intersection++;
  }
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

function deduplicate(items: NewsItem[], threshold = 0.7): NewsItem[] {
  const kept: NewsItem[] = [];
  const keptSets: Set<string>[] = [];

  for (const item of items) {
    const words = normalizeTitle(item.title);
    const isDuplicate = keptSets.some(
      (existing) => jaccardSimilarity(words, existing) >= threshold
    );
    if (!isDuplicate) {
      kept.push(item);
      keptSets.push(words);
    }
  }

  return kept;
}

function scoreItem(item: NewsItem, topicWords: Set<string>): number {
  let score = 0;

  const parsed = Date.parse(item.pubDate);
  if (!isNaN(parsed)) {
    const ageHours = (Date.now() - parsed) / (1000 * 60 * 60);
    score += Math.max(0, 100 - ageHours);
  }

  const titleWords = normalizeTitle(item.title);
  for (const word of topicWords) {
    if (titleWords.has(word)) score += 15;
  }

  return score;
}

export function buildContext(
  topic: string,
  ...sourceLists: NewsItem[][]
): ContextResult {
  const merged = sourceLists.flat();
  const totalFetched = merged.length;

  if (totalFetched === 0) {
    return { contextString: "", sources: [], totalFetched: 0, afterDedup: 0 };
  }

  const deduped = deduplicate(merged);
  const afterDedup = deduped.length;

  const topicWords = normalizeTitle(topic);
  const ranked = deduped
    .map((item) => ({ item, score: scoreItem(item, topicWords) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((r) => r.item);

  const lines = ranked.map((item, i) => {
    const parts = [`${i + 1}. "${item.title}"`];
    if (item.source) parts[0] += ` — ${item.source}`;
    if (item.pubDate) parts[0] += `, ${item.pubDate}`;
    parts.push(`   URL: ${item.link}`);
    return parts.join("\n");
  });

  const contextString = `[CONTEXT — Real-time news sources for: "${topic}"]\n\n${lines.join("\n\n")}`;

  return { contextString, sources: ranked, totalFetched, afterDedup };
}
```

---

### 4. `dialogus-next/lib/ai-blog-generator.ts` — MODIFIED

Added `context` parameter to `GenerateOptions`. Three prompt modes: `GROUNDED_SYSTEM_PROMPT` (when context is available — anti-hallucination rules, source attribution), `FALLBACK_SYSTEM_PROMPT` (when no sources found — transparency about limitations), and updated `REGENERATE_SYSTEM_PROMPT` (passes context during revisions too).

```typescript
import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;
const MODEL_NAME = "gemini-3-flash-preview";

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

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
  context?: string | null;
  previousContent?: {
    title: string;
    description: string;
    body: string;
  } | null;
  regenerateInstructions?: string | null;
}

const GROUNDED_SYSTEM_PROMPT = `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Your task is to write a complete blog article using ONLY the real-time news context provided. Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters. Front-load with keywords.",
  "body": "Full article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image for this article"
}

Article requirements:
- Length: Exactly 500 words
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion
- Tone: Analytical, data-driven, journalistic. Not sensational, not academic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for notable quotes, - for bullet lists, [text](url) for links
- Never use H1 (#) — the title is rendered separately
- Write in a way that is accessible to educated general readers

Grounding rules:
- Base ALL claims, facts, and data points on the provided [CONTEXT] section
- Do NOT add external knowledge beyond what is in the context
- Do NOT hallucinate facts, statistics, quotes, or data points
- If information is insufficient for a section, state "Details on this are not yet available"
- Where possible, reference the news source (e.g., "according to Reuters…", "as reported by The Hindu…")

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;

const FALLBACK_SYSTEM_PROMPT = `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Your task is to write a complete blog article. Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters. Front-load with keywords.",
  "body": "Full article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image for this article"
}

Article requirements:
- Length: Exactly 500 words
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion
- Tone: Analytical, data-driven, journalistic. Not sensational, not academic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for notable quotes, - for bullet lists, [text](url) for links
- Never use H1 (#) — the title is rendered separately
- Include specific data points, dates, and factual references where possible
- Write in a way that is accessible to educated general readers
- NOTE: No real-time news sources were available for this topic. Be transparent about this — avoid presenting speculative information as fact.

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

Regeneration requirements:
- Length: Exactly 500 words (maintain this limit during revisions)
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion
- Use markdown formatting as specified in the original article instructions.
- Continue to ground claims in the provided context where available.

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;

export async function generateBlog(
  options: GenerateOptions
): Promise<GeneratedBlog> {
  const isRegeneration =
    options.previousContent && options.regenerateInstructions;
  const hasContext = !!options.context?.trim();

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

${hasContext ? `## Source Context\n${options.context}` : ""}

Please revise the article based on the editor's feedback.`;
  } else {
    systemPrompt = hasContext ? GROUNDED_SYSTEM_PROMPT : FALLBACK_SYSTEM_PROMPT;

    if (hasContext) {
      userMessage = `${options.context}

[TOPIC]
${options.topic}`;
    } else {
      userMessage = `Write a blog article about: ${options.topic}`;
    }

    if (options.instructions) {
      userMessage += `\n\nAdditional instructions from the editor:\n${options.instructions}`;
    }
  }

  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userMessage }] }],
    generationConfig: {
      maxOutputTokens: 16384,
      temperature: 0.7,
      responseMimeType: "application/json",
    },
  });

  const response = await result.response;
  const content = response.text();
  const candidate = result.response.candidates?.[0];

  if (candidate?.finishReason === "MAX_TOKENS" && !content?.trim()) {
    throw new Error( 
      "The AI response was cut off before completing. Try a shorter or more specific topic."
    );
  }

  if (!content) {
    throw new Error("No content in Gemini response");
  }

  let jsonStr = content.trim();
  
  const start = jsonStr.indexOf("{");
  const end = jsonStr.lastIndexOf("}");
  
  if (start !== -1 && end !== -1) {
    jsonStr = jsonStr.substring(start, end + 1);
  }

  try {
    const blog: GeneratedBlog = JSON.parse(jsonStr);
    
    if (!blog.title || !blog.slug || !blog.description || !blog.body) {
      throw new Error("Incomplete blog generated — missing required fields");
    }
    
    if (blog.description.length > 200) {
      blog.description = blog.description.slice(0, 197) + "...";
    }
    
    return blog;
  } catch (e) {
    console.error("Failed to parse AI response:", jsonStr);
    const errorMsg = e instanceof Error ? e.message : "Invalid JSON";
    throw new Error(`AI generated invalid JSON: ${errorMsg}. Please try again.`);
  }
}
```

---

### 5. `dialogus-next/app/api/generate-blog/route.ts` — MODIFIED

Now orchestrates the full RAG pipeline: fetches Google News RSS + Serper in parallel via `Promise.allSettled`, builds context via `buildContext()`, passes the context string to `generateBlog()`, and returns `sources`, `contextStatus`, `totalFetched`, `afterDedup` alongside the blog in the API response.

```typescript
import { NextRequest, NextResponse } from "next/server";
import { generateBlog } from "@/lib/ai-blog-generator";
import { fetchGoogleNews } from "@/lib/news-fetcher";
import { fetchSerperNews } from "@/lib/serper-fetcher";
import { buildContext } from "@/lib/context-builder";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, instructions, previousContent, regenerateInstructions } = body;

    const clean = (val: any) => 
      typeof val === "string" ? (val.trim() || null) : val;

    const cleanedTopic = clean(topic);
    if (!cleanedTopic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const [rssResult, serperResult] = await Promise.allSettled([
      fetchGoogleNews(cleanedTopic),
      fetchSerperNews(cleanedTopic),
    ]);

    const rssItems = rssResult.status === "fulfilled" ? rssResult.value : [];
    const serperItems = serperResult.status === "fulfilled" ? serperResult.value : [];

    const contextResult = buildContext(cleanedTopic, rssItems, serperItems);

    const contextStatus: "grounded" | "no_sources" =
      contextResult.sources.length > 0 ? "grounded" : "no_sources";

    const blog = await generateBlog({
      topic: cleanedTopic,
      instructions: clean(instructions) || undefined,
      context: contextResult.contextString || null,
      previousContent: previousContent || null,
      regenerateInstructions: clean(regenerateInstructions) || null,
    });

    return NextResponse.json({
      success: true,
      blog,
      sources: contextResult.sources,
      contextStatus,
      totalFetched: contextResult.totalFetched,
      afterDedup: contextResult.afterDedup,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### 6. `dialogus-next/app/admin/generate/components/SourcesPanel.tsx` — CREATED

Collapsible UI panel in the edit view showing a "Grounded" / "No live sources" status badge, source count stats (e.g., "8 sources used from 15 fetched"), and a scrollable list of source cards (title, publisher, date, clickable link). Matches the existing design system.

```tsx
"use client";

import { useState } from "react";

interface NewsSource {
  title: string;
  link: string;
  source: string;
  pubDate: string;
}

interface SourcesPanelProps {
  sources: NewsSource[];
  contextStatus: "grounded" | "no_sources";
  totalFetched: number;
  afterDedup: number;
}

export default function SourcesPanel({
  sources,
  contextStatus,
  totalFetched,
  afterDedup,
}: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          News Sources
        </h2>
        <div className="flex items-center gap-2">
          {contextStatus === "grounded" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Grounded
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              No live sources
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {sources.length > 0 && (
            <p className="text-[11px] text-gray-400">
              {sources.length} sources used from {totalFetched} fetched ({afterDedup} after dedup)
            </p>
          )}

          {sources.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">
              No real-time news sources were found for this topic. The article was generated using the AI model&apos;s general knowledge.
            </p>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {sources.map((s, i) => (
                <li
                  key={i}
                  className="p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <p className="text-xs font-medium text-gray-800 group-hover:text-fuchsia-600 transition-colors leading-snug">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {s.source && (
                        <span className="text-[10px] text-gray-500">
                          {s.source}
                        </span>
                      )}
                      {s.source && s.pubDate && (
                        <span className="text-gray-300">·</span>
                      )}
                      {s.pubDate && (
                        <span className="text-[10px] text-gray-400">
                          {s.pubDate}
                        </span>
                      )}
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 7. `dialogus-next/app/admin/generate/page.tsx` — MODIFIED

Added state variables for RAG sources (`sources`, `contextStatus`, `totalFetched`, `afterDedup`). Added `applyGenerateResponse()` helper to extract source metadata from the API response. Wired up the new `SourcesPanel` component in the edit view's right column (below ImagePreview). Sources update on both generate and regenerate, and reset on "Start Over".

```tsx
"use client";

import { useState, useEffect } from "react";
import GenerateForm from "./components/GenerateForm";
import ContentEditor from "./components/ContentEditor";
import ImagePreview from "./components/ImagePreview";
import PublishBar from "./components/PublishBar";
import SourcesPanel from "./components/SourcesPanel";

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

  // RAG sources state
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [contextStatus, setContextStatus] = useState<"grounded" | "no_sources">("no_sources");
  const [totalFetched, setTotalFetched] = useState(0);
  const [afterDedup, setAfterDedup] = useState(0);

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
  }

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
      applyGenerateResponse(data);
      setView("edit");

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
      applyGenerateResponse(data);
      setRegenerateInstructions("");

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
    setSources([]);
    setContextStatus("no_sources");
    setTotalFetched(0);
    setAfterDedup(0);
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
              <div className="space-y-6">
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
```
