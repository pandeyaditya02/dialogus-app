import type { NewsItem } from "./news-fetcher";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

// Phrases that signal the user wants us to auto-discover the trending topic
const GENERIC_NEWS_PATTERNS = [
  /^(write (an? )?article on )?latest news$/i,
  /^(write (an? )?article on )?trending news$/i,
  /^(write (an? )?article on )?recent news$/i,
  /^(write (an? )?article on )?top news$/i,
  /^(write (an? )?article on )?current news$/i,
  /^(write (an? )?article on )?breaking news$/i,
  /^(write (an? )?article (about )?)?what'?s? (happening|trending) (today|now|right now)$/i,
  /^(write (an? )?article on )?news today$/i,
  /^(write (an? )?article on )?today'?s? news$/i,
];

/** Returns true if the topic is a generic/vague news request with no specific subject. */
export function isGenericNewsTopic(topic: string): boolean {
  const t = topic.trim();
  return GENERIC_NEWS_PATTERNS.some((pattern) => pattern.test(t));
}

/**
 * Fetches the single top trending news story right now via Serper.
 * Returns the resolved topic string (the story headline), or null on failure.
 */
export async function fetchTrendingTopic(): Promise<string | null> {
  if (!SERPER_API_KEY) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    // Query with a broad term to surface what Serper ranks as most relevant right now
    const res = await fetch("https://google.serper.dev/news", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: "top trending news today", num: 5 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;

    const data = await res.json();
    const articles: Array<{ title?: string; link?: string }> = data.news || [];

    const top = articles.find((a) => a.title && a.link);
    return top?.title?.trim() || null;
  } catch {
    return null;
  }
}


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
