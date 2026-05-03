"use client";

import { useRef } from "react";

interface ImagePreviewProps {
  imageBase64: string;
  mimeType: string;
  imagePrompt: string;
  setImagePrompt: (v: string) => void;
  isGenerating: boolean;
  onGenerateImage: () => void;
  onImageUpload: (base64: string, mimeType: string) => void;
}

export default function ImagePreview({
  imageBase64,
  mimeType,
  imagePrompt,
  setImagePrompt,
  isGenerating,
  onGenerateImage,
  onImageUpload,
}: ImagePreviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // result is "data:image/png;base64,..."
      const base64 = result.split(",")[1];
      onImageUpload(base64, file.type || "image/png");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
        Cover Image
      </h2>

      {/* Image display */}
      <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
        {imageBase64 ? (
          <img
            src={`data:${mimeType};base64,${imageBase64}`}
            alt="Cover image preview"
            className="w-full h-full object-cover"
          />
        ) : isGenerating ? (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <span className="inline-block w-6 h-6 border-2 border-gray-300 border-t-fuchsia-500 rounded-full animate-spin" />
            <span className="text-xs">Generating…</span>
          </div>
        ) : (
          <div className="text-gray-300 text-sm text-center px-4">
            No image yet
          </div>
        )}
      </div>

      {/* Image prompt */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Image Prompt
        </label>
        <textarea
          value={imagePrompt}
          onChange={(e) => setImagePrompt(e.target.value)}
          rows={3}
          placeholder="Describe the cover image…"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Regenerate button */}
      <button
        type="button"
        onClick={onGenerateImage}
        disabled={isGenerating || !imagePrompt.trim()}
        className="w-full py-2 px-3 bg-fuchsia-600 text-white text-xs font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {isGenerating ? (
          <>
            <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Generating…
          </>
        ) : (
          "Regenerate Image"
        )}
      </button>

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-2 px-3 border border-gray-300 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Upload Custom Image
        </button>
      </div>
    </div>
  );
}
