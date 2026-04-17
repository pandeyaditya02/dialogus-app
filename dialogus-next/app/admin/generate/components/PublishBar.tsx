"use client";

import { useState } from "react";

interface PublishBarProps {
  isPublishing: boolean;
  isGenerating: boolean;
  regenerateInstructions: string;
  setRegenerateInstructions: (v: string) => void;
  onPublish: () => void;
  onDraft: () => void;
  onRegenerate: () => void;
  onStartOver: () => void;
}

export default function PublishBar({
  isPublishing,
  isGenerating,
  regenerateInstructions,
  setRegenerateInstructions,
  onPublish,
  onDraft,
  onRegenerate,
  onStartOver,
}: PublishBarProps) {
  const [showRegenerate, setShowRegenerate] = useState(false);

  const busy = isPublishing || isGenerating;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
      {/* Regenerate section */}
      {showRegenerate && (
        <div className="mb-4 space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Regeneration Instructions
          </label>
          <textarea
            value={regenerateInstructions}
            onChange={(e) => setRegenerateInstructions(e.target.value)}
            rows={3}
            placeholder="Tell the AI what to change — e.g. 'Make the tone more conversational', 'Add more data points about Q1 2025'"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                onRegenerate();
                setShowRegenerate(false);
              }}
              disabled={busy || !regenerateInstructions.trim()}
              className="px-4 py-2 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Regenerating…
                </>
              ) : (
                "Apply & Regenerate"
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowRegenerate(false)}
              className="px-4 py-2 border border-gray-300 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Publish */}
        <button
          type="button"
          onClick={onPublish}
          disabled={busy}
          className="px-5 py-2.5 bg-fuchsia-600 text-white text-sm font-medium rounded-lg hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isPublishing ? (
            <>
              <span className="inline-block w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Publishing…
            </>
          ) : (
            "Publish"
          )}
        </button>

        {/* Draft */}
        <button
          type="button"
          onClick={onDraft}
          disabled={busy}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save as Draft
        </button>

        {/* Regenerate */}
        <button
          type="button"
          onClick={() => setShowRegenerate((v) => !v)}
          disabled={busy}
          className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Regenerate
        </button>

        {/* Start over */}
        <button
          type="button"
          onClick={onStartOver}
          className="ml-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
