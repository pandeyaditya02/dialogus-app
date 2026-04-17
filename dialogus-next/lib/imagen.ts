const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY!;

interface ImagenResult {
  imageBase64: string;
  mimeType: string;
}

export async function generateImage(prompt: string): Promise<ImagenResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${GOOGLE_AI_API_KEY}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "16:9",
      },
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Imagen API error (${res.status}): ${error}`);
  }

  const data = await res.json();
  const prediction = data.predictions?.[0];

  if (!prediction?.bytesBase64Encoded) {
    throw new Error("No image data in Imagen response");
  }

  return {
    imageBase64: prediction.bytesBase64Encoded,
    mimeType: prediction.mimeType || "image/png",
  };
}
