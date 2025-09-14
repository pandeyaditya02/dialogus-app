// app/videos/page.tsx
import VideosGrid from "./VideosGrid"; // Import the new client component

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

// Create a separate function to fetch videos (can be cached)
async function fetchVideos(page = 1, token = "") {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: "Missing YouTube API configuration",
    };
  }

  try {
    // First, get the channel's uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      {
        next: { revalidate: 3600 }, // Cache channel data for 1 hour
      }
    );

    const channelData = await channelResponse.json();

    if (channelData.error || channelData.items?.length === 0) {
      throw new Error(channelData.error?.message || "Channel not found");
    }

    const uploadsPlaylistId =
      channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // Fetch videos from the uploads playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=12&pageToken=${token}&key=${apiKey}`,
      {
        next: { revalidate: 1800 }, // Cache video data for 30 minutes
      }
    );

    const playlistData = await playlistResponse.json();

    if (playlistData.error) {
      throw new Error(playlistData.error.message || "Failed to fetch videos");
    }

    // Process videos data - FIXED: Added explicit type for item
    const videos = playlistData.items.map((item: YouTubePlaylistItem) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url || // Use high instead of maxres
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
export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; token?: string }>;
}) {
  const { page = "1", token = "" } = await searchParams;
  const currentPage = Math.max(1, parseInt(page) || 1);

  // Fetch videos with ISR
  const { videos, nextPageToken, prevPageToken, error } = await fetchVideos(
    currentPage,
    token
  );

  // Get API key and channel ID from environment variables
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    // error handling...
  }

  if (error) {
    // error handling...
  }

  return (
    <main className="pt-24">
      <section id="videos" className="py-20 md:py-28 bg-black">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="section-title text-3xl md:text-5xl mb-4 font-bold">
              All Videos
            </h2>
            <p className="text-gray-400 text-lg md:text-xl">
              Watch our complete collection of videos directly on our website
            </p>
          </div>

          {/* Pass videos data to the client component */}
          <VideosGrid 
            videos={videos} 
            currentPage={currentPage} 
            nextPageToken={nextPageToken}
            prevPageToken={prevPageToken}
            isLoading={false} // We're not loading anymore since this is server component
          />
        </div>
      </section>
    </main>
  );
}