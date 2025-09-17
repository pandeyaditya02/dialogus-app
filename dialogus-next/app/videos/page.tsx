// app/videos/page.tsx
import { Suspense } from "react";
import VideosGrid from "./VideosGrid"; // Ensure this component exists
import VideoSkeleton from "./VideoSkeleton"; // Ensure this component exists

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
 * Fetches a page of videos directly from a specified YouTube playlist.
 * @param page The current page number (for context).
 * @param token The page token from the YouTube API to fetch the correct page.
 * @returns An object containing the videos, pagination tokens, and any errors.
 */
async function fetchVideos(page = 1, token = "") {
  const apiKey = process.env.YOUTUBE_API_KEY!;
  
  // The ID of your dedicated playlist.
  // It's recommended to move this to your .env file (e.g., YOUTUBE_PLAYLIST_ID)
  const dedicatedPlaylistId = "PLiWELLjBSGHKxeFFSKSKQBhunIhR_aIMS";
  const videosPerPage = 9;

  if (!apiKey || !dedicatedPlaylistId) {
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: "Missing YouTube API Key or Playlist ID configuration.",
    };
  }

  try {
    // A single, efficient API call to get the videos for the current page.
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${dedicatedPlaylistId}&maxResults=${videosPerPage}&pageToken=${token}&key=${apiKey}`,
      {
        // Adjust the revalidation time based on how often you update the playlist.
        // 43200 seconds = 12 hours.
        next: { revalidate: 43200 }, 
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Failed to fetch videos from the playlist");
    }

    if (!data.items) {
        // Handle cases where the playlist might be empty
        return { videos: [], nextPageToken: null, prevPageToken: null, error: null };
    }

    // Map the API response to the format your components expect.
    const videos = data.items.map((item: YouTubePlaylistItem) => ({
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
      videos,
      nextPageToken: data.nextPageToken,
      prevPageToken: data.prevPageToken,
      error: null,
    };
  } catch (error) {
    console.error("YouTube API Error:", error);
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: error instanceof Error ? error.message : "An unknown error occurred while fetching videos",
    };
  }
}

// --- REACT SERVER COMPONENT (OPTIMIZED) ---
export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; token?: string }>;
}) {
  const { page = "1", token = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  const { videos, nextPageToken, prevPageToken, error } = await fetchVideos(
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
            key={token} // Add a key to Suspense to make it re-render on page change
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