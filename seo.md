# Dialogus SEO Optimization - Code Changes Guide

This document lists every code change required for SEO optimization, organized by file. Each section includes the file path, an explanation of what is being changed and why, and the exact code to implement.

---

## Table of Contents

1. [Root Layout — `dialogus-next/app/layout.tsx`](#1-root-layout)
2. [Blog Post Page — `dialogus-next/app/insights/[slug]/page.tsx`](#2-blog-post-page)
3. [Insights Listing — `dialogus-next/app/insights/page.tsx`](#3-insights-listing-page)
4. [Videos Page — `dialogus-next/app/videos/page.tsx`](#4-videos-page)
5. [Shorts Page — `dialogus-next/app/shorts/page.tsx`](#5-shorts-page)
6. [Shows Page — `dialogus-next/app/shows/page.tsx`](#6-shows-page)
7. [Hosts Page — `dialogus-next/app/hosts/page.tsx`](#7-hosts-page)
8. [About Page — `dialogus-next/app/about/page.tsx`](#8-about-page)
9. [Privacy Page — `dialogus-next/app/privacy/page.tsx`](#9-privacy-page)
10. [Disclaimer Page — `dialogus-next/app/disclaimer/page.tsx`](#10-disclaimer-page)
11. [Terms Page — `dialogus-next/app/terms/page.tsx`](#11-terms-page)
12. [Sitemap — `dialogus-next/app/sitemap.ts`](#12-sitemap)

---

<a id="1-root-layout"></a>
## 1. Root Layout

**File:** `dialogus-next/app/layout.tsx`

### What is changing and why

- **`metadataBase`**: Without this, all relative Open Graph image URLs (e.g. `/logo3.jpg`) will not resolve to absolute URLs. Search engines and social platforms need absolute URLs to display preview images. This is the single most critical missing piece.
- **`title.template`**: Instead of every child page manually appending `| Dialogus` to its title, a template like `%s | Dialogus` in the root layout handles it automatically. The `default` key is used when no child page sets a title.
- **Root-level `openGraph` and `twitter`**: Sets default OG/Twitter metadata (site name, locale, type, default image) that all pages inherit. Any child page can override these.
- **`alternates.canonical`**: Sets the canonical URL for the homepage to prevent duplicate content issues (e.g. `www` vs non-`www`, trailing slashes).
- **Organization + WebSite JSON-LD**: Structured data that tells Google "this is an organization called Dialogus with this logo and this website". This enables the Knowledge Panel and Sitelinks Search Box in Google results.
- **Preconnect for `cdn.sanity.io`**: Blog images are loaded from Sanity's CDN. Adding a preconnect hint reduces latency when loading these images, improving Largest Contentful Paint (LCP).

### Full updated file

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

> **Note:** Update the `sameAs` array in `organizationJsonLd` with your actual YouTube channel URL, and add any other social profiles (Twitter/X, Instagram, LinkedIn, etc.) you have.

---

<a id="2-blog-post-page"></a>
## 2. Blog Post Page

**File:** `dialogus-next/app/insights/[slug]/page.tsx`

### What is changing and why

This is the most SEO-critical page on the site since blog posts are indexed individually by search engines.

- **OG Image from cover image**: The `generateMetadata` GROQ query currently does not fetch `coverImage`. We add it, then use the `urlFor()` helper to build a sized image URL (1200x630 is the standard OG image size). This ensures a rich preview when links are shared on social media.
- **Twitter image**: Same as OG image, set explicitly so Twitter displays the large image card.
- **Canonical URL**: Each blog post gets its own canonical URL (`/insights/{slug}`) to tell search engines this is the definitive URL for this content.
- **Title simplified**: Since the root layout now has `template: "%s | Dialogus"`, we only need to set the raw title (e.g. `"Post Title"`) and the template auto-appends `| Dialogus`.
- **Article JSON-LD**: This structured data tells Google "this is a news/blog article with this headline, author, date, and image". It enables rich results like article cards with thumbnail, date, and author in Google Search.
- **BreadcrumbList JSON-LD**: Tells Google the navigation path (Home > Insights > Post Title). This shows breadcrumb trails in search results, improving click-through rate.
- **Semantic `<article>` tag**: The content body is already in an `<article>` tag (good). We wrap the entire page in `<article>` and add a `<time>` element with a `dateTime` attribute for machine-readable dates.

### Changes to `generateMetadata` function

Replace the current `generateMetadata` function (lines 44-75) with:

```tsx
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
```

### Changes to the page component

In the `BlogPost` component (the `return` JSX), add JSON-LD structured data. Insert this block right after the line `const relatedPosts = ...` and before `return (`:

```tsx
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
```

Then, at the very top of the returned JSX (inside `<main>`, before the hero section), add:

```tsx
    <main className="pt-24 bg-white text-gray-900 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* ... rest of the page ... */}
```

### Add `<time>` element for date

Find the date display section (around line 222-231) and wrap the date text in a `<time>` tag:

Replace:
```tsx
                <p className="text-gray-900 font-medium">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
```

With:
```tsx
                <time dateTime={post.date} className="text-gray-900 font-medium block">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </time>
```

---

<a id="3-insights-listing-page"></a>
## 3. Insights Listing Page

**File:** `dialogus-next/app/insights/page.tsx`

### What is changing and why

This page currently has no `metadata` export. It inherits the generic root title "Dialogus - Debate Discuss Decide". Search engines see all pages with the same title as potentially duplicate content. Adding a unique title and description for the insights listing page:

- Helps Google understand this is a distinct page about blog articles/insights
- Improves click-through rate from search results with a more specific title
- The canonical URL prevents duplicate indexing from paginated URLs (`?page=2`, `?page=3`, etc.)

### Code to add

Add this `metadata` export at the top of the file, after the imports and before `const POSTS_PER_PAGE`:

```tsx
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
```

---

<a id="4-videos-page"></a>
## 4. Videos Page

**File:** `dialogus-next/app/videos/page.tsx`

### What is changing and why

Same reasoning as the insights page — this page currently has no metadata at all. Adding a unique title, description, and canonical URL so Google indexes it as a distinct page about Dialogus video content.

### Code to add

Add this `metadata` export at the top of the file, after the imports and before the component:

```tsx
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
```

---

<a id="5-shorts-page"></a>
## 5. Shorts Page

**File:** `dialogus-next/app/shorts/page.tsx`

### What is changing and why

Same as above. Adding unique metadata for the shorts listing page.

### Code to add

Add after the imports and before the component:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shorts - Quick Insights & Highlights",
  description:
    "Watch quick insights and highlights from Dialogus shows. Bite-sized analysis on current affairs, politics, and more.",
  alternates: {
    canonical: "/shorts",
  },
  openGraph: {
    title: "Shorts - Quick Insights & Highlights",
    description:
      "Watch quick insights and highlights from Dialogus shows.",
    type: "website",
  },
};
```

---

<a id="6-shows-page"></a>
## 6. Shows Page

**File:** `dialogus-next/app/shows/page.tsx`

### What is changing and why

This is a `"use client"` component, which means you **cannot** export a static `metadata` object from it. Instead, we need to either:

- **(Option A — Recommended):** Create a separate `dialogus-next/app/shows/layout.tsx` file that exports the metadata, or
- **(Option B):** Remove `"use client"` from the page and refactor the client-side IntersectionObserver logic into a separate client component.

**We will go with Option A** — create a thin layout wrapper that exports metadata.

### New file to create: `dialogus-next/app/shows/layout.tsx`

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

No changes needed to `dialogus-next/app/shows/page.tsx` itself.

---

<a id="7-hosts-page"></a>
## 7. Hosts Page

**File:** `dialogus-next/app/hosts/page.tsx`

### What is changing and why

This is a server component (no `"use client"`), so we can directly export metadata. Adding a unique title and description for the hosts/speakers page.

### Code to add

Add at the top of the file, after the import:

```tsx
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
```

---

<a id="8-about-page"></a>
## 8. About Page

**File:** `dialogus-next/app/about/page.tsx`

### What is changing and why

Same as the shows page — this is a `"use client"` component, so we cannot export metadata directly. We create a layout wrapper.

### New file to create: `dialogus-next/app/about/layout.tsx`

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

No changes needed to `dialogus-next/app/about/page.tsx` itself.

---

<a id="9-privacy-page"></a>
## 9. Privacy Page

**File:** `dialogus-next/app/privacy/page.tsx`

### What is changing and why

Another `"use client"` component. We create a layout wrapper for metadata.

### New file to create: `dialogus-next/app/privacy/layout.tsx`

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

No changes needed to `dialogus-next/app/privacy/page.tsx` itself.

---

<a id="10-disclaimer-page"></a>
## 10. Disclaimer Page

**File:** `dialogus-next/app/disclaimer/page.tsx`

### What is changing and why

Another `"use client"` component. We create a layout wrapper for metadata.

### New file to create: `dialogus-next/app/disclaimer/layout.tsx`

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

No changes needed to `dialogus-next/app/disclaimer/page.tsx` itself.

---

<a id="11-terms-page"></a>
## 11. Terms Page

**File:** `dialogus-next/app/terms/page.tsx`

### What is changing and why

Another `"use client"` component. We create a layout wrapper for metadata.

### New file to create: `dialogus-next/app/terms/layout.tsx`

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

No changes needed to `dialogus-next/app/terms/page.tsx` itself.

---

<a id="12-sitemap"></a>
## 12. Sitemap

**File:** `dialogus-next/app/sitemap.ts`

### What is changing and why

The current sitemap is missing 4 pages: `/hosts`, `/privacy`, `/disclaimer`, and `/terms`. Search engines rely on the sitemap to discover all pages. If a page is not in the sitemap, it may take much longer (or never) for Google to index it.

### Full updated file

```ts
import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://www.dialogus.co.in';

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

## Summary of All Changes

### Files to modify (4 files)

| File | Changes |
|------|---------|
| `dialogus-next/app/layout.tsx` | Add `metadataBase`, `title.template`, OG/Twitter defaults, canonical, Organization + WebSite JSON-LD, preconnect for Sanity CDN |
| `dialogus-next/app/insights/[slug]/page.tsx` | Add OG image + Twitter image + canonical to `generateMetadata`, add Article + BreadcrumbList JSON-LD, wrap date in `<time>` |
| `dialogus-next/app/insights/page.tsx` | Add `metadata` export with title, description, canonical, OG |
| `dialogus-next/app/sitemap.ts` | Add missing pages: `/hosts`, `/privacy`, `/disclaimer`, `/terms` |

### Files to modify (adding metadata import + export) (2 files)

| File | Changes |
|------|---------|
| `dialogus-next/app/videos/page.tsx` | Add `metadata` export |
| `dialogus-next/app/hosts/page.tsx` | Add `metadata` export |

### New files to create (5 layout files for `"use client"` pages)

| File | Purpose |
|------|---------|
| `dialogus-next/app/shows/layout.tsx` | Metadata wrapper for shows page (client component) |
| `dialogus-next/app/about/layout.tsx` | Metadata wrapper for about page (client component) |
| `dialogus-next/app/privacy/layout.tsx` | Metadata wrapper for privacy page (client component) |
| `dialogus-next/app/disclaimer/layout.tsx` | Metadata wrapper for disclaimer page (client component) |
| `dialogus-next/app/terms/layout.tsx` | Metadata wrapper for terms page (client component) |

### No external packages needed

All changes use built-in Next.js 15 metadata API features. No new `npm` dependencies are required.
