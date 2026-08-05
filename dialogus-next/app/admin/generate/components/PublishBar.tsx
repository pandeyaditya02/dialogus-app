"use client";

import { useState } from "react";

export type DraftStatus = "idle" | "saving" | "saved" | "error";

interface PublishBarProps {
  isPublishing: boolean;
  isGenerating: boolean;
  draftStatus: DraftStatus;
  lastSavedTime: string | null;
  studioUrl: string | null;
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
  draftStatus,
  lastSavedTime,
  studioUrl,
  regenerateInstructions,
  setRegenerateInstructions,
  onPublish,
  onDraft,
  onRegenerate,
  onStartOver,
}: PublishBarProps) {
  const [showRegenerate, setShowRegenerate] = useState(false);

  const busy = isPublishing || isGenerating || draftStatus === "saving";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sticky bottom-4 z-10 space-y-4">
      {/* Regenerate section */}
      {showRegenerate && (
        <div className="space-y-3 pb-3 border-b border-gray-100">
          <label className="block text-sm font-medium text-gray-700">
            Regeneration Instructions
          </label>
          <textarea
            value={regenerateInstructions}
            onChange={(e) => setRegenerateInstructions(e.target.value)}
            rows={3}
            placeholder="Tell the AI what to change — e.g. 'Make the tone more conversational', 'Add more data points about Q1 2026'"
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
                  Regenerating...
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

      {/* Action buttons & Status Row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Publish Button */}
          <button
            type="button"
            onClick={onPublish}
            disabled={busy}
            className="px-5 py-2.5 bg-fuchsia-600 text-white text-sm font-semibold rounded-xl hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm"
          >
            {isPublishing ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish Article"
            )}
          </button>

          {/* Save as Draft Button */}
          <button
            type="button"
            onClick={onDraft}
            disabled={busy}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-sm bg-white"
          >
            {draftStatus === "saving" ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
                Saving Draft...
              </>
            ) : draftStatus === "saved" ? (
              "Save Draft (Updated)"
            ) : (
              "Save as Draft"
            )}
          </button>

          {/* Regenerate Toggle */}
          <button
            type="button"
            onClick={() => setShowRegenerate((v) => !v)}
            disabled={busy}
            className="px-4 py-2.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Regenerate
          </button>
        </div>

        {/* Live Save Status Feedback & Link */}
        <div className="flex items-center gap-4 text-xs">
          {draftStatus === "saving" && (
            <span className="inline-flex items-center gap-1.5 text-fuchsia-600 font-medium animate-pulse">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-ping" />
              Saving draft...
            </span>
          )}

          {draftStatus === "saved" && (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <span className="font-bold">✓</span> Draft saved {lastSavedTime && `at ${lastSavedTime}`}
            </span>
          )}

          {draftStatus === "error" && (
            <span className="inline-flex items-center gap-1.5 text-red-600 font-medium bg-red-50 px-2.5 py-1 rounded-lg border border-red-200">
              <span className="font-bold">✕</span> Failed to save draft
            </span>
          )}

          {/* Start over */}
          <button
            type="button"
            onClick={onStartOver}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}
