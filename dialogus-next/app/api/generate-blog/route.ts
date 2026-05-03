import { NextRequest, NextResponse } from "next/server";
import { generateBlog } from "@/lib/ai-blog-generator";
import { fetchGoogleNews } from "@/lib/news-fetcher";
import { fetchSerperNews } from "@/lib/serper-fetcher";
import { buildContext } from "@/lib/context-builder";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, instructions, previousContent, regenerateInstructions } = body;

    const clean = (val: any) =>
      typeof val === "string" ? (val.trim() || null) : val;

    const cleanedTopic = clean(topic);
    if (!cleanedTopic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const [rssResult, serperResult] = await Promise.allSettled([
      fetchGoogleNews(cleanedTopic),
      fetchSerperNews(cleanedTopic),
    ]);

    const rssItems = rssResult.status === "fulfilled" ? rssResult.value : [];
    const serperItems = serperResult.status === "fulfilled" ? serperResult.value : [];

    const contextResult = buildContext(cleanedTopic, rssItems, serperItems);

    const contextStatus: "grounded" | "no_sources" =
      contextResult.sources.length > 0 ? "grounded" : "no_sources";

    const blog = await generateBlog({
      topic: cleanedTopic,
      instructions: clean(instructions) || undefined,
      context: contextResult.contextString || null,
      previousContent: previousContent || null,
      regenerateInstructions: clean(regenerateInstructions) || null,
    });

    return NextResponse.json({
      success: true,
      blog,
      sources: contextResult.sources,
      contextStatus,
      totalFetched: contextResult.totalFetched,
      afterDedup: contextResult.afterDedup,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
