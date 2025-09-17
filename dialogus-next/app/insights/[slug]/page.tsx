import { notFound } from "next/navigation";
import Link from "next/link";
import { groq } from "next-sanity";
import { client } from "@/lib/sanity.client"; // Adjust path if needed
import { PortableText } from "@portabletext/react";
import { type PortableTextBlock } from "sanity";

// Define the TypeScript interface for a single detailed post
interface InsightPostDetail {
  _id: string;
  title: string;
  description: string;
  date: string;
  body: PortableTextBlock[];
  authorName: string;
  categoryTitle: string;
  categoryId: string; // We need this to find related posts
  readTime: string; // Calculated property
}

// Define the type for the component props
type Props = {
  params: { slug: string };
};

// --- Helper function to calculate reading time ---
const calculateReadTime = (body: PortableTextBlock[] = []): string => {
  // const wordsPerMinute = 200; // Average reading speed
  // const text = body
  //   .map((block) => {
  //     if (block._type === 'block' && block.children) {
  //       return block.children.map((child: any) => child.text).join('');
  //     }
  //     return '';
  //   })
  //   .join(' ');
  
  // const wordCount = text.split(/\s+/).filter(Boolean).length;
  // const readTime = Math.ceil(wordCount / wordsPerMinute);
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
  // ✅ **THE FIX IS HERE:** Destructure slug immediately
  const slug = await params.slug;

  const query = groq`*[_type == "insightPost" && slug.current == $slug][0]{
    title,
    description,
    date,
    "authorName": author->name
  }`;
  // Use the local 'slug' variable
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

// --- Custom components for PortableText ---
const ptComponents = {
  types: {
    // You can add custom renderers for images, etc. here
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
  // ✅ **AND THE FIX IS HERE:** Destructure slug immediately
  const slug = await params.slug;
  
  const postQuery = groq`*[_type == "insightPost" && slug.current == $slug][0]{
    _id,
    title,
    description,
    date,
    body,
    "authorName": author->name,
    "categoryTitle": category->title,
    "categoryId": category->_id
  }`;

  // Use the local 'slug' variable
  const rawPost: Omit<InsightPostDetail, 'readTime'> = await client.fetch(postQuery, { slug });

  if (!rawPost) {
    return notFound();
  }

  const post: InsightPostDetail = {
    ...rawPost,
    readTime: calculateReadTime(rawPost.body)
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
      {/* Header Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-block px-4 py-2 bg-fuchsia-500/20 text-fuchsia-400 rounded-full text-sm font-semibold border border-fuchsia-500/30">
                {post.categoryTitle}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white/20 bg-fuchsia-500/20 flex items-center justify-center">
                  <span className="text-fuchsia-400 font-semibold text-lg">
                    {post.authorName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-white">{post.authorName}</p>
                  <p className="text-sm text-gray-400">Author</p>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-600" />
              <div className="text-sm">
                <p className="text-white font-medium">{new Date(post.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-gray-400">Published</p>
              </div>
              <div className="h-8 w-px bg-gray-600" />
              <div className="text-sm">
                <p className="text-white font-medium">{post.readTime}</p>
                <p className="text-gray-400">Read time</p>
              </div>
            </div>
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
            <div className="prose prose-lg prose-invert max-w-none">
              <PortableText value={post.body} components={ptComponents} />
            </div>

            {/* Article Footer */}
            <div className="mt-16 pt-8 border-t border-gray-800">
               <div className="flex flex-wrap items-center justify-between gap-6">
                 <div className="flex items-center gap-4">
                   <div className="w-16 h-16 rounded-full border-2 border-fuchsia-500/30 bg-fuchsia-500/20 flex items-center justify-center">
                     <span className="text-fuchsia-400 font-semibold text-2xl">
                       {post.authorName.charAt(0)}
                     </span>
                   </div>
                   <div>
                     <h3 className="text-xl font-semibold text-white">
                       {post.authorName}
                     </h3>
                     <p className="text-gray-400">Content Creator</p>
                   </div>
                 </div>
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
                {relatedPosts.map((relatedPost: any) => (
                  <Link key={relatedPost.slug} href={`/insights/${relatedPost.slug}`} className="group block">
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