// file: dialogus-next/app/insights/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { groq } from "next-sanity";
import { client, urlFor } from "@/lib/sanity.client";
import { PortableText } from "@portabletext/react";
import { type PortableTextBlock } from "sanity";

// --- TypeScript Interfaces ---
interface InsightPostDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  body: PortableTextBlock[];
  authorName: string;
  authorImage?: any; // <-- Added new field
  categoryTitle: string;
  categoryId: string;
  readTime: string;
  coverImage?: any; // <-- Added new field
}

type Props = {
  params: { slug: string };
};

// --- Helper function to calculate reading time ---
const calculateReadTime = (body: PortableTextBlock[] = []): string => {
  return `5 min read`;
};

// --- Generate static params for all blog posts ---
export async function generateStaticParams() {
  const query = groq`*[_type == "insightPost"]{"slug": slug.current}`;
  const slugs: { slug: string }[] = await client.fetch(query);
  return (slugs || []).map((s) => ({ slug: s.slug }));
}

// --- Generate metadata for each post ---
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  const query = groq`*[_type == "insightPost" && slug.current == $slug][0]{
    title,
    description,
    date,
    "authorName": author->name
  }`;
  const post = await client.fetch(query, { slug });

  if (!post) {
    return { title: "Post Not Found" };
  }

  return {
    title: `${post.title} | Dialogus Insights`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.authorName],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

// --- PortableText custom renderers ---
const ptComponents = {
  types: {
    image: ({ value }: { value: any }) => {
      if (!value?.asset?._ref) return null;
      return (
        <div className="relative w-full my-12 mx-auto rounded-lg overflow-hidden">
          <Image
            className="object-contain w-full rounded-lg"
            src={urlFor(value).url()}
            alt={value.alt || "Insight Post Image"}
            width={value.asset?.metadata?.dimensions?.width || 1200}
            height={value.asset?.metadata?.dimensions?.height || 630}
          />
        </div>
      );
    },
  },
  block: {
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-bold text-white mt-12 mb-6 first:mt-0">
        {children}
      </h2>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-300 leading-relaxed mb-6 text-lg">
        {children}
      </p>
    ),
  },
};

// --- Main Blog Post Page Component ---
export default async function BlogPost({ params }: Props) {
  const { slug } = await params;

  const postQuery = groq`*[_type == "insightPost" && slug.current == $slug][0]{
    _id,
    title,
    description,
    date,
    body,
    coverImage,                        // <-- Fetch cover image
    "authorName": author->name,
    "authorImage": author->authorImage, // <-- Fetch author image
    "categoryTitle": category->title,
    "categoryId": category->_id
  }`;

  const rawPost: Omit<InsightPostDetail, 'readTime'> = await client.fetch(postQuery, { slug });

  if (!rawPost) {
    return notFound();
  }

  const post: InsightPostDetail = {
    ...rawPost,
    readTime: calculateReadTime(rawPost.body),
  };

  // --- Fetch related posts ---
  const relatedPostsQuery = groq`*[_type == "insightPost" && category._ref == $categoryId && _id != $currentId][0...3]{
    title,
    description,
    "slug": slug.current,
    body,
    "authorName": author->name,
    "categoryTitle": category->title
  }`;

  const rawRelatedPosts = await client.fetch(relatedPostsQuery, {
    categoryId: post.categoryId,
    currentId: post._id,
  });

  const relatedPosts = (rawRelatedPosts || []).map((p: any) => ({
    ...p,
    readTime: calculateReadTime(p.body),
  }));

  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      {/* Hero Section with Cover Image and Overlapping Text */}
      <section className="relative w-full h-[70vh] md:h-[85vh] flex items-end">
        {/* Cover Image */}
        {post.coverImage && (
          <Image
            src={urlFor(post.coverImage).url()}
            alt={post.title}
            fill
            className="object-cover brightness-90"
            priority
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Text Content Overlapping the Image */}
        <div className="relative z-10 container mx-auto px-6 pb-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-4">
              <span className="inline-block px-4 py-2 bg-fuchsia-500/30 text-fuchsia-300 rounded-full text-sm font-semibold border border-fuchsia-500/40">
                {post.categoryTitle}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white drop-shadow-lg">
              {post.title}
            </h1>

            {/* Author + Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-4">
              <div className="flex items-center gap-4">
                {post.authorImage ? (
                  <Image
                    src={urlFor(post.authorImage).url()}
                    alt={post.authorName}
                    width={64}
                    height={64}
                    className="rounded-full border-2 border-fuchsia-400 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full border-2 border-white/30 bg-fuchsia-500/30 flex items-center justify-center">
                    <span className="text-fuchsia-300 font-semibold text-xl">
                      {post.authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-white text-lg">{post.authorName}</p>
                  <p className="text-sm text-gray-400">Author</p>
                </div>
              </div>

              <div className="h-8 w-px bg-gray-600" />

              <div className="text-sm">
                <p className="text-white font-medium">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-gray-400">Published</p>
              </div>
            </div>

            {/* Short Description */}
            <p className="text-xl text-gray-200 leading-relaxed max-w-3xl drop-shadow-md">
              {post.description}
            </p>
          </div>
        </div>
      </section>


      {/* Article Content */}
      <article className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg prose-invert max-w-none">
              <PortableText value={post.body} components={ptComponents} />
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-gray-900/50">
          <div className="container mx-auto px-6">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-12 text-center">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost: any) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/insights/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 hover:transform hover:scale-105">
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-xs font-semibold mb-3">
                          {relatedPost.categoryTitle}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-400 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {relatedPost.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                            <span className="text-fuchsia-400 font-semibold text-xs">
                              {relatedPost.authorName.charAt(0)}
                            </span>
                          </div>
                          <span>{relatedPost.authorName}</span>
                          <span>·</span>
                          <span>{relatedPost.readTime}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
