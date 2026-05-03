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
