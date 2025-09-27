// lib/youtubeService.ts
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

  // Types - Ensure these are also defined or imported here if they don't exist
interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubePlaylistItemSnippet {
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
}

export interface Video {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  publishedAt: string;
}
  
export async function fetchYouTubeVideos(page = 1, token = ""): Promise<VideosResponse> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const dedicatedPlaylistId = process.env.YOUTUBE_PLAYLIST_ID || "PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc";
    const videosPerPage = 12;
  
    if (!apiKey) {
      return {
        videos: [],
        nextPageToken: null,
        prevPageToken: null,
        error: "Missing YouTube API Key configuration.",
      };
    }
  
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${dedicatedPlaylistId}&maxResults=${videosPerPage}&pageToken=${token}&key=${apiKey}`,
        {
          next: { revalidate: 43200 }, // 12 hours
        }
      );
  
      const data = await response.json();
  
      if (data.error) {
        throw new Error(data.error.message || "Failed to fetch videos from the playlist");
      }
  
      if (!data.items) {
        return { 
          videos: [], 
          nextPageToken: null, 
          prevPageToken: null, 
          error: null 
        };
      }
  
      const videos = data.items.map((item: any) => ({
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

// lib/youtubeService.ts
// Add this function to your existing youtubeService.ts

// lib/youtubeService.ts

export async function fetchLatestVideo(): Promise<{
  id?: string;
  title?: string;
  description?: string;
  error?: string;
}> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const playlistId = process.env.YOUTUBE_PLAYLIST_ID || "PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc";
  
  if (!apiKey) {
    // It's crucial to throw an error or handle this gracefully on the server
    // as process.env variables are available at build/runtime on the server.
    return {
      error: "Missing YouTube API Key configuration."
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=1&key=${apiKey}`,
      {
        next: { revalidate: 43200 }, // 12 hours server-side cache
      }
    );

    const data = await response.json();

    if (data.error) {
      // YouTube API error
      throw new Error(data.error.message || "Failed to fetch latest video from YouTube API");
    }

    if (!data.items || data.items.length === 0) {
      return {
        error: "No videos found in the playlist"
      };
    }

    const item = data.items[0].snippet;
    
    return {
      id: item.resourceId.videoId,
      title: item.title,
      description: item.description
    };
  } catch (error) {
    console.error("Latest video fetch error in youtubeService:", error);
    return {
      error: error instanceof Error ? error.message : "Failed to fetch latest video"
    };
  }
}


// New function for fetching playlist videos
export async function fetchPlaylistVideos(
  playlistId: string, 
  maxResults: number = 10
): Promise<{ videos: Video[]; error: string | null }> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return {
      videos: [],
      error: "Missing YouTube API Key configuration."
    };
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`,
      {
        next: { revalidate: 43200 } // Cache for 12 hours (43200 seconds)
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch playlist videos from YouTube API');
    }

    if (!data.items) {
      return { videos: [], error: null };
    }

    // Transform the YouTube API response to our format
    const videos: Video[] = data.items.map((item: { snippet: YouTubePlaylistItemSnippet }) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail:
        item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.medium?.url ||
        item.snippet.thumbnails.default?.url ||
        `https://i3.ytimg.com/vi/${item.snippet.resourceId.videoId}/maxresdefault.jpg`, // Fallback
      publishedAt: item.snippet.publishedAt,
    }));

    return { videos, error: null };

  } catch (error) {
    console.error(`Error fetching playlist ${playlistId} in youtubeService:`, error);
    return {
      videos: [],
      error: error instanceof Error ? error.message : 'Failed to fetch playlist videos'
    };
  }
}