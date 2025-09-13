"use client";

import React from "react";
import Link from "next/link";
import { insightsData } from "../data/insights";

// --- Featured Article ---
const FeaturedArticle = ({ post }: { post: (typeof insightsData)[0] }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-gray-900"
  >
    <div className="p-6 space-y-3">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.category}
      </span>
      <h2 className="text-3xl font-bold text-white">{post.title}</h2>
      <p className="text-gray-400">{post.description}</p>
      <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
        <span className="text-white">{post.author}</span>
        <span>·</span>
        <span>{post.date}</span>
        <span>·</span>
        <span>{post.readTime}</span>
      </div>
      <span className="inline-block mt-3 font-semibold text-fuchsia-400 text-sm">
        Read Article →
      </span>
    </div>
  </Link>
);

// --- Grid Article ---
const GridArticle = ({ post }: { post: (typeof insightsData)[0] }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="rounded-2xl overflow-hidden bg-gray-900 hover:shadow-lg transition-all flex flex-col"
  >
    <div className="p-5 flex flex-col flex-grow space-y-2">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.category}
      </span>
      <h3 className="font-bold text-xl text-white">{post.title}</h3>
      <p className="text-gray-400 text-sm flex-grow">{post.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-white">{post.author}</span>
        <span>·</span>
        <span>{post.date}</span>
      </div>
    </div>
  </Link>
);

const InsightsContent = () => {
  const [featured, ...rest] = insightsData;

  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      <section id="blog" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          {/* Page Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="section-title text-4xl md:text-5xl mb-4 font-bold">
              News & Voices
            </h2>
            <p className="text-gray-400">
              See the evolving global geopolitical landscape through our lens
              and uncover the forces transforming the world around us.
            </p>
          </div>

          {/* Featured Article */}
          <div className="mb-16">
            <FeaturedArticle post={featured} />
          </div>

          {/* Grid of Other Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <GridArticle key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default function InsightsPage() {
  return <InsightsContent />;
}
