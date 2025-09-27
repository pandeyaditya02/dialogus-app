// lib/youtubeService.ts

// === TYPE DEFINITIONS ===
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

interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeSnippet {
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

interface YouTubePlaylistItem {
  id: string;
  snippet: YouTubeSnippet;
}

interface YouTubeApiResponse {
  items?: YouTubePlaylistItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  error?: {
    message?: string;
  };
}

// === SHARED UTILITIES ===
const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3/playlistItems';
const DEFAULT_PLAYLIST_ID = 'PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc';
const DEFAULT_CACHE_DURATION = 43200; // 12 hours in seconds

/**
 * Standardized YouTube API fetcher with consistent error handling
 * @param params Query parameters for the YouTube API
 * @param cacheConfig Cache revalidation settings
 * @returns Parsed API response or error
 */
async function fetchYouTubeApi(
  params: Record<string, string | number>,
  cacheConfig = { revalidate: DEFAULT_CACHE_DURATION }
): Promise<YouTubeApiResponse> {
  try {
    // Build query string safely
    const queryString = new URLSearchParams({
      part: 'snippet',
      key: process.env.YOUTUBE_API_KEY || '',
      ...params
    }).toString();
    
    const url = `${YOUTUBE_BASE_URL}?${queryString}`;
    
    const response = await fetch(url, {
      next: cacheConfig
    });

    return await response.json();
  } catch (error) {
    console.error('YouTube API network error:', error);
    return {
      error: {
        message: 'Network error while connecting to YouTube API'
      }
    };
  }
}

/**
 * Validates required environment variables
 */
function validateEnv() {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not configured');
  }
}

/**
 * Gets the playlist ID with proper validation
 * @param customId Optional custom playlist ID
 */
function getPlaylistId(customId?: string): string {
  if (customId) return customId;
  if (process.env.YOUTUBE_PLAYLIST_ID) return process.env.YOUTUBE_PLAYLIST_ID;
  return DEFAULT_PLAYLIST_ID;
}

/**
 * Safely gets the highest quality thumbnail available
 * @param thumbnails YouTube thumbnail object
 * @param videoId Video ID for fallback URL
 */
function getThumbnailUrl(thumbnails: YouTubeSnippet['thumbnails'], videoId: string): string {
  // Trim any extra spaces from URLs
  const highRes = thumbnails.high?.url?.trim();
  const mediumRes = thumbnails.medium?.url?.trim();
  const defaultRes = thumbnails.default?.url?.trim();
  
  return highRes || mediumRes || defaultRes || `https://i.ytimg.com/vi/${videoId}/default.jpg`;
}

/**
 * Transforms YouTube API response to our Video format
 * @param items YouTube API items
 */
function transformVideos(items: YouTubePlaylistItem[]): Video[] {
  return items.map(item => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: getThumbnailUrl(item.snippet.thumbnails, item.snippet.resourceId.videoId),
    publishedAt: item.snippet.publishedAt
  }));
}

// === PUBLIC API FUNCTIONS ===

/**
 * Fetches a page of videos from a YouTube playlist
 * @param page Current page number
 * @param token Page token for pagination
 * @param playlistId Optional custom playlist ID
 */
export async function fetchYouTubeVideos(
  page = 1,
  token = "",
  playlistId?: string
): Promise<VideosResponse> {
  try {
    validateEnv();
    
    const params = {
      playlistId: getPlaylistId(playlistId),
      maxResults: 12,
      pageToken: token
    };
    
    const data = await fetchYouTubeApi(params);
    
    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch videos from YouTube API');
    }
    
    if (!data.items || data.items.length === 0) {
      return {
        videos: [],
        nextPageToken: null,
        prevPageToken: null,
        error: null
      };
    }
    
    return {
      videos: transformVideos(data.items),
      nextPageToken: data.nextPageToken || null,
      prevPageToken: data.prevPageToken || null,
      error: null
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred while fetching videos';
      
    console.error('YouTube videos fetch error:', errorMessage);
    
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      error: errorMessage
    };
  }
}

/**
 * Fetches the latest video from a YouTube playlist
 * @param playlistId Optional custom playlist ID
 */
export async function fetchLatestVideo(
  playlistId?: string
): Promise<{ id?: string; title?: string; description?: string; error?: string }> {
  try {
    validateEnv();
    
    const params = {
      playlistId: getPlaylistId(playlistId),
      maxResults: 1
    };
    
    const data = await fetchYouTubeApi(params);
    
    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch latest video from YouTube API');
    }
    
    if (!data.items || data.items.length === 0) {
      return {
        error: 'No videos found in the playlist'
      };
    }
    
    const item = data.items[0].snippet;
    return {
      id: item.resourceId.videoId,
      title: item.title,
      description: item.description
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch latest video';
      
    console.error('Latest video fetch error:', errorMessage);
    
    return {
      error: errorMessage
    };
  }
}

/**
 * Fetches videos from a specific YouTube playlist
 * @param playlistId Playlist ID to fetch from
 * @param maxResults Maximum number of results to return
 */
export async function fetchPlaylistVideos(
  playlistId: string, 
  maxResults: number = 10
): Promise<{ videos: Video[]; error: string | null }> {
  try {
    validateEnv();
    
    const params = {
      playlistId,
      maxResults
    };
    
    const data = await fetchYouTubeApi(params);
    
    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch playlist videos from YouTube API');
    }
    
    if (!data.items || data.items.length === 0) {
      return {
        videos: [],
        error: null
      };
    }
    
    return {
      videos: transformVideos(data.items),
      error: null
    };
  } catch (error) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Failed to fetch playlist videos';
      
    console.error(`Error fetching playlist ${playlistId}:`, errorMessage);
    
    return {
      videos: [],
      error: errorMessage
    };
  }
}