import { GoogleGenerativeAI } from "@google/generative-ai";

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;
const MODEL_NAME = "gemini-2.0-flash";

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
