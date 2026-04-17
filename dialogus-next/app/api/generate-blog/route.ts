import { NextRequest, NextResponse } from "next/server";
import { generateBlog } from "@/lib/ai-blog-generator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, instructions, previousContent, regenerateInstructions } = body;

    if (!topic || typeof topic !== "string") {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    const blog = await generateBlog({
      topic,
      instructions: instructions || undefined,
      previousContent: previousContent || null,
      regenerateInstructions: regenerateInstructions || null,
    });

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
