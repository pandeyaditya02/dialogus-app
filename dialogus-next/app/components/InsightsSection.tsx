import React from "react";
import Link from "next/link";
import Image from "next/image";
import { groq } from "next-sanity";
import { client, urlFor } from "@/lib/sanity.client";

interface InsightPost {
    _id: string;
    title: string;
    slug: string;
    description: string;
    date: string;
    authorName: string;
    categoryTitle: string;
    coverImage: any;
}

const query = groq`*[_type == "insightPost"] | order(date desc) [0...13] {
  _id,
  title,
  "slug": slug.current,
  description,
  date,
  "authorName": author->name,
  "categoryTitle": category->title,
  coverImage
}`;

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
        className="rounded-2xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-all flex flex-col group h-full border border-gray-200"
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

export default async function InsightsSection() {
    const posts: InsightPost[] = await client.fetch(query);
    const featured = posts[0];
    const rest = posts.slice(1);

    return (
        <section className="py-20 md:py-28">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    {/* <div className="inline-block mb-6">
                        <span className="text-sm md:text-base font-semibold text-fuchsia-600 uppercase tracking-[0.2em] letter-spacing-wider">
                            Insights & Analysis
                        </span>
                    </div> */}
                    <div className="relative inline-block mb-6">
                        <div className="absolute -inset-3 md:-inset-4 bg-[#c026d3] rounded-xl opacity-15 blur-md"></div>
                        <div className="absolute -inset-1 md:-inset-2 bg-[#c026d3] rounded-lg"></div>
                        <h2 className="relative text-3xl md:text-4xl lg:text-5xl font-bold leading-tight px-6 md:px-8 py-3 md:py-4">
                            <span className="text-white drop-shadow-lg">
                                Dialogus Insights
                            </span>
                        </h2>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="h-px w-12 bg-gradient-to-r from-transparent to-fuchsia-500"></div>
                        <div className="w-2 h-2 rounded-full bg-fuchsia-500"></div>
                        <div className="h-px w-12 bg-gradient-to-l from-transparent to-fuchsia-500"></div>
                    </div>
                    <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
                        Explore our latest analysis on <span className="font-semibold text-gray-800">politics</span>, <span className="font-semibold text-gray-800">business</span>, and <span className="font-semibold text-gray-800">culture</span>.
                    </p>
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
    );
}
