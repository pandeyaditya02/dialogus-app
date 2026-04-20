const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;
const MODEL_NAME = "gemini-3-flash-preview";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${GOOGLE_AI_API_KEY}`;

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
  previousContent?: {
    title: string;
    description: string;
    body: string;
  } | null;
  regenerateInstructions?: string | null;
}

const SYSTEM_PROMPT = `You are a senior editorial writer for Dialogus, a digital media platform that provides data-driven analysis on politics, business, law, and culture — primarily focused on Indian and global current affairs.

Your task is to write a complete blog article. Return your response as a JSON object with exactly these fields:

{
  "title": "SEO-optimized headline, 50-70 characters",
  "slug": "url-friendly-lowercase-hyphenated-version-of-title",
  "description": "A compelling summary for SEO and social previews, max 200 characters. Front-load with keywords.",
  "body": "Full article in markdown format",
  "imagePrompt": "A descriptive prompt for generating a cover image for this article"
}

Article requirements:
- Length: 800-1500 words
- Structure: Introduction paragraph, 3-5 sections with H2 headings (##), optional H3 subheadings (###), conclusion
- Tone: Analytical, data-driven, journalistic. Not sensational, not academic.
- Use markdown formatting: ## for H2, ### for H3, **bold** for emphasis, *italic* for terms, > for notable quotes, - for bullet lists, [text](url) for links
- Never use H1 (#) — the title is rendered separately
- Include specific data points, dates, and factual references where possible
- Write in a way that is accessible to educated general readers

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

IMPORTANT: Return ONLY the JSON object, no other text before or after it.`;

export async function generateBlog(
  options: GenerateOptions
): Promise<GeneratedBlog> {
  const isRegeneration =
    options.previousContent && options.regenerateInstructions;

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

Please revise the article based on the editor's feedback.`;
  } else {
    systemPrompt = SYSTEM_PROMPT;
    userMessage = `Write a blog article about: ${options.topic}`;

    if (options.instructions) {
      userMessage += `\n\nAdditional instructions from the editor:\n${options.instructions}`;
    }
  }

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: "user",
          parts: [{ text: userMessage }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!content) {
    throw new Error("No content in Gemini response");
  }

  let jsonStr = content.trim();
  // Handle potential markdown code blocks in response
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  const blog: GeneratedBlog = JSON.parse(jsonStr);

  if (!blog.title || !blog.slug || !blog.description || !blog.body) {
    throw new Error("Incomplete blog generated — missing required fields");
  }

  if (blog.description.length > 200) {
    blog.description = blog.description.slice(0, 197) + "...";
  }

  return blog;
}
