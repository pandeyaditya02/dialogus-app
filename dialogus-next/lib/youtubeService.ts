'use server'; // Ensures all functions in this file run only on the server.

//================================================================
// 1. TYPE DEFINITIONS
// Consolidated and cleaned up for clarity.
//================================================================

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubePlaylistItem {
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

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

export interface VideosResponse {
  videos: Video[];
  nextPageToken: string | null;
  prevPageToken: string | null;
  error: string | null;
}

//================================================================
// 2. INTERNAL HELPER FUNCTION
// Reduces code duplication by handling common API call logic.
//================================================================

async function fetchFromYouTubeAPI(endpoint: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YouTube API Key configuration.");
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/${endpoint}&key=${apiKey}`,
    {
      next: { revalidate: 43200 }, // 12-hour cache for all API calls
    }
  );

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message || "An error occurred with the YouTube API");
  }

  return data;
}

//================================================================
// 3. EXPORTED SERVER ACTIONS
// Clean, optimized, and ready to be used in your components.
//================================================================

/**
 * Fetches a paginated list of videos from a dedicated playlist.
 */
export async function fetchYouTubeVideos(token = ""): Promise<VideosResponse> {
  try {
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID || "PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc";
    const videosPerPage = 12;
    const data = await fetchFromYouTubeAPI(`playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${videosPerPage}&pageToken=${token}`);
    
    const videos: Video[] = (data.items || []).map((item: YouTubePlaylistItem) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        `https://i3.ytimg.com/vi/${item.snippet.resourceId.videoId}/maxresdefault.jpg`,
      publishedAt: item.snippet.publishedAt,
    }));

    return {
      videos,
      nextPageToken: data.nextPageToken || null,
      prevPageToken: data.prevPageToken || null,
      error: null,
    };
  } catch (error) {
    console.error("YouTube Service Error (fetchYouTubeVideos):", error);
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

/**
 * Fetches the single latest video from a playlist.
 */
export async function fetchLatestVideo(): Promise<{ id?: string; title?: string; description?: string; error?: string; }> {
  try {
    const playlistId = process.env.YOUTUBE_PLAYLIST_ID || "PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc";
    const data = await fetchFromYouTubeAPI(`playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1`);
    
    if (!data.items || data.items.length === 0) {
      return { error: "No videos found in the playlist." };
    }
    
    const item = data.items[0].snippet;
    return {
      id: item.resourceId.videoId,
      title: item.title,
      description: item.description,
    };
  } catch (error) {
    console.error("YouTube Service Error (fetchLatestVideo):", error);
    return { error: error instanceof Error ? error.message : "Failed to fetch latest video." };
  }
}

/**
 * Fetches a list of videos from any specified playlist.
 */
export async function fetchPlaylistVideos(playlistId: string, maxResults: number = 10): Promise<{ videos: Video[]; error: string | null; }> {
  try {
    const data = await fetchFromYouTubeAPI(`playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}`);

    const videos: Video[] = (data.items || []).map((item: YouTubePlaylistItem) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        `https://i3.ytimg.com/vi/${item.snippet.resourceId.videoId}/maxresdefault.jpg`,
      publishedAt: item.snippet.publishedAt,
    }));

    return { videos, error: null };
  } catch (error) {
    console.error(`YouTube Service Error (fetchPlaylistVideos for ${playlistId}):`, error);
    return {
      videos: [],
      error: error instanceof Error ? error.message : "Failed to fetch playlist videos.",
    };
  }
}