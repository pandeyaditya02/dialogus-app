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
