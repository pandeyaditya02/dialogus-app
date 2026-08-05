"use client";

import { useState } from "react";
import type { StageStatus } from "./ProgressIndicator";

interface UnifiedPipelineHeaderProps {
  topic: string;
  setTopic: (v: string) => void;
  instructions: string;
  setInstructions: (v: string) => void;
  authorId: string;
  setAuthorId: (v: string) => void;
  categoryId: string;
  setCategoryId: (v: string) => void;
  authors: Array<{ _id: string; name: string }>;
  categories: Array<{ _id: string; title: string }>;
  onGenerate: () => void;
  isGenerating: boolean;
  stages: Record<string, StageStatus>;
  hasGenerated: boolean;
}

export default function UnifiedPipelineHeader({
  topic,
  setTopic,
  instructions,
  setInstructions,
  authorId,
  setAuthorId,
  categoryId,
  setCategoryId,
  authors,
  categories,
  onGenerate,
  isGenerating,
  stages,
  hasGenerated,
}: UnifiedPipelineHeaderProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim() || isGenerating) return;
    onGenerate();
  }

  const serperStage = stages["serper"];
  const scholarStage = stages["scholar"];
  const contextStage = stages["context"];
  const genStage = stages["generating"];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden space-y-5">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500" />

      {/* Top Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            AI Article Generator
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">
            Generate data-driven, grounded articles for Dialogus using real-time search & AI.
          </p>
        </div>

        {/* Dynamic Status Pill */}
        {isGenerating && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-700 rounded-full text-xs font-semibold animate-pulse self-start md:self-auto">
            <span className="w-2 h-2 rounded-full bg-fuchsia-600 animate-ping" />
            Generating article in real-time...
          </div>
        )}
      </div>

      {/* Topic Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter article topic (e.g., India's EV transition challenges in 2026)"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent text-sm shadow-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isGenerating || !topic.trim()}
            className="py-3 px-6 bg-fuchsia-600 text-white font-semibold rounded-xl hover:bg-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm flex items-center justify-center gap-2 shadow-sm shrink-0"
          >
            {isGenerating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : hasGenerated ? (
              "Generate New Article"
            ) : (
              "Generate Article"
            )}
          </button>
        </div>

        {/* Collapsible Additional Instructions & Meta Selectors */}
        <div className="flex items-center justify-between text-xs pt-1">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-fuchsia-600 font-medium hover:underline flex items-center gap-1"
          >
            {showInstructions ? "− Hide extra options" : "+ Additional instructions & metadata"}
          </button>
        </div>

        {showInstructions && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100 animate-fadeIn">
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Editor Instructions (optional)
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g. Focus on economic impact, include quotes, keep under 1000 words"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Author
              </label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white"
              >
                <option value="">Select author</option>
                {authors.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-fuchsia-500 bg-white"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </form>

      {/* Inline Stage Stepper Bar (Active during generation or completed) */}
      {(isGenerating || Object.keys(stages).length > 0) && (
        <div className="pt-3 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {/* Serper Web */}
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              serperStage?.status === "completed"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : serperStage?.status === "in_progress"
                ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {serperStage?.status === "completed" ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                ✓
              </span>
            ) : serperStage?.status === "in_progress" ? (
              <span className="w-3.5 h-3.5 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">Serper Web</p>
              <p className="text-[10px] opacity-75 truncate">
                {serperStage?.status === "completed"
                  ? `${serperStage.count ?? 0} results`
                  : serperStage?.status === "in_progress"
                  ? "Searching..."
                  : "Pending"}
              </p>
            </div>
          </div>

          {/* Google Scholar */}
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              scholarStage?.status === "completed"
                ? "bg-indigo-50/70 border-indigo-200 text-indigo-900"
                : scholarStage?.status === "in_progress"
                ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {scholarStage?.status === "completed" ? (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                ✓
              </span>
            ) : scholarStage?.status === "in_progress" ? (
              <span className="w-3.5 h-3.5 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">Google Scholar</p>
              <p className="text-[10px] opacity-75 truncate">
                {scholarStage?.status === "completed"
                  ? `${scholarStage.count ?? 0} papers`
                  : scholarStage?.status === "in_progress"
                  ? "Searching..."
                  : "Pending"}
              </p>
            </div>
          </div>

          {/* Context Grounded */}
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              contextStage?.status === "completed"
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                : contextStage?.status === "in_progress"
                ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {contextStage?.status === "completed" ? (
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                ✓
              </span>
            ) : contextStage?.status === "in_progress" ? (
              <span className="w-3.5 h-3.5 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">Grounded Context</p>
              <p className="text-[10px] opacity-75 truncate">
                {contextStage?.status === "completed"
                  ? `${contextStage.count ?? 0} sources used`
                  : contextStage?.status === "in_progress"
                  ? "Building..."
                  : "Pending"}
              </p>
            </div>
          </div>

          {/* Gemini Token Stream */}
          <div
            className={`p-2.5 rounded-xl border flex items-center gap-2.5 transition-all ${
              genStage?.status === "completed"
                ? "bg-purple-50/70 border-purple-200 text-purple-900"
                : genStage?.status === "in_progress"
                ? "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900"
                : "bg-gray-50 border-gray-200 text-gray-400"
            }`}
          >
            {genStage?.status === "completed" ? (
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                ✓
              </span>
            ) : genStage?.status === "in_progress" ? (
              <span className="w-3.5 h-3.5 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate">Gemini Generation</p>
              <p className="text-[10px] opacity-75 truncate">
                {genStage?.status === "completed"
                  ? "Completed"
                  : genStage?.status === "in_progress"
                  ? "Streaming..."
                  : "Pending"}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
