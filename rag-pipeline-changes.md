# RAG Pipeline Improvements — Change Log

This document captures all changes made to enhance the RAG (Retrieval-Augmented Generation) article-generation pipeline. The improvements address gaps around context richness, prompt design, ranking quality, and editor transparency.

## Summary of Changes

| Area | Improvement |
|------|-------------|
| Context | Snippets now extracted from both Google News RSS `<description>` and Serper `snippet` fields, replacing headlines-only context |
| Ranking | Stop-word set replaces length-based filtering, preserving short keywords like `AI`, `EU`, `US`, `UK` |
| Prompt | Today's date injected; word count loosened to 450-650; strict-vs-lenient grounding modes based on snippet coverage |
| Output | Required `## Sources` section with markdown citations |
| UI | `SourcesPanel` shows snippet text and `withSnippets/total · grounding mode` sub-stat |

## Architecture (after changes)

```
Topic
  ├── Google News RSS  →  title + description + meta
  └── Serper /news     →  title + snippet + meta
                              │
                              ▼
                    Merge → Dedup (Jaccard 0.7)
                              │
                              ▼
              Rank (recency + keyword overlap, stop-words filtered)
                              │
                              ▼
        Build context (numbered, with snippet, source, date, URL)
                              │
                              ▼
   Grounded prompt (today's date, length range, sources section, mode)
                              │
                              ▼
                            Gemini
                              │
                              ▼
                  Article + ## Sources citation list
```

---

## File 1: `dialogus-next/lib/news-fetcher.ts`

**What changed:**
- Added optional `snippet?: string` to `NewsItem`
- Added `cleanDescription()` helper that strips HTML, decodes entities, drops if equals title, caps at ~300 chars on a word boundary
- Extended `decodeHtmlEntities()` to handle `&nbsp;` and numeric character references (`&#NNN;`)
- RSS parser now extracts `<description>` and produces a cleaned snippet for each item

**Final file content:**

```typescript
export interface NewsItem {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet?: string;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function cleanDescription(raw: string, title: string): string | undefined {
  if (!raw) return undefined;

  const stripped = raw
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const decoded = decodeHtmlEntities(stripped).trim();

  if (!decoded) return undefined;

  if (decoded.toLowerCase() === title.toLowerCase()) return undefined;

  if (decoded.length <= 300) return decoded;

  const truncated = decoded.slice(0, 300);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 200 ? truncated.slice(0, lastSpace) : truncated) + "...";
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
      const description = extractTag(block, "description");
      const snippet = cleanDescription(description, title);

      if (title && link) {
        items.push({ title, link, source, pubDate, snippet });
      }
    }

    return items;
  } catch {
    return [];
  }
}
```

---

## File 2: `dialogus-next/lib/serper-fetcher.ts`

**What changed:**
- Added `snippet?: string` to the response type
- Now passes Serper's `snippet` field through with the same de-dup-vs-title and 300-char cap rules

**Final file content:**

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
      snippet?: string;
    }> = data.news || [];

    return articles
      .filter((a) => a.title && a.link)
      .map((a) => {
        const rawSnippet = (a.snippet || "").trim();
        const snippet =
          rawSnippet && rawSnippet.toLowerCase() !== a.title!.toLowerCase()
            ? rawSnippet.length > 300
              ? rawSnippet.slice(0, 300).replace(/\s+\S*$/, "") + "..."
              : rawSnippet
            : undefined;
        return {
          title: a.title!,
          link: a.link!,
          source: a.source || "",
          pubDate: a.date || "",
          snippet,
        };
      });
  } catch {
    return [];
  }
}
```

---

## File 3: `dialogus-next/lib/context-builder.ts`

**What changed:**
- Replaced the `length > 2` filter with a `STOP_WORDS` set so short keywords like `AI`, `EU`, `US`, `UK`, `UN` survive
- Added `withSnippets: number` to `ContextResult`
- Snippets now feed into ranking (small score boost) and into the rendered context string
- Context string now starts with a header explaining snippet coverage and how to treat headline-only sources

**Final file content:**

```typescript
import type { NewsItem } from "./news-fetcher";

export interface ContextResult {
  contextString: string;
  sources: NewsItem[];
  totalFetched: number;
  afterDedup: number;
  withSnippets: number;
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "from", "this", "that", "into", "over",
  "are", "was", "were", "has", "have", "had", "new", "old", "not", "but",
  "all", "any", "you", "your", "our", "its", "their", "what", "when",
  "where", "why", "how", "who", "whom", "which", "than", "then", "also",
  "about", "after", "before", "between", "during", "under", "above",
  "more", "most", "some", "such", "only", "very", "just", "they", "them",
  "these", "those", "would", "could", "should", "will", "shall", "may",
  "might", "must", "can", "did", "does", "done", "been", "being",
]);

function normalizeTitle(title: string): Set<string> {
  return new Set(
    title
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 0 && !STOP_WORDS.has(w))
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

  if (item.snippet) {
    score += 10;
    const snippetWords = normalizeTitle(item.snippet);
    for (const word of topicWords) {
      if (snippetWords.has(word)) score += 5;
    }
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
    return {
      contextString: "",
      sources: [],
      totalFetched: 0,
      afterDedup: 0,
      withSnippets: 0,
    };
  }

  const deduped = deduplicate(merged);
  const afterDedup = deduped.length;

  const topicWords = normalizeTitle(topic);
  const ranked = deduped
    .map((item) => ({ item, score: scoreItem(item, topicWords) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((r) => r.item);

  const withSnippets = ranked.filter((item) => !!item.snippet).length;

  const blocks = ranked.map((item, i) => {
    const headerParts = [`${i + 1}. "${item.title}"`];
    if (item.source) headerParts[0] += ` — ${item.source}`;
    if (item.pubDate) headerParts[0] += `, ${item.pubDate}`;

    const lines = [headerParts[0]];
    if (item.snippet) {
      lines.push(`   Snippet: ${item.snippet}`);
    }
    lines.push(`   URL: ${item.link}`);
    return lines.join("\n");
  });

  const header =
    `[CONTEXT — Real-time news sources for: "${topic}"]\n` +
    `Sources with snippets: ${withSnippets}/${ranked.length}. ` +
    `Use the snippet text as the primary factual basis. Where only a headline is provided, treat it as a topical signal, not a factual claim.\n`;

  const contextString = `${header}\n${blocks.join("\n\n")}`;

  return {
    contextString,
    sources: ranked,
    totalFetched,
    afterDedup,
    withSnippets,
  };
}
```

---

## File 4: `dialogus-next/lib/ai-blog-generator.ts`

**What changed:**
- `GenerateOptions` now accepts `todayDate: string` and `withSnippets?: number`
- Old static `GROUNDED_SYSTEM_PROMPT` / `FALLBACK_SYSTEM_PROMPT` / `REGENERATE_SYSTEM_PROMPT` constants replaced by builder functions that bake in the date and grounding mode
- Word count loosened from "Exactly 500" to "Approximately 500 (range 450-650)"
- New **strict mode** clause when `withSnippets >= 3`: no facts allowed outside snippets
- New **lenient mode** clause when `withSnippets < 3`: background knowledge allowed but inferred statements must be marked
- Required `## Sources` section appended to grounded articles, citing only entries from `[CONTEXT]`
- `Today's date: {todayDate}` injected into the user message for both grounded and fallback paths

**Final file content:**

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
  todayDate?: string;
  withSnippets?: number;
  previousContent?: {
    title: string;
    description: string;
    body: string;
  } | null;
  regenerateInstructions?: string | null;
}

const STRICT_GROUNDING_CLAUSE = `Grounding rules (STRICT MODE — multiple sources have snippets):
- Base ALL factual claims, statistics, names, dates, and quotes ONLY on the snippet text inside [CONTEXT]
- Do NOT introduce facts, statistics, or quotes that are not present in the snippets
- Do NOT use general knowledge to invent specifics; if a snippet doesn't mention it, it doesn't go in the article
- Where a section lacks supporting snippet detail, write "Details on this aspect have not been reported yet" rather than fabricating
- Where possible, attribute claims inline (e.g., "according to Reuters…", "as reported by The Hindu…")`;

const LENIENT_GROUNDING_CLAUSE = `Grounding rules (LENIENT MODE — sources are mostly headline-only):
- Use the headlines and any available snippets as the topical anchor for what the article is about
- You MAY use general background knowledge to provide context, definitions, and historical framing
- Mark inferred or background statements explicitly with phrases like "Generally, ...", "Historically, ...", "Background: ..."
- Do NOT fabricate specific statistics, dates, names, or quotes that are not in the snippets/headlines
- Be transparent: if a section requires information not in [CONTEXT], say so rather than inventing details`;

function buildGroundedSystemPrompt(todayDate: string, withSnippets: number): string {
  const groundingClause =
    withSnippets >= 3 ? STRICT_GROUNDING_CLAUSE : LENIENT_GROUNDING_CLAUSE;

  return `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Today's date is ${todayDate}. Frame the article in this temporal context — readers are reading it today, so use present/recent tense for ongoing events and clearly mark anything from the past.

Your task is to write a complete blog article using the real-time news context provided. Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters. Front-load with keywords.",
  "body": "Full article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image for this article"
}

Article requirements:
- Length: Approximately 500 words (acceptable range: 450-650). Prioritise substance over hitting a precise count.
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion, then a final "## Sources" section
- Tone: Analytical, data-driven, journalistic. Not sensational, not academic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for notable quotes, - for bullet lists, [text](url) for links
- Never use H1 (#) — the title is rendered separately
- Write in a way that is accessible to educated general readers

${groundingClause}

Sources section (REQUIRED):
- End the article with a "## Sources" H2 heading
- Underneath, list a numbered markdown list of ONLY the sources you actually drew from in the article
- Format: "1. [Title of article](URL) — Source name"
- Only include sources whose URLs and titles appear in [CONTEXT] above. Do not invent links.

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;
}

function buildFallbackSystemPrompt(todayDate: string): string {
  return `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Today's date is ${todayDate}. Frame the article in this temporal context.

Your task is to write a complete blog article. Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters. Front-load with keywords.",
  "body": "Full article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image for this article"
}

Article requirements:
- Length: Approximately 500 words (acceptable range: 450-650).
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion
- Tone: Analytical, data-driven, journalistic. Not sensational, not academic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for notable quotes, - for bullet lists, [text](url) for links
- Never use H1 (#) — the title is rendered separately
- Write in a way that is accessible to educated general readers

NO LIVE SOURCES MODE:
- No real-time news sources were available for this topic
- Be transparent: avoid presenting speculative information as fact
- Use general background knowledge but do NOT invent specific statistics, dates, names, or quotes
- Frame uncertain content with phrases like "Historically, ...", "Generally, ...", "It is widely reported that ..."
- Do NOT include a "## Sources" section, since there are none to cite

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;
}

function buildRegenerateSystemPrompt(todayDate: string, hasContext: boolean, withSnippets: number): string {
  const groundingNote = hasContext
    ? withSnippets >= 3
      ? "\n- All factual claims must remain grounded in the [CONTEXT] snippets. Do not introduce new facts, statistics, or quotes that are not present there."
      : "\n- Use [CONTEXT] as the topical anchor. You may use general background knowledge for context, but mark inferred statements and do not fabricate specifics."
    : "\n- No live sources are available. Avoid inventing specifics; be transparent about uncertainty.";

  const sourcesNote = hasContext
    ? "\n- Preserve or update the final \"## Sources\" section using only entries from [CONTEXT]."
    : "";

  return `You are a senior editorial writer for Dialogus, a digital media platform. You are revising a previously generated article based on editor feedback.

Today's date is ${todayDate}.

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
- Length: Approximately 500 words (acceptable range: 450-650). Maintain this loosely during revisions.
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion
- Use markdown formatting as specified in the original article instructions${groundingNote}${sourcesNote}

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;
}

export async function generateBlog(
  options: GenerateOptions
): Promise<GeneratedBlog> {
  const isRegeneration =
    options.previousContent && options.regenerateInstructions;
  const hasContext = !!options.context?.trim();
  const withSnippets = options.withSnippets ?? 0;

  const todayDate =
    options.todayDate ||
    new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  let userMessage: string;
  let systemPrompt: string;

  if (isRegeneration) {
    systemPrompt = buildRegenerateSystemPrompt(todayDate, hasContext, withSnippets);
    userMessage = `## Previous Article

**Title:** ${options.previousContent!.title}

**Description:** ${options.previousContent!.description}

**Body:**
${options.previousContent!.body}

## Editor Feedback
${options.regenerateInstructions}

${options.instructions ? `## Additional Instructions\n${options.instructions}` : ""}

${hasContext ? `## Source Context\n${options.context}` : ""}

Today's date: ${todayDate}

Please revise the article based on the editor's feedback.`;
  } else {
    systemPrompt = hasContext
      ? buildGroundedSystemPrompt(todayDate, withSnippets)
      : buildFallbackSystemPrompt(todayDate);

    if (hasContext) {
      userMessage = `${options.context}

[TOPIC]
${options.topic}

Today's date: ${todayDate}`;
    } else {
      userMessage = `Write a blog article about: ${options.topic}

Today's date: ${todayDate}`;
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

## File 5: `dialogus-next/app/api/generate-blog/route.ts`

**What changed:**
- Computes `todayDate` server-side using `en-GB` locale (e.g. `"3 May 2026"`)
- Forwards `todayDate` and `contextResult.withSnippets` to `generateBlog`
- Includes `withSnippets` in the JSON response so the UI can show grounding strength

**Final file content:**

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

    const todayDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const blog = await generateBlog({
      topic: cleanedTopic,
      instructions: clean(instructions) || undefined,
      context: contextResult.contextString || null,
      todayDate,
      withSnippets: contextResult.withSnippets,
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
      withSnippets: contextResult.withSnippets,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

## File 6: `dialogus-next/app/admin/generate/components/SourcesPanel.tsx`

**What changed:**
- Extended `NewsSource` with optional `snippet?: string`
- Added `withSnippets: number` to `SourcesPanelProps`
- Added a sub-stat line below the existing "X sources used from Y fetched" showing `withSnippets/total · strict|lenient grounding`, with green for >=3 snippets and amber otherwise
- Each source card now renders the snippet (line-clamped to 3 lines, muted, with `title` tooltip showing full text)

**Final file content:**

```tsx
"use client";

import { useState } from "react";

interface NewsSource {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet?: string;
}

interface SourcesPanelProps {
  sources: NewsSource[];
  contextStatus: "grounded" | "no_sources";
  totalFetched: number;
  afterDedup: number;
  withSnippets: number;
}

export default function SourcesPanel({
  sources,
  contextStatus,
  totalFetched,
  afterDedup,
  withSnippets,
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
            <div className="space-y-1">
              <p className="text-[11px] text-gray-400">
                {sources.length} sources used from {totalFetched} fetched ({afterDedup} after dedup)
              </p>
              <p className="text-[11px] text-gray-400">
                <span
                  className={
                    withSnippets >= 3
                      ? "text-green-600 font-medium"
                      : "text-amber-600 font-medium"
                  }
                >
                  {withSnippets}/{sources.length}
                </span>{" "}
                with snippets ·{" "}
                {withSnippets >= 3 ? "strict grounding" : "lenient grounding"}
              </p>
            </div>
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
                    {s.snippet && (
                      <p
                        className="mt-1.5 text-[11px] text-gray-500 leading-relaxed line-clamp-3"
                        title={s.snippet}
                      >
                        {s.snippet}
                      </p>
                    )}
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

## File 7: `dialogus-next/app/admin/generate/page.tsx`

**What changed (targeted diffs):**

- `NewsSource` interface gained `snippet?: string`
- New state: `const [withSnippets, setWithSnippets] = useState(0);`
- `applyGenerateResponse` now captures `data.withSnippets`
- `handleStartOver` resets `withSnippets`
- `<SourcesPanel>` now receives `withSnippets={withSnippets}`

**Diffs:**

```tsx
// Interface update
interface NewsSource {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet?: string;
}
```

```tsx
// State (added line)
const [withSnippets, setWithSnippets] = useState(0);
```

```tsx
// applyGenerateResponse
function applyGenerateResponse(data: any) {
  setSources(data.sources || []);
  setContextStatus(data.contextStatus || "no_sources");
  setTotalFetched(data.totalFetched || 0);
  setAfterDedup(data.afterDedup || 0);
  setWithSnippets(data.withSnippets || 0);
}
```

```tsx
// handleStartOver (added line)
setWithSnippets(0);
```

```tsx
// SourcesPanel render
<SourcesPanel
  sources={sources}
  contextStatus={contextStatus}
  totalFetched={totalFetched}
  afterDedup={afterDedup}
  withSnippets={withSnippets}
/>
```

---

## Validation Checklist

1. Generate an article on a current topic (e.g., "RBI monetary policy May 2026"). Verify:
   - The `[CONTEXT]` block in the prompt contains `Snippet:` lines under most entries
   - The generated article references sources via "according to [Source]" patterns
   - The article ends with a `## Sources` markdown list of `[Title](URL) — Source` items
2. Generate on a niche topic with few RSS hits. Verify lenient mode kicks in (sub-stat shows amber `0/N` or `1/N · lenient grounding`) and the article uses "Generally..." / "Historically..." rather than fabricating specifics.
3. Generate on a topic with short keywords (e.g., "AI EU regulation"). Verify ranking surfaces relevant items rather than burying them; previously these would be dropped from the keyword set.
4. Confirm the SourcesPanel:
   - Renders snippet text (line-clamped to 3 lines) under each source card
   - Shows the `X/Y with snippets · strict|lenient grounding` sub-stat with green/amber color

## Out of Scope (Per User's Choices)

- Full article body scraping (Jina Reader / custom HTML fetch) — skipped
- Caching news results per topic — skipped
