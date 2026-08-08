import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;
const MODEL_PRIMARY = "gemini-3.5-flash-lite";
const MODEL_FALLBACK = "gemini-3.1-flash-lite";

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

/** Returns true if the error is a transient 503 / overload error from Google AI. */
function is503Error(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.message.includes("503") ||
      err.message.toLowerCase().includes("service unavailable") ||
      err.message.toLowerCase().includes("high demand")
    );
  }
  return false;
}

/**
 * Calls `fn` up to `maxAttempts` times with exponential backoff.
 * On a 503, switches to the fallback model for the remaining attempts.
 */
async function withRetry<T>(
  fn: (modelName: string) => Promise<T>,
  maxAttempts = 3
): Promise<T> {
  let modelName = MODEL_PRIMARY;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn(modelName);
    } catch (err) {
      const isLast = attempt === maxAttempts;
      if (is503Error(err) && !isLast) {
        const delayMs = 1000 * Math.pow(2, attempt - 1); // 1s, 2s, 4s…
        console.warn(
          `[AI] 503 on attempt ${attempt} with model "${modelName}". ` +
          `Switching to fallback "${MODEL_FALLBACK}" and retrying in ${delayMs}ms…`
        );
        modelName = MODEL_FALLBACK;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      } else {
        throw err;
      }
    }
  }
  // TypeScript: unreachable, but satisfies return type
  throw new Error("withRetry: exhausted all attempts");
}

export interface GeneratedBlog {
  title: string;
  slug: string;
  description: string;
  body: string;
  imagePrompt: string;
}

export interface GenerateOptions {
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

const MARKDOWN_HEADER_INSTRUCTIONS = `Write the response as a clean Markdown document.

Start your response with metadata formatted exactly like this:

# [SEO-optimized headline, 50-70 characters]

> **Description:** [A compelling summary for SEO and social previews, max 200 characters]
> **Image Prompt:** [A descriptive prompt for generating a cover image]

Then write the article body:
- Approximately 500 words (acceptable range: 450-650).
- Structure: Introduction paragraph, 3 sections with H2 headings (##), conclusion
- Tone: Analytical, data-driven, journalistic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for quotes, - for bullet lists, [text](url) for links
- Do not use H1 (#) inside the article body — only the top title headline uses #`;

function buildGroundedSystemPrompt(todayDate: string, withSnippets: number): string {
  const groundingClause =
    withSnippets >= 3 ? STRICT_GROUNDING_CLAUSE : LENIENT_GROUNDING_CLAUSE;

  return `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Today's date is ${todayDate}. Frame the article in this temporal context — readers are reading it today, so use present/recent tense for ongoing events and clearly mark anything from the past.

${MARKDOWN_HEADER_INSTRUCTIONS}

${groundingClause}

Sources section (REQUIRED):
- End the article with a "## Sources" H2 heading
- Underneath, list a numbered markdown list of ONLY the sources you actually drew from in the article
- Format: "1. [Title of article](URL) — Source name"
- Only include sources whose URLs and titles appear in [CONTEXT] above. Do not invent links.`;
}

function buildFallbackSystemPrompt(todayDate: string): string {
  return `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Today's date is ${todayDate}. Frame the article in this temporal context.

${MARKDOWN_HEADER_INSTRUCTIONS}

NO LIVE SOURCES MODE:
- No real-time news sources were available for this topic
- Be transparent: avoid presenting speculative information as fact
- Use general background knowledge but do NOT invent specific statistics, dates, names, or quotes
- Frame uncertain content with phrases like "Historically, ...", "Generally, ...", "It is widely reported that ..."
- Do NOT include a "## Sources" section, since there are none to cite`;
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

${MARKDOWN_HEADER_INSTRUCTIONS}${groundingNote}${sourcesNote}`;
}

export function parseCompletedMarkdown(markdownText: string): GeneratedBlog {
  let title = "";
  let description = "";
  let imagePrompt = "";
  let body = markdownText.trim();

  // Extract H1 title (# Title)
  const h1Match = body.match(/^#\s+(.+)$/m);
  if (h1Match) {
    title = h1Match[1].trim().replace(/^["']|["']$/g, "");
  }

  // Extract Description (> **Description:** ...) or (**Description:** ...)
  const descMatch = body.match(/>?\s*\*?\*?Description:\*?\*?\s*(.+)$/m);
  if (descMatch) {
    description = descMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  // Extract Image Prompt (> **Image Prompt:** ...) or (**Image Prompt:** ...)
  const imgMatch = body.match(/>?\s*\*?\*?Image\s+Prompt:\*?\*?\s*(.+)$/m);
  if (imgMatch) {
    imagePrompt = imgMatch[1].trim().replace(/^["']|["']$/g, "");
  }

  // Clean metadata lines from body to leave pure article body
  const lines = body.split("\n");
  const bodyLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("# ") && title && trimmed.includes(title)) return false;
    if (trimmed.match(/^>?\s*\*?\*?Description:\*?\*?/i)) return false;
    if (trimmed.match(/^>?\s*\*?\*?Image\s+Prompt:\*?\*?/i)) return false;
    return true;
  });

  let cleanBody = bodyLines.join("\n").trim();

  // Fallbacks for resilience on partial/interrupted streams
  if (!title) {
    const firstNonEmpty = lines.find((l) => l.trim().length > 0) || "Untitled Article";
    title = firstNonEmpty.replace(/^[#*>\s]+/, "").trim();
  }

  if (!description) {
    const paragraphs = cleanBody
      .split("\n\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !p.startsWith("#") && !p.startsWith(">"));
    const firstP = paragraphs[0] || title;
    description = firstP.replace(/^[#*>\s]+/, "").slice(0, 197) + "...";
  }

  if (description.length > 200) {
    description = description.slice(0, 197) + "...";
  }

  const slug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (!cleanBody) {
    cleanBody = markdownText;
  }

  return {
    title,
    slug: slug || "article",
    description,
    body: cleanBody,
    imagePrompt: imagePrompt || `Cover illustration for ${title}`,
  };
}

export async function generateBlogStream(
  options: GenerateOptions,
  onChunk?: (chunkText: string) => void
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

  const fullContent = await withRetry(async (modelName) => {
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemPrompt,
    });

    const resultStream = await model.generateContentStream({
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        maxOutputTokens: 3500,
        temperature: 0.7,
      },
    });

    let content = "";

    for await (const chunk of resultStream.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        content += chunkText;
        if (onChunk) {
          onChunk(chunkText);
        }
      }
    }

    if (!content.trim()) {
      throw new Error("No content received from Gemini model");
    }

    return content;
  });

  return parseCompletedMarkdown(fullContent);
}

export async function generateBlog(
  options: GenerateOptions
): Promise<GeneratedBlog> {
  return generateBlogStream(options);
}
