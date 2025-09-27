// app/videos/page.tsx
import { Suspense } from "react";
import VideosGrid from "./VideosGrid";
import VideoSkeleton from "./VideoSkeleton";
import { fetchYouTubeVideos } from '@/lib/youtubeService';

// --- REACT SERVER COMPONENT (OPTIMIZED) ---
export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; token?: string }>;
}) {
  const { page = "1", token = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  const { videos, nextPageToken, prevPageToken, error } = await fetchYouTubeVideos(
    currentPage,
    token
  );

  if (error) {
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28 bg-black">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white mb-4">
                Error Loading Videos
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
      <section id="videos" className="py-20 md:py-28 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="section-title text-3xl md:text-5xl mb-4 font-bold">
              Watch It All
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              Binge the complete collection of Dialogus shows here
            </p>
          </div>

          <Suspense
            key={token}
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
            />
          </Suspense>
        </div>
      </section>
    </main>
  );
}