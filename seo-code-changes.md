# SEO Optimization - Complete Code Changes

This document contains every code change made for the Dialogus SEO optimization, organized by file with complete file paths and full file contents.

---

## Table of Contents

1. [Root Layout (Modified)](#1-root-layout)
2. [Blog Post Page (Modified)](#2-blog-post-page)
3. [Insights Listing (Modified)](#3-insights-listing)
4. [Videos Page (Modified)](#4-videos-page)
5. [Hosts Page (Modified)](#5-hosts-page)
6. [Sitemap (Modified)](#6-sitemap)
7. [Shows Layout (New File)](#7-shows-layout)
8. [About Layout (New File)](#8-about-layout)
9. [Privacy Layout (New File)](#9-privacy-layout)
10. [Disclaimer Layout (New File)](#10-disclaimer-layout)
11. [Terms Layout (New File)](#11-terms-layout)

---

<a id="1-root-layout"></a>
## 1. Root Layout (Modified)

**File Path:** `dialogus-next/app/layout.tsx`

**Changes Made:**
- Added `metadataBase` so all OG image URLs resolve as absolute URLs
- Added `title.template` (`%s | Dialogus`) so child pages get consistent suffix
- Added default `openGraph` and `twitter` metadata inherited by all pages
- Added `alternates.canonical` for the homepage
- Added Organization + WebSite JSON-LD structured data
- Added `preconnect` and `dns-prefetch` for `cdn.sanity.io`

**Full File Content:**

```tsx
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Adsense from "./components/Adsense";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.dialogus.co.in"),
    title: {
        default: "Dialogus - Debate Discuss Decide",
        template: "%s | Dialogus",
    },
    description:
        "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
    icons: {
        icon: "/logo3.jpg",
    },
    openGraph: {
        siteName: "Dialogus",
        type: "website",
        locale: "en_IN",
        images: [
            {
                url: "/logo3.jpg",
                width: 800,
                height: 600,
                alt: "Dialogus - Debate Discuss Decide",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: ["/logo3.jpg"],
    },
    alternates: {
        canonical: "/",
    },
    other: {
        "google-adsense-account": "ca-pub-1871872152018500",
    },
};

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["300", "400", "500", "600", "700", "800"],
    preload: true,
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
    preload: true,
});

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dialogus",
    url: "https://www.dialogus.co.in",
    logo: "https://www.dialogus.co.in/logo3.jpg",
    description:
        "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
    sameAs: [
        "https://www.youtube.com/@dialogus",
    ],
};

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dialogus",
    url: "https://www.dialogus.co.in",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable}`}>
            <head>
                <Adsense />
                <link rel="preconnect" href="https://www.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.googleapis.com" />
                <link rel="preconnect" href="https://cdn.sanity.io" />
                <link rel="dns-prefetch" href="https://cdn.sanity.io" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationJsonLd),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(websiteJsonLd),
                    }}
                />
            </head>
            <body className="antialiased font-smooth">
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
```

---

<a id="2-blog-post-page"></a>
## 2. Blog Post Page (Modified)

**File Path:** `dialogus-next/app/insights/[slug]/page.tsx`

**Changes Made:**
- `generateMetadata` now fetches `coverImage` and builds OG image URL (1200x630)
- Added `alternates.canonical` per post (`/insights/{slug}`)
- Added OG images and Twitter images from cover image
- Simplified title (removed manual `| Dialogus Insights` suffix since root template handles it)
- Added Article JSON-LD structured data
- Added BreadcrumbList JSON-LD structured data
- Replaced date `<p>` tag with semantic `<time>` element with `dateTime` attribute

**Full File Content:**

```tsx
// file: dialogus-next/app/insights/[slug]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { groq } from "next-sanity";
import { client, urlFor } from "@/lib/sanity.client";
import { PortableText } from "@portabletext/react";
import { type PortableTextBlock } from "sanity";
import ShareButton from "@/app/components/ShareButton";

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
  coverImage: any; // <-- Added new field
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
    coverImage,
    "authorName": author->name
  }`;
  const post = await client.fetch(query, { slug });

  if (!post) {
    return { title: "Post Not Found" };
  }

  const ogImage = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : undefined;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: `/insights/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.authorName],
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: post.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: ogImage ? [ogImage] : [],
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
      <h2 className="text-3xl font-bold text-gray-900 mt-12 mb-6 first:mt-0">
        {children}
      </h2>
    ),
    normal: ({ children }: any) => (
      <p className="text-gray-700 leading-relaxed mb-6 text-lg">
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

  const ogImage = post.coverImage
    ? urlFor(post.coverImage).width(1200).height(630).url()
    : undefined;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: ogImage,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Dialogus",
      logo: {
        "@type": "ImageObject",
        url: "https://www.dialogus.co.in/logo3.jpg",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.dialogus.co.in/insights/${slug}`,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.dialogus.co.in",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Insights",
        item: "https://www.dialogus.co.in/insights",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://www.dialogus.co.in/insights/${slug}`,
      },
    ],
  };

  return (
    <main className="pt-24 bg-white text-gray-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* Hero Section with Cover Image and Overlapping Text */}
      {/* Hero Section with Cover Image and Overlapping Text */}
      <section className="relative w-full min-h-[70vh] md:min-h-[85vh] flex items-end">
        {/* Cover Image */}
        {post.coverImage && (
          <Image
            src={urlFor(post.coverImage).url()}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent" />

        {/* Text Content */}
        <div className="relative z-10 w-full px-4 sm:px-6 md:px-10 pb-10 sm:pb-16">
          <div className="max-w-4xl mx-auto text-center md:text-left">
            {/* Category Badge */}
            <div className="mt-3 mb-3 sm:mb-4">
              <span className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs sm:text-sm font-semibold border border-fuchsia-300">
                {post.categoryTitle}
              </span>
            </div>

            {/* Title */}
            <h1
              className="
          text-3xl sm:text-4xl md:text-6xl lg:text-7xl
          font-bold mb-4 sm:mb-6 leading-tight text-gray-900 drop-shadow-lg
        "
            >
              {post.title}
            </h1>

            {/* Author + Meta Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center md:justify-start gap-4 text-gray-700 mb-4 sm:mb-6 items-center">
              <div className="flex items-center gap-3">
                {post.authorImage ? (
                  <Image
                    src={urlFor(post.authorImage).url()}
                    alt={post.authorName}
                    width={64}
                    height={64}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-fuchsia-400 shadow-md object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl border-2 border-fuchsia-300 bg-fuchsia-100 flex items-center justify-center">
                    <span className="text-fuchsia-700 font-semibold text-lg sm:text-xl">
                      {post.authorName.charAt(0)}
                    </span>
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-base sm:text-lg">{post.authorName}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Author</p>
                </div>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-300" />

              <div className="text-xs sm:text-sm text-center sm:text-left">
                <time dateTime={post.date} className="text-gray-900 font-medium block">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
                <p className="text-gray-600">Published</p>
              </div>

              <div className="hidden sm:block h-8 w-px bg-gray-300" />

              <div className="flex items-center">
                <ShareButton
                  title={post.title}
                  text={post.description}
                />
              </div>
            </div>


            {/* Short Description */}
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-2xl sm:max-w-3xl mx-auto md:mx-0">
              {post.description}
            </p>
          </div>
        </div>
      </section>



      {/* Article Content */}
      <article className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none">
              <PortableText value={post.body} components={ptComponents} />
            </div>
          </div>
        </div>
      </article>

      {/* More on DIALOGUS */}
      {
        relatedPosts.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-6">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
                  More on DIALOGUS
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost: any) => (
                    <Link
                      key={relatedPost.slug}
                      href={`/insights/${relatedPost.slug}`}
                      className="group block"
                    >
                      <article className="bg-white rounded-2xl overflow-hidden hover:bg-gray-50 transition-all duration-300 hover:transform hover:scale-105 border border-gray-200 shadow-sm hover:shadow-md">
                        <div className="p-6">
                          <span className="inline-block px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-xs font-semibold mb-3">
                            {relatedPost.categoryTitle}
                          </span>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-fuchsia-600 transition-colors">
                            {relatedPost.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                            {relatedPost.description}
                          </p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-6 h-6 rounded-full bg-fuchsia-100 flex items-center justify-center">
                              <span className="text-fuchsia-700 font-semibold text-xs">
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
        )
      }
    </main >
  );
}
```

---

<a id="3-insights-listing"></a>
## 3. Insights Listing (Modified)

**File Path:** `dialogus-next/app/insights/page.tsx`

**Changes Made:**
- Added `import type { Metadata } from "next"`
- Added `metadata` export with unique title, description, canonical URL, and OpenGraph

**Full File Content:**

```tsx
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
  searchParams: { [key: string]: string | string[] | undefined };
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
```

---

<a id="4-videos-page"></a>
## 4. Videos Page (Modified)

**File Path:** `dialogus-next/app/videos/page.tsx`

**Changes Made:**
- Added `import type { Metadata } from "next"`
- Added `metadata` export with unique title, description, canonical URL, and OpenGraph

**Full File Content:**

```tsx
// app/videos/page.tsx
import { Suspense } from "react";
import VideosGrid from "./VideosGrid";
import VideoSkeleton from "./VideoSkeleton";
import { fetchYouTubeVideos } from '@/lib/youtubeService';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Videos - Watch Dialogus Shows",
  description:
    "Watch the complete collection of Dialogus shows covering politics, business, law, and culture with data-driven analysis.",
  alternates: {
    canonical: "/videos",
  },
  openGraph: {
    title: "Videos - Watch Dialogus Shows",
    description:
      "Watch the complete collection of Dialogus shows covering politics, business, law, and culture.",
    type: "website",
  },
};

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; token?: string }>;
}) {
  const { page = "1", token = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  // Destructure the new totalPages property
  const { videos, nextPageToken, prevPageToken, totalPages, error } = await fetchYouTubeVideos(
    currentPage,
    token
  );

  if (error) {
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-gray-900 mb-4">
                Error Loading Videos
              </h2>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-24">
      <section id="videos" className="py-20 md:py-28">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="section-title text-3xl md:text-5xl mb-4 font-bold">
              Watch It All
            </h2>
            <p className="text-gray-600 text-lg md:text-xl">
              Binge the complete collection of Dialogus shows here
            </p>
          </div>

          <Suspense
            key={token || 'initial'} // Use token or a fallback key
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                {[...Array(9)].map((_, i) => <VideoSkeleton key={i} />)}
              </div>
            }
          >
            <VideosGrid
              videos={videos}
              currentPage={currentPage}
              nextPageToken={nextPageToken}
              prevPageToken={prevPageToken}
              totalPages={totalPages} // Pass totalPages down
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
```

---

<a id="5-hosts-page"></a>
## 5. Hosts Page (Modified)

**File Path:** `dialogus-next/app/hosts/page.tsx`

**Changes Made:**
- Added `import type { Metadata } from "next"`
- Added `metadata` export with unique title, description, canonical URL, and OpenGraph

**Full File Content:**

```tsx
import Speakers from "../components/Speakers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Hosts - Meet the Dialogus Team",
  description:
    "Meet the hosts and speakers who bring you data-driven analysis and insightful discussions on Dialogus.",
  alternates: {
    canonical: "/hosts",
  },
  openGraph: {
    title: "Our Hosts - Meet the Dialogus Team",
    description:
      "Meet the hosts and speakers who bring you insightful discussions on Dialogus.",
    type: "website",
  },
};

export default function HostsPage() {
  return (
    <main className="pt-24 min-h-screen">
      <Speakers />
    </main>
  );
}
```

---

<a id="6-sitemap"></a>
## 6. Sitemap (Modified)

**File Path:** `dialogus-next/app/sitemap.ts`

**Changes Made:**
- Added `/hosts` (monthly, priority 0.6)
- Added `/privacy` (yearly, priority 0.3)
- Added `/disclaimer` (yearly, priority 0.3)
- Added `/terms` (yearly, priority 0.3)

**Full File Content:**

```ts
import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.dialogus.co.in';

    // Fetch all insight posts
    const query = groq`*[_type == "insightPost"]{
    "slug": slug.current,
    _updatedAt
  }`;
    const posts = await client.fetch(query);

    const postUrls = posts.map((post: any) => ({
        url: `${baseUrl}/insights/${post.slug}`,
        lastModified: new Date(post._updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/videos`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/shows`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/shorts`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/insights`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/hosts`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/disclaimer`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        ...postUrls,
    ];
}
```

---

<a id="7-shows-layout"></a>
## 7. Shows Layout (New File)

**File Path:** `dialogus-next/app/shows/layout.tsx`

**Purpose:** Thin Server Component wrapper that exports metadata for the `"use client"` shows page.

**Full File Content:**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Shows - Explore Dialogus Playlists",
  description:
    "Explore the diverse collection of Dialogus shows including World View, Talk It Out, Clear Cut, and more. Watch complete playlists on YouTube.",
  alternates: {
    canonical: "/shows",
  },
  openGraph: {
    title: "Our Shows - Explore Dialogus Playlists",
    description:
      "Explore the diverse collection of Dialogus shows.",
    type: "website",
  },
};

export default function ShowsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

<a id="8-about-layout"></a>
## 8. About Layout (New File)

**File Path:** `dialogus-next/app/about/layout.tsx`

**Purpose:** Thin Server Component wrapper that exports metadata for the `"use client"` about page.

**Full File Content:**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Clarity in a World of Noise",
  description:
    "Learn about Dialogus, a digital media platform committed to cutting through the noise with data-driven analysis covering politics, business, law, and culture.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Dialogus - Clarity in a World of Noise",
    description:
      "Learn about Dialogus, a digital media platform committed to cutting through the noise.",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

<a id="9-privacy-layout"></a>
## 9. Privacy Layout (New File)

**File Path:** `dialogus-next/app/privacy/layout.tsx`

**Purpose:** Thin Server Component wrapper that exports metadata for the `"use client"` privacy page.

**Full File Content:**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Dialogus Privacy Policy. Learn how we collect, use, and safeguard your personal information in compliance with Indian data protection laws.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy - Dialogus",
    description:
      "Learn how Dialogus collects, uses, and safeguards your personal information.",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

<a id="10-disclaimer-layout"></a>
## 10. Disclaimer Layout (New File)

**File Path:** `dialogus-next/app/disclaimer/layout.tsx`

**Purpose:** Thin Server Component wrapper that exports metadata for the `"use client"` disclaimer page.

**Full File Content:**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Read the Dialogus Disclaimer Notice. Content is for informational purposes only and does not constitute professional advice.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "Disclaimer - Dialogus",
    description:
      "Read the Dialogus Disclaimer Notice covering content use and limitations.",
    type: "website",
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

<a id="11-terms-layout"></a>
## 11. Terms Layout (New File)

**File Path:** `dialogus-next/app/terms/layout.tsx`

**Purpose:** Thin Server Component wrapper that exports metadata for the `"use client"` terms page.

**Full File Content:**

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Dialogus Terms of Service. By using our platform you agree to these terms governing content use, user conduct, and liability.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service - Dialogus",
    description:
      "Read the Dialogus Terms of Service governing platform use.",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
```

---

## Summary of All Changes

### Modified Files (6)

| # | File Path | Key Changes |
|---|-----------|-------------|
| 1 | `dialogus-next/app/layout.tsx` | `metadataBase`, `title.template`, OG/Twitter defaults, canonical, Organization + WebSite JSON-LD, preconnect for `cdn.sanity.io` |
| 2 | `dialogus-next/app/insights/[slug]/page.tsx` | Fetch `coverImage` in metadata query, OG/Twitter images, canonical URL, Article + BreadcrumbList JSON-LD, semantic `<time>` element |
| 3 | `dialogus-next/app/insights/page.tsx` | Added `metadata` export with unique title, description, canonical, OG |
| 4 | `dialogus-next/app/videos/page.tsx` | Added `metadata` export with unique title, description, canonical, OG |
| 5 | `dialogus-next/app/hosts/page.tsx` | Added `metadata` export with unique title, description, canonical, OG |
| 6 | `dialogus-next/app/sitemap.ts` | Added `/hosts`, `/privacy`, `/disclaimer`, `/terms` entries |

### New Files Created (5)

| # | File Path | Purpose |
|---|-----------|---------|
| 7 | `dialogus-next/app/shows/layout.tsx` | Metadata wrapper for `"use client"` shows page |
| 8 | `dialogus-next/app/about/layout.tsx` | Metadata wrapper for `"use client"` about page |
| 9 | `dialogus-next/app/privacy/layout.tsx` | Metadata wrapper for `"use client"` privacy page |
| 10 | `dialogus-next/app/disclaimer/layout.tsx` | Metadata wrapper for `"use client"` disclaimer page |
| 11 | `dialogus-next/app/terms/layout.tsx` | Metadata wrapper for `"use client"` terms page |

### SEO Gaps Resolved

| Gap | Resolution |
|-----|-----------|
| No `metadataBase` | Added to root layout -- all OG images now resolve as absolute URLs |
| No `title.template` | Added `%s \| Dialogus` template -- all child pages get consistent suffix |
| 10 of 12 pages with no unique title/description | All pages now have unique metadata exports |
| No OG images on blog posts | `coverImage` fetched in `generateMetadata`, used for OG/Twitter images |
| Zero structured data (JSON-LD) | Organization, WebSite, Article, and BreadcrumbList schemas added |
| No canonical URLs | `alternates.canonical` added to every page |
| 5 `"use client"` pages cannot export metadata | Layout wrappers created for shows, about, privacy, disclaimer, terms |
| 4 pages missing from sitemap | `/hosts`, `/privacy`, `/disclaimer`, `/terms` added to sitemap |

### No New Dependencies

All changes use built-in Next.js 15 metadata APIs. No new npm packages required.
