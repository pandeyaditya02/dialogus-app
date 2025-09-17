// app/shorts/page.tsx
import { Suspense } from "react";
import ShortsGrid from "./ShortsGrid";
import ShortsSkeleton from "./ShortsSkeleton";

// --- TYPE DEFINITIONS ---
// These remain the same as they correctly define the API response structure.
interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubePlaylistItem {
  id: string;
  snippet: {
    resourceId: {
      videoId: string;
    };
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
      default?: YouTubeThumbnail;
      medium?: YouTubeThumbnail;
      high?: YouTubeThumbnail;
      standard?: YouTubeThumbnail;
      maxres?: YouTubeThumbnail;
    };
  };
}

// --- DATA FETCHING FUNCTION (OPTIMIZED) ---

/**
 * Fetches a page of shorts directly from a specified YouTube playlist.
 * @param page The current page number (for context).
 * @param token The page token from the YouTube API to fetch the correct page.
 * @returns An object containing the shorts, pagination tokens, and any errors.
 */
async function fetchShorts(page = 1, token = "") {
  const apiKey = process.env.YOUTUBE_API_KEY!;
  
  // The ID of your dedicated shorts playlist.
  // Updated to use the playlist ID from the provided URL
  const shortsPlaylistId = "PLiWELLjBSGHIMAEvQRZgAEJilyYjEjaBx";
  const shortsPerPage = 12; // More items per page for shorts

  if (!apiKey || !shortsPlaylistId) {
    return {
      shorts: [],
      nextPageToken: null,
      prevPageToken: null,
      error: "Missing YouTube API Key or Playlist ID configuration.",
    };
  }

  try {
    // A single, efficient API call to get the shorts for the current page.
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${shortsPlaylistId}&maxResults=${shortsPerPage}&pageToken=${token}&key=${apiKey}`,
      {
        // Adjust the revalidation time based on how often you update the playlist.
        // 43200 seconds = 12 hours.
        next: { revalidate: 43200 }, 
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Failed to fetch shorts from the playlist");
    }

    if (!data.items) {
        // Handle cases where the playlist might be empty
        return { shorts: [], nextPageToken: null, prevPageToken: null, error: null };
    }

    // Map the API response to the format your components expect.
    const shorts = data.items.map((item: YouTubePlaylistItem) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        "https://i.ytimg.com/vi/default.jpg", // Fallback image
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      shorts,
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken,
      error: null,
    };
  } catch (error) {
    console.error("YouTube API Error:", error);
    return {
      shorts: [],
      nextPageToken: null,
      prevPageToken: null,
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching shorts",
    };
  }
}

// --- REACT SERVER COMPONENT (OPTIMIZED) ---
export default async function ShortsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; token?: string }>;
}) {
  const { page = "1", token = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  const { shorts, nextPageToken, prevPageToken, error } = await fetchShorts(
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
              Dialogus Shorts
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              Quick insights and highlights from our conversations
            </p>
          </div>

          <Suspense
            key={token} // Add a key to Suspense to make it re-render on page change
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {[...Array(12)].map((_, i) => <ShortsSkeleton key={i} />)}
              </div>
            }
          >
            <ShortsGrid
              shorts={shorts}
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
