import type { NewsItem } from "./news-fetcher";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

export async function fetchGoogleScholar(topic: string): Promise<NewsItem[]> {
  if (!SERPER_API_KEY) return [];

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch("https://google.serper.dev/scholar", {
      method: "POST",
      headers: {
        "X-API-KEY": SERPER_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q: topic, num: 5 }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const data = await res.json();
    const papers: Array<{
      title?: string;
      link?: string;
      snippet?: string;
      publicationInfo?: string;
      year?: string;
    }> = data.organic || [];

    return papers
      .filter((p) => p.title && p.link)
      .map((p) => {
        const rawSnippet = (p.snippet || "").trim();
        const snippet =
          rawSnippet && rawSnippet.toLowerCase() !== p.title!.toLowerCase()
            ? rawSnippet.length > 300
              ? rawSnippet.slice(0, 300).replace(/\s+\S*$/, "") + "..."
              : rawSnippet
            : undefined;

        return {
          title: p.title!,
          link: p.link!,
          source: p.publicationInfo || "Google Scholar",
          pubDate: p.year || "",
          snippet,
          isAcademic: true,
        };
      });
  } catch {
    return [];
  }
}
