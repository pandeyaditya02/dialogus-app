import React from "react";
import Link from "next/link";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity.client"; // Adjust this import path if needed

// The GROQ query to fetch all posts and their related author/category data
const query = groq`*[_type == "insightPost"] | order(date desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  date,
  body, // We need the body to calculate read time
  "authorName": author->name,
  "categoryTitle": category->title
}`;

// Define the TypeScript interface for a post fetched from Sanity
export interface InsightPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  body: any[]; // Portable Text content
  authorName: string;
  categoryTitle: string;
  readTime: string; // We will add this property after fetching
}

// Helper function to calculate reading time
const calculateReadTime = (body: any[]): string => {
  const wordsPerMinute = 200;
  // Extract text from all portable text blocks
  const text = body
    .map((block) => {
      if (block._type === 'block' && block.children) {
        return block.children.map((child: any) => child.text).join('');
      }
      return '';
    })
    .join(' ');
  
  const wordCount = text.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readTime} min read`;
};

// --- Featured Article Component ---
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
        <span>·</span>
        <span>{post.readTime}</span>
      </div>
      <span className="inline-block mt-3 font-semibold text-fuchsia-400 text-sm">
        Read Article →
      </span>
    </div>
  </Link>
);

// --- Grid Article Component ---
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

// This tells Next.js to re-generate this page every 60 seconds
export const revalidate = 60;

export default async function InsightsPage() {
  // Fetch the raw data from Sanity
  const rawPosts: Omit<InsightPost, 'readTime'>[] = await client.fetch(query);

  // Process posts to add calculated readTime
  const posts: InsightPost[] = rawPosts.map(post => ({
    ...post,
    readTime: calculateReadTime(post.body),
  }));

  if (!posts || posts.length === 0) {
    return (
      <main className="pt-24 bg-black text-white min-h-screen">
         <div className="text-center py-20">
           <h2 className="text-3xl font-bold">No posts found.</h2>
           <p className="text-gray-400 mt-4">Check back later for new insights!</p>
         </div>
      </main>
    )
  }

  const [featured, ...rest] = posts;

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
              and uncover the forces transforming the world around us
            </p>
          </div>

          {/* Featured Article */}
          <div className="mb-16">
            <FeaturedArticle post={featured} />
          </div>

          {/* Grid of Other Articles */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <GridArticle key={post._id} post={post} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}