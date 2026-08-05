"use client";

import { useEffect, useRef } from "react";
import type { NewsItem } from "@/lib/news-fetcher";

export interface StageStatus {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed" | "error";
  count?: number;
}

interface ProgressIndicatorProps {
  topic: string;
  stages: Record<string, StageStatus>;
  serperItems: NewsItem[];
  scholarItems: NewsItem[];
  streamedText: string;
  error?: string;
}

export default function ProgressIndicator({
  topic,
  stages,
  serperItems,
  scholarItems,
  streamedText,
  error,
}: ProgressIndicatorProps) {
  const textEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll streamed text preview as new chunks arrive
  useEffect(() => {
    if (textEndRef.current) {
      textEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [streamedText]);

  const defaultStages: StageStatus[] = [
    stages["serper"] || {
      id: "serper",
      title: "Searching web & news (Serper API)",
      status: "pending",
    },
    stages["scholar"] || {
      id: "scholar",
      title: "Fetching research papers (Google Scholar)",
      status: "pending",
    },
    stages["news"] || {
      id: "news",
      title: "Aggregating Google News feed",
      status: "pending",
    },
    stages["context"] || {
      id: "context",
      title: "Building grounded context",
      status: "pending",
    },
    stages["generating"] || {
      id: "generating",
      title: "Generating article with Gemini AI",
      status: "pending",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Topic Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-purple-800/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 animate-ping" />
            Live Article Generation Pipeline
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {topic}
          </h2>
        </div>
      </div>

      {/* Grid: Stages Progress Timeline & Live Results Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Stages Timeline (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Pipeline Stages
            </h3>
            <ul className="space-y-4">
              {defaultStages.map((stg) => {
                const isPending = stg.status === "pending";
                const isInProgress = stg.status === "in_progress";
                const isCompleted = stg.status === "completed";
                const isError = stg.status === "error";

                return (
                  <li key={stg.id} className="flex items-start gap-3">
                    {/* Status icon badge */}
                    <div className="mt-0.5 shrink-0">
                      {isCompleted && (
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-sm">
                          ✓
                        </div>
                      )}
                      {isInProgress && (
                        <div className="w-6 h-6 rounded-full bg-fuchsia-100 text-fuchsia-600 flex items-center justify-center shadow-sm">
                          <span className="w-3 h-3 border-2 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                      {isPending && (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-gray-50 flex items-center justify-center" />
                      )}
                      {isError && (
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
                          ✕
                        </div>
                      )}
                    </div>

                    {/* Title & info */}
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          isCompleted
                            ? "text-gray-900"
                            : isInProgress
                            ? "text-fuchsia-700 font-semibold"
                            : "text-gray-400"
                        }`}
                      >
                        {stg.title}
                      </p>
                      {stg.count !== undefined && isCompleted && (
                        <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                          {stg.count} {stg.count === 1 ? "result" : "results"} received
                        </p>
                      )}
                      {isInProgress && (
                        <p className="text-[11px] text-fuchsia-500 font-normal mt-0.5 animate-pulse">
                          Fetching real-time data...
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Real-time Status Counter Summary */}
          <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="block text-lg font-bold text-slate-800">
                {serperItems.length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Web News
              </span>
            </div>
            <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100">
              <span className="block text-lg font-bold text-indigo-900">
                {scholarItems.length}
              </span>
              <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider">
                Scholar Papers
              </span>
            </div>
          </div>
        </div>

        {/* Live Stream Feed & Token Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Incoming Real-Time Sources stream */}
          {(serperItems.length > 0 || scholarItems.length > 0) && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                  Live Discovered Sources
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                  {serperItems.length + scholarItems.length} live sources
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {scholarItems.map((item, idx) => (
                  <div
                    key={`scholar-${idx}`}
                    className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs flex items-start justify-between gap-2 transition-all animate-fadeIn"
                  >
                    <div className="space-y-0.5">
                      <span className="inline-block px-1.5 py-0.2 bg-indigo-600 text-white text-[9px] font-bold rounded uppercase tracking-wider mr-1.5">
                        Scholar
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-indigo-950 hover:underline line-clamp-1"
                      >
                        {item.title}
                      </a>
                      <p className="text-[10px] text-indigo-600 line-clamp-1">
                        {item.source} {item.pubDate && `• ${item.pubDate}`}
                      </p>
                    </div>
                  </div>
                ))}
                {serperItems.map((item, idx) => (
                  <div
                    key={`serper-${idx}`}
                    className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-start justify-between gap-2 transition-all animate-fadeIn"
                  >
                    <div className="space-y-0.5">
                      <span className="inline-block px-1.5 py-0.2 bg-slate-600 text-white text-[9px] font-bold rounded uppercase tracking-wider mr-1.5">
                        Serper Web
                      </span>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-slate-900 hover:underline line-clamp-1"
                      >
                        {item.title}
                      </a>
                      <p className="text-[10px] text-slate-500 line-clamp-1">
                        {item.source} {item.pubDate && `• ${item.pubDate}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gemini Live Token Stream Preview Card */}
          <div className="bg-slate-950 text-slate-200 rounded-2xl p-5 shadow-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Gemini Token Stream Output
                </h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                {streamedText.length} chars
              </span>
            </div>

            <div className="h-56 overflow-y-auto font-mono text-xs text-slate-300 leading-relaxed space-y-2 pr-2 custom-scrollbar">
              {streamedText ? (
                <div className="whitespace-pre-wrap break-words">
                  {streamedText}
                  <span className="inline-block w-2 h-4 bg-fuchsia-400 ml-1 animate-pulse align-middle" />
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-xs italic">
                  Waiting for model response tokens...
                </div>
              )}
              <div ref={textEndRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
