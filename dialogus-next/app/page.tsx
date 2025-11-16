import React from "react";
import Link from "next/link";
import Hero from "./components/Hero";
import VideosWrapper from "./components/VideosWrapper";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity.client";

export const revalidate = 60; // Revalidate every 60 seconds

// --- TypeScript Interface for a Post ---
interface InsightPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  authorName: string;
  categoryTitle: string;
}

// --- GROQ Query to fetch latest 13 posts ---
const query = groq`*[_type == "insightPost"] | order(date desc) [0...13] {
  _id,
  title,
  "slug": slug.current,
  description,
  date,
  "authorName": author->name,
  "categoryTitle": category->title
}`;

const FeaturedArticle = ({ post }: { post: InsightPost }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-gray-900"
  >
    <div className="p-6 space-y-3">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.categoryTitle}
      </span>
      <h2 className="text-3xl font-bold text-white">{post.title}</h2>
      <p className="text-gray-400">{post.description}</p>
      <div className="flex items-center gap-3 text-sm text-gray-500 mt-3">
        <span className="text-white">{post.authorName}</span>
        <span>·</span>
        <span>{new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
      <span className="inline-block mt-3 font-semibold text-fuchsia-400 text-sm">
        Read Article →
      </span>
    </div>
  </Link>
);

const GridArticle = ({ post }: { post: InsightPost }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="rounded-2xl overflow-hidden bg-gray-900 hover:shadow-lg transition-all flex flex-col"
  >
    <div className="p-5 flex flex-col flex-grow space-y-2">
      <span className="text-sm text-fuchsia-400 font-semibold uppercase">
        {post.categoryTitle}
      </span>
      <h3 className="font-bold text-xl text-white">{post.title}</h3>
      <p className="text-gray-400 text-sm flex-grow">{post.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-white">{post.authorName}</span>
        <span>·</span>
        <span>{new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  </Link>
);

export default async function Home() {
  const posts: InsightPost[] = await client.fetch(query);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <main>
      
      <section className="py-20 md:py-28 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="section-title text-4xl md:text-5xl mb-4 font-bold">Dialogus Insights</h2>
            <p className="text-gray-400">Explore our latest analysis on politics, business, and culture.</p>
          </div>
          {featured && (
            <div className="mb-16">
              <FeaturedArticle post={featured} />
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => <GridArticle key={post._id} post={post} />)}
          </div>
        </div>
      </section>
      <Hero />
      <VideosWrapper />
    </main>
  );
}