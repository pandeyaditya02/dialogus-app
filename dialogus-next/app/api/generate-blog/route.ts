import { NextRequest } from "next/server";
import { generateBlogStream } from "@/lib/ai-blog-generator";
import { fetchGoogleNews } from "@/lib/news-fetcher";
import { fetchSerperNews } from "@/lib/serper-fetcher";
import { fetchGoogleScholar } from "@/lib/scholar-fetcher";
import { buildContext } from "@/lib/context-builder";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { topic, instructions, previousContent, regenerateInstructions } = body;

  const clean = (val: any) =>
    typeof val === "string" ? val.trim() || null : val;

  const cleanedTopic = clean(topic);
  if (!cleanedTopic) {
    return new Response(JSON.stringify({ error: "Topic is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: any) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Controller might be closed if client disconnected
        }
      };

      try {
        // Stage 1: Serper Search
        sendEvent("stage", {
          id: "serper",
          title: "Searching web & news (Serper API)...",
          status: "in_progress",
        });

        // Stage 2: Scholar Search
        sendEvent("stage", {
          id: "scholar",
          title: "Fetching research papers (Google Scholar)...",
          status: "in_progress",
        });

        // Stage 3: Google News RSS
        sendEvent("stage", {
          id: "news",
          title: "Aggregating Google News feed...",
          status: "in_progress",
        });

        // Fetch concurrently and stream results as each completes
        const serperPromise = fetchSerperNews(cleanedTopic).then((items) => {
          sendEvent("serper_results", { items });
          sendEvent("stage", {
            id: "serper",
            title: "Searching web & news (Serper API)",
            status: "completed",
            count: items.length,
          });
          return items;
        }).catch(() => {
          sendEvent("stage", {
            id: "serper",
            title: "Searching web & news (Serper API)",
            status: "completed",
            count: 0,
          });
          return [];
        });

        const scholarPromise = fetchGoogleScholar(cleanedTopic).then((items) => {
          sendEvent("scholar_results", { items });
          sendEvent("stage", {
            id: "scholar",
            title: "Fetching research papers (Google Scholar)",
            status: "completed",
            count: items.length,
          });
          return items;
        }).catch(() => {
          sendEvent("stage", {
            id: "scholar",
            title: "Fetching research papers (Google Scholar)",
            status: "completed",
            count: 0,
          });
          return [];
        });

        const rssPromise = fetchGoogleNews(cleanedTopic).then((items) => {
          sendEvent("google_news_results", { items });
          sendEvent("stage", {
            id: "news",
            title: "Aggregating Google News feed",
            status: "completed",
            count: items.length,
          });
          return items;
        }).catch(() => {
          sendEvent("stage", {
            id: "news",
            title: "Aggregating Google News feed",
            status: "completed",
            count: 0,
          });
          return [];
        });

        const [rssItems, serperItems, scholarItems] = await Promise.all([
          rssPromise,
          serperPromise,
          scholarPromise,
        ]);

        // Stage 4: Context building
        sendEvent("stage", {
          id: "context",
          title: "Building grounded context...",
          status: "in_progress",
        });

        const contextResult = buildContext(
          cleanedTopic,
          rssItems,
          serperItems,
          scholarItems
        );

        const contextStatus: "grounded" | "no_sources" =
          contextResult.sources.length > 0 ? "grounded" : "no_sources";

        sendEvent("context_ready", {
          sources: contextResult.sources,
          contextStatus,
          totalFetched: contextResult.totalFetched,
          afterDedup: contextResult.afterDedup,
          withSnippets: contextResult.withSnippets,
        });

        sendEvent("stage", {
          id: "context",
          title: "Building grounded context",
          status: "completed",
          count: contextResult.sources.length,
        });

        // Stage 5: Gemini LLM generation streaming
        sendEvent("stage", {
          id: "generating",
          title: "Generating article with Gemini AI...",
          status: "in_progress",
        });

        const todayDate = new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

        const blog = await generateBlogStream(
          {
            topic: cleanedTopic,
            instructions: clean(instructions) || undefined,
            context: contextResult.contextString || null,
            todayDate,
            withSnippets: contextResult.withSnippets,
            previousContent: previousContent || null,
            regenerateInstructions: clean(regenerateInstructions) || null,
          },
          (chunkText) => {
            sendEvent("generation_chunk", { text: chunkText });
          }
        );

        sendEvent("stage", {
          id: "generating",
          title: "Generating article with Gemini AI",
          status: "completed",
        });

        sendEvent("complete", {
          success: true,
          blog,
          sources: contextResult.sources,
          contextStatus,
          totalFetched: contextResult.totalFetched,
          afterDedup: contextResult.afterDedup,
          withSnippets: contextResult.withSnippets,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Generation failed";
        sendEvent("error", { error: message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
