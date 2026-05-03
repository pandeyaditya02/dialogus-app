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

  // Only throw on MAX_TOKENS if the content is actually empty.
  // If the JSON was fully formed before the token cap, fall through and parse it normally.
  if (candidate?.finishReason === "MAX_TOKENS" && !content?.trim()) {
    throw new Error(
      "The AI response was cut off before completing. Try a shorter or more specific topic."
    );
  }

  if (!content) {
    throw new Error("No content in Gemini response");
  }

  let jsonStr = content.trim();

  // Find the first '{' and last '}' to extract the JSON object
  // This is more robust than regex when the content contains markdown code blocks
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
