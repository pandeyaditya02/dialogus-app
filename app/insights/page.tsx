"use client";

import React from "react";
import Link from "next/link";

const insightsData = [
  {
    slug: "art-of-interview",
    date: "Sep 04, 2025",
    title: "The Art of the Interview: Building Rapport in Minutes",
    description:
      "Our top producers share their secrets for creating conversations that feel authentic and revealing.",
    body: `
      Interviews are the backbone of meaningful conversations...
      (full article body goes here, long text content).
    `,
    category: "Production",
    author: "Jane Doe",
    authorImg: "https://randomuser.me/api/portraits/women/44.jpg",
    readTime: "6 min read",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "sonic-branding",
    date: "Aug 28, 2025",
    title: "Sonic Branding: Why Your Podcast Needs a Signature Sound",
    description:
      "Exploring the psychology of sound and how to craft an unforgettable audio identity for your show.",
    body: `
      Sound has a unique power to shape memory and emotion...
      (full article body goes here, long text content).
    `,
    category: "Branding",
    author: "John Smith",
    authorImg: "https://randomuser.me/api/portraits/men/32.jpg",
    readTime: "5 min read",
    image:
      "https://images.unsplash.com/photo-1525182008055-f88b95ff7980?auto=format&fit=crop&w=1600&q=80",
  },
  {
    slug: "visual-podcasting",
    date: "Aug 15, 2025",
    title: "Beyond the Mic: Our Approach to Visual Podcasting",
    description:
      "How we turn audio-first content into compelling visual experiences for platforms like YouTube.",
    body: `
      Visual podcasting bridges the gap between audio and video...
      (full article body goes here, long text content).
    `,
    category: "Visual Media",
    author: "Alice Brown",
    authorImg: "https://randomuser.me/api/portraits/women/68.jpg",
    readTime: "7 min read",
    image:
      "https://images.unsplash.com/photo-1503428593586-e225b39bddfe?auto=format&fit=crop&w=1600&q=80",
  },
];

// --- Featured Article ---
const FeaturedArticle = ({ post }: { post: (typeof insightsData)[0] }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-gray-900"
  >
    <img src={post.image} alt={post.title} className="w-full h-80 object-cover" />
    <div className="p-6 space-y-3">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.category}
      </span>
      <h2 className="text-3xl font-bold text-white">{post.title}</h2>
      <p className="text-gray-400">{post.description}</p>
      <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
        <img src={post.authorImg} alt={post.author} className="w-8 h-8 rounded-full" />
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
    <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
    <div className="p-5 flex flex-col flex-grow space-y-2">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.category}
      </span>
      <h3 className="font-bold text-xl text-white">{post.title}</h3>
      <p className="text-gray-400 text-sm flex-grow">{post.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <img src={post.authorImg} alt={post.author} className="w-6 h-6 rounded-full" />
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
