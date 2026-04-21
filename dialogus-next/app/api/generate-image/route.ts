import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/imagen";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    const cleanedPrompt = typeof prompt === "string" ? prompt.trim() : null;

    if (!cleanedPrompt) {
      return NextResponse.json(
        { error: "Image prompt is required" },
        { status: 400 }
      );
    }

    const result = await generateImage(cleanedPrompt);

    return NextResponse.json({
      success: true,
      imageBase64: result.imageBase64,
      mimeType: result.mimeType,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
