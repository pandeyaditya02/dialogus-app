import { notFound } from "next/navigation";
import Link from "next/link";
import { client } from "../../../sanity/lib/client";
import { groq } from "next-sanity";
import { PortableText } from "@portabletext/react";

interface BlogPostProps { params: { slug: string } }

// Generate static params for all blog posts
export async function generateStaticParams() {
  const slugs: { slug: string }[] = await client.fetch(groq`*[_type=='post' && defined(slug.current)]{"slug": slug.current}`);
  return slugs.map((s) => ({ slug: s.slug }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: BlogPostProps) {
  const { slug } = params;
  const post = await client.fetch(groq`*[_type=='post' && slug.current==$slug][0]{ title, excerpt }`, { slug });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Dialogus Insights`,
    description: post.excerpt ?? "",
    openGraph: {
      title: post.title,
      description: post.excerpt ?? "",
      type: "article",
      // You can extend with publishedTime/authors if you query them above
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.excerpt ?? "",
    },
  };
}

const postBySlugQuery = groq`*[_type=='post' && slug.current==$slug][0]{
  "slug": slug.current,
  title,
  excerpt,
  "date": coalesce(publishedAt, _createdAt),
  "author": author->name,
  "readTime": coalesce(readTime, ""),
  "category": categories[0]->title,
  body
}`;

const relatedQuery = groq`*[_type=='post' && slug.current!=$slug][0...3]{
  "slug": slug.current,
  title,
  excerpt,
  "readTime": coalesce(readTime, ""),
  "category": categories[0]->title,
  "author": author->name
}`;

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = params;
  const post = await client.fetch(postBySlugQuery, { slug });

  if (!post) return notFound();

  // Get related posts (excluding current post)
  const relatedPosts = await client.fetch(relatedQuery, { slug });

  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      {/* Header Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Category Badge */}
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-sm font-semibold border border-fuchsia-500/30">
                {post.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-fuchsia-400 font-semibold text-lg">
                    {post.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{post.author}</p>
                  <p className="text-sm text-gray-400">Author</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-600" />
              <div className="text-sm">
                <p className="text-white font-medium">{post.date}</p>
                <p className="text-gray-400">Published</p>
              </div>
              <div className="h-8 w-px bg-gray-600" />
              <div className="text-sm">
                <p className="text-white font-medium">{post.readTime}</p>
                <p className="text-gray-400">Read time</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
              {post.description}
            </p>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Article Body */}
            <div className="prose prose-lg prose-invert max-w-none">
              <PortableText value={post.body} />
            </div>

            {/* Article Footer */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-fuchsia-500/30 bg-fuchsia-500/20 flex items-center justify-center">
                    <span className="text-fuchsia-400 font-semibold text-2xl">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {post.author}
                    </h3>
                    <p className="text-gray-400">Content Creator</p>
                  </div>
                </div>

                {/* <div className="flex gap-4">
                  <button className="px-6 py-3 bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg transition-colors">
                    Share Article
                  </button>
                  <Link
                    href="/insights"
                    className="px-6 py-3 border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white rounded-lg transition-colors"
                  >
                    Back to Insights
                  </Link>
                </div> */}
              </div>
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
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/insights/${relatedPost.slug}`}
                    className="group block"
                  >
                    <article className="bg-gray-800/50 rounded-2xl overflow-hidden hover:bg-gray-800/70 transition-all duration-300 hover:transform hover:scale-105">
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-xs font-semibold mb-3">
                          {relatedPost.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-400 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center">
                            <span className="text-fuchsia-400 font-semibold text-xs">
                              {relatedPost.author.charAt(0)}
                            </span>
                          </div>
                          <span>{relatedPost.author}</span>
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
