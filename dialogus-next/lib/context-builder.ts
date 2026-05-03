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
