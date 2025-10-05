// app/shorts/page.tsx
import { Suspense } from "react";
import ShortsGrid from "./ShortsGrid";
import ShortsSkeleton from "./ShortsSkeleton";
import { fetchYouTubeShorts } from '@/lib/youtubeService';

// --- REACT SERVER COMPONENT (OPTIMIZED) ---
export default async function ShortsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  // Fetch shorts using the page number
  const { videos, totalPages, error } = await fetchYouTubeShorts(
    currentPage
  );

  if (error) {
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28 bg-black">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white mb-4">
                Error Loading Shorts
              </h2>
              <p className="text-gray-400">{error}</p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="pt-24">
      <section id="shorts" className="py-20 md:py-28 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="section-title text-3xl md:text-5xl mb-4 font-bold">
              Watch Our Shorts
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              Quick insights and highlights from our shows.
            </p>
          </div>

          <Suspense
            key={currentPage} // Use currentPage as the key for Suspense
            fallback={
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                {[...Array(12)].map((_, i) => <ShortsSkeleton key={i} />)}
              </div>
            }
          >
            <ShortsGrid
              shorts={videos}
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

