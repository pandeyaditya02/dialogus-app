"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { insightsData } from "../data/insights";

// --- Featured Article ---
const FeaturedArticle = ({ post }: { post: (typeof insightsData)[0] }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-gray-900"
  >
    <div className="relative w-full h-80">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover"
        priority
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
      />
    </div>
    <div className="p-6 space-y-3">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.category}
      </span>
      <h2 className="text-3xl font-bold text-white">{post.title}</h2>
      <p className="text-gray-400">{post.description}</p>
      <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
        <Image
          src={post.authorImg}
          alt={post.author}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full"
        />
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
    <div className="relative w-full h-48">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="p-5 flex flex-col flex-grow space-y-2">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.category}
      </span>
      <h3 className="font-bold text-xl text-white">{post.title}</h3>
      <p className="text-gray-400 text-sm flex-grow">{post.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Image
          src={post.authorImg}
          alt={post.author}
          width={24}
          height={24}
          className="w-6 h-6 rounded-full"
        />
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
              Insights & Stories
            </h2>
            <p className="text-gray-400">
              Go behind the scenes and explore our perspective on the evolving
              media landscape.
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
