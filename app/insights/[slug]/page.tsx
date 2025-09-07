import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { insightsData, type InsightPost } from "../../data/insights";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all blog posts
export async function generateStaticParams() {
  return insightsData.map((post) => ({
    slug: post.slug,
  }));
}

// Generate metadata for each post
export async function generateMetadata({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = insightsData.find((p) => p.slug === slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: `${post.title} | Dialogus Insights`,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image],
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  const post = insightsData.find((p) => p.slug === slug);

  if (!post) return notFound();

  // Get related posts (excluding current post)
  const relatedPosts = insightsData.filter((p) => p.slug !== slug).slice(0, 3);

  return (
    <main className="pt-24 bg-black text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-6 pt-32 pb-16">
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
                <Image
                  src={post.authorImg}
                  alt={post.author}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
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
              {post.body.split("\n\n").map((paragraph, index) => {
                // Handle headings
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2
                      key={index}
                      className="text-3xl font-bold text-white mt-12 mb-6 first:mt-0"
                    >
                      {paragraph.replace("## ", "")}
                    </h2>
                  );
                }

                // Handle regular paragraphs
                if (paragraph.trim()) {
                  return (
                    <p
                      key={index}
                      className="text-gray-300 leading-relaxed mb-6 text-lg"
                    >
                      {paragraph.trim()}
                    </p>
                  );
                }

                return null;
              })}
            </div>

            {/* Article Footer */}
            <div className="mt-16 pt-8 border-t border-gray-800">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <Image
                    src={post.authorImg}
                    alt={post.author}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-full border-2 border-fuchsia-500/30"
                  />
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
                      <div className="aspect-video overflow-hidden relative">
                        <Image
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-6">
                        <span className="inline-block px-3 py-1 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-xs font-semibold mb-3">
                          {relatedPost.category}
                        </span>
                        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-fuchsia-400 transition-colors">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                          {relatedPost.description}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <Image
                            src={relatedPost.authorImg}
                            alt={relatedPost.author}
                            width={24}
                            height={24}
                            className="w-6 h-6 rounded-full"
                          />
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
