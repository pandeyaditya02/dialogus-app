// app/videos/page.tsx
import { Suspense } from "react";
import VideosGrid from "./VideosGrid"; // Import the new client component
import VideoSkeleton from "./VideoSkeleton";

// Type definitions for YouTube API responses
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

// NEW: Helper function to parse ISO 8601 duration format from YouTube API
function parseDurationToSeconds(isoDuration: string): number {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoDuration.match(regex);

  if (!matches) {
    return 0;
  }

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  return hours * 3600 + minutes * 60 + seconds;
}


// Create a separate function to fetch videos (can be cached)
async function fetchVideos(page = 1, token = "") {
  // Cache environment variables
  const apiKey = process.env.YOUTUBE_API_KEY!;
  const channelId = process.env.YOUTUBE_CHANNEL_ID!;

  // Use consistent cache tags
  const CACHE_TAGS = {
    CHANNEL: 'youtube-channel',
    PLAYLIST: 'youtube-playlist'
  };

  if (!apiKey || !channelId) {
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: "Missing YouTube API configuration",
    };
  }

  try {
    // 1. Get Channel data to find the uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      {
        next: {
          revalidate: 86400, // 24 hours
          tags: [CACHE_TAGS.CHANNEL]
        }
      }
    );

    const channelData = await channelResponse.json();

    if (channelData.error || channelData.items?.length === 0) {
      throw new Error(channelData.error?.message || "Channel not found");
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Fetch video items from the uploads playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=40&pageToken=${token}&key=${apiKey}`, // Fetched more to account for filtering
      {
        next: { revalidate: 7200 }, // Cache for 2 hours
      }
    );

    const playlistData = await playlistResponse.json();

    if (playlistData.error) {
      throw new Error(playlistData.error.message || "Failed to fetch videos");
    }
    
    if (!playlistData.items || playlistData.items.length === 0) {
      return {
        videos: [],
        nextPageToken: null,
        prevPageToken: null,
        error: null,
      };
    }

    // --- START: NEW LOGIC TO FILTER SHORTS ---

    // 3. Extract video IDs from the playlist items
    const videoIds = playlistData.items
      .map((item: YouTubePlaylistItem) => item.snippet.resourceId.videoId)
      .join(',');

    // 4. Fetch contentDetails for all videos at once to get their duration
    const videoDetailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
      {
        next: { revalidate: 7200 }, // Use same caching as playlist
      }
    );
    const videoDetailsData = await videoDetailsResponse.json();
    
    if (videoDetailsData.error) {
      throw new Error(videoDetailsData.error.message || "Failed to fetch video details");
    }

    // Create a Map for quick duration lookup
    const durationMap = new Map<string, number>();
    videoDetailsData.items.forEach((item: any) => {
      durationMap.set(item.id, parseDurationToSeconds(item.contentDetails.duration));
    });

    // 5. Filter out Shorts (videos <= 60 seconds)
    const regularVideos = playlistData.items.filter((item: YouTubePlaylistItem) => {
      const duration = durationMap.get(item.snippet.resourceId.videoId);
      return duration !== undefined && duration > 300;
    });

    // --- END: NEW LOGIC TO FILTER SHORTS ---


    // 6. Process the filtered videos data
    const videos = regularVideos.map((item: YouTubePlaylistItem) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        "https://i.ytimg.com/vi/default.jpg",
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      videos,
      nextPageToken: playlistData.nextPageToken,
      prevPageToken: playlistData.prevPageToken,
      error: null,
    };
  } catch (error) {
    console.error("YouTube API Error:", error);
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: error instanceof Error ? error.message : "Failed to fetch videos",
    };
  }
}

// Your VideosPage component (NO CHANGES NEEDED HERE)
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

  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28 bg-black">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white mb-4">
                Configuration Error
              </h2>
              <p className="text-gray-400">
                YouTube API configuration is missing. Please check your .env file.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  if (error) {
    // This is not a client component, so window is not available. 
    // You might want to pass this to a client component for interactive retry.
    // For this example, I'll remove the onClick.
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28 bg-black">
          <div className="container mx-auto px-6 max-w-7xl">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white mb-4">
                Error Loading Videos
              </h2>
              <p className="text-gray-400">{error}</p>
              {/* <button className="mt-4 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600">
                Try Again
              </button> */}
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
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                {[...Array(6)].map((_, i) => <VideoSkeleton key={i} />)}
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