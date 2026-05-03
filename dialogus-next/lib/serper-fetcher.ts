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
