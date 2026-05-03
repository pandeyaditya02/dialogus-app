"use client";

import { useState } from "react";

interface NewsSource {
  title: string;
  link: string;
  source: string;
  pubDate: string;
  snippet?: string;
}

interface SourcesPanelProps {
  sources: NewsSource[];
  contextStatus: "grounded" | "no_sources";
  totalFetched: number;
  afterDedup: number;
  withSnippets: number;
}

export default function SourcesPanel({
  sources,
  contextStatus,
  totalFetched,
  afterDedup,
  withSnippets,
}: SourcesPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between"
      >
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
          News Sources
        </h2>
        <div className="flex items-center gap-2">
          {contextStatus === "grounded" ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-[10px] font-medium rounded-full border border-green-200">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              Grounded
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-medium rounded-full border border-amber-200">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
              No live sources
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="space-y-3">
          {sources.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] text-gray-400">
                {sources.length} sources used from {totalFetched} fetched ({afterDedup} after dedup)
              </p>
              <p className="text-[11px] text-gray-400">
                <span
                  className={
                    withSnippets >= 3
                      ? "text-green-600 font-medium"
                      : "text-amber-600 font-medium"
                  }
                >
                  {withSnippets}/{sources.length}
                </span>{" "}
                with snippets ·{" "}
                {withSnippets >= 3 ? "strict grounding" : "lenient grounding"}
              </p>
            </div>
          )}

          {sources.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">
              No real-time news sources were found for this topic. The article was generated using the AI model&apos;s general knowledge.
            </p>
          ) : (
            <ul className="space-y-2">
              {sources.map((s, i) => (
                <li
                  key={i}
                  className="p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <a
                    href={s.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <p className="text-xs font-medium text-gray-800 group-hover:text-fuchsia-600 transition-colors leading-snug">
                      {s.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {s.source && (
                        <span className="text-[10px] text-gray-500">
                          {s.source}
                        </span>
                      )}
                      {s.source && s.pubDate && (
                        <span className="text-gray-300">·</span>
                      )}
                      {s.pubDate && (
                        <span className="text-[10px] text-gray-400">
                          {s.pubDate}
                        </span>
                      )}
                    </div>
                    {s.snippet && (
                      <p
                        className="mt-1.5 text-[11px] text-gray-500 leading-relaxed line-clamp-3"
                        title={s.snippet}
                      >
                        {s.snippet}
                      </p>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
