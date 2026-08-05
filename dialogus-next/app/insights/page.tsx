import React from "react";
import Link from "next/link";
import Image from "next/image";
import { groq } from "next-sanity";
import { client, urlFor } from "@/lib/sanity.client";
import InsightsPaginationControls from "./InsightsPaginationControls";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Insights - Current Affairs Analysis & Opinion",
  description:
    "Read data-driven insights and analysis on politics, business, law, and culture. Stay informed with Dialogus editorial coverage of current affairs.",
  alternates: {
    canonical: "/insights",
  },
  openGraph: {
    title: "Insights - Current Affairs Analysis & Opinion",
    description:
      "Read data-driven insights and analysis on politics, business, law, and culture.",
    type: "website",
  },
};

const POSTS_PER_PAGE = 12;

const query = groq`*[_type == "insightPost"] | order(date desc) {
  _id,
  title,
  "slug": slug.current,
  description,
  date,
  body,
  "authorName": author->name,
  "categoryTitle": category->title,
  coverImage
}`;

export interface InsightPost {
  _id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  body: any[];
  authorName: string;
  categoryTitle: string;
  readTime: string;
  coverImage: any;
}

const calculateReadTime = (body: any[]): string => {
  return `5 min read`;
};

const FeaturedArticle = ({ post }: { post: InsightPost }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="block rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all bg-white group border border-gray-200"
  >
    <div className="grid md:grid-cols-2 gap-6">
      <div className="relative h-64 md:h-full min-h-[300px]">
        {post.coverImage ? (
          <Image
            src={urlFor(post.coverImage).url()}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-lg font-semibold">No Image</span>
          </div>
        )}
      </div>
      <div className="p-6 md:p-8 flex flex-col justify-center space-y-4">
        <span className="text-sm text-fuchsia-600 font-semibold uppercase tracking-wider">
          {post.categoryTitle}
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight group-hover:text-fuchsia-600 transition-colors">
          {post.title}
        </h2>
        <p className="text-gray-600 text-lg line-clamp-3">{post.description}</p>
        <div className="flex items-center gap-3 text-sm text-gray-500 pt-2">
          <span className="text-gray-900 font-medium">{post.authorName}</span>
          <span>·</span>
          <span>{new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <span className="inline-flex items-center mt-4 font-semibold text-fuchsia-600 text-sm group-hover:translate-x-2 transition-transform">
          Read Article →
        </span>
      </div>
    </div>
  </Link>
);

const GridArticle = ({ post }: { post: InsightPost }) => (
  <Link
    href={`/insights/${post.slug}`}
    className="rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-all flex flex-col group h-full border border-gray-200"
  >
    <div className="relative h-48 w-full overflow-hidden">
      {post.coverImage ? (
        <Image
          src={urlFor(post.coverImage).url()}
          alt={post.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 font-semibold">No Image</span>
        </div>
      )}
    </div>
    <div className="p-5 flex flex-col flex-grow space-y-3">
      <span className="text-xs text-fuchsia-600 font-semibold uppercase tracking-wider">
        {post.categoryTitle}
      </span>
      <h3 className="font-bold text-xl text-gray-900 leading-snug group-hover:text-fuchsia-600 transition-colors line-clamp-2">
        {post.title}
      </h3>
      <p className="text-gray-600 text-sm flex-grow line-clamp-3">{post.description}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 mt-auto">
        <span className="text-gray-900">{post.authorName}</span>
        <span>·</span>
        <span>{new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
      </div>
    </div>
  </Link>
);

export const revalidate = 60;

// FIX: Changed the component signature to be more robust for dynamic searchParams.
export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const rawPosts: Omit<InsightPost, 'readTime'>[] = await client.fetch(query);

  const posts: InsightPost[] = rawPosts.map(post => ({
    ...post,
    readTime: calculateReadTime(post.body),
  }));

  const awaitedSearchParams = await searchParams;
  const page = typeof awaitedSearchParams.page === 'string' ? Number(awaitedSearchParams.page) : 1;

  const totalPosts = posts.length;
  const totalPages = totalPosts > 1 ? Math.ceil((totalPosts - 1) / POSTS_PER_PAGE) : 1;

  if (!posts || posts.length === 0) {
    return (
      <main className="pt-24 min-h-screen">
        <div className="text-center py-20">
          <h2 className="text-3xl font-bold text-gray-900">No posts found.</h2>
          <p className="text-gray-600 mt-4">Check back later for new insights!</p>
        </div>
      </main>
    );
  }

  const isPage1 = page === 1;
  const featured = isPage1 ? posts[0] : null;

  let rest: InsightPost[];
  if (isPage1) {
    rest = posts.slice(1, 1 + POSTS_PER_PAGE);
  } else {
    const startIndex = 1 + (page - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    rest = posts.slice(startIndex, endIndex);
  }

  return (
    <main className="pt-24 min-h-screen">
      <section id="blog" className="py-20 md:py-28">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="section-title text-4xl md:text-5xl mb-4 font-bold">
              News & Voices
            </h2>
            <p className="text-gray-600">
              See the evolving global geopolitical landscape through our lens
              and uncover the forces transforming the world around us
            </p>
          </div>

          {isPage1 && featured && (
            <div className="mb-16">
              <FeaturedArticle post={featured} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {rest.map((post) => (
              <GridArticle key={post._id} post={post} />
            ))}
          </div>

          <div className="flex justify-center mt-16">
            {totalPages > 1 && (
              <InsightsPaginationControls totalPages={totalPages} />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}