// lib/youtubeService.ts
import { unstable_cache as cache } from 'next/cache';

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
  totalPages: number;
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

interface YouTubePlaylistDetails {
  pageInfo: {
    totalResults: number;
  };
  items: {
    contentDetails: {
      itemCount: number;
    };
  }[];
}


// === SHARED UTILITIES ===
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const DEFAULT_PLAYLIST_ID = 'PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc';
const DEFAULT_CACHE_DURATION = 3600; // 1 hour in seconds
const VIDEOS_PER_PAGE = 12;

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
 * Generic and reusable fetcher for the YouTube Data API.
 * @param endpoint — The API endpoint (e.g., 'playlistItems', 'playlists').
 * @param params - The query parameters for the API call.
 * @param cacheConfig - Optional Next.js cache configuration.
 */
async function fetchYouTubeApi<T>(
  endpoint: string,
  params: Record<string, string | number>,
  cacheConfig = { revalidate: DEFAULT_CACHE_DURATION }
): Promise<T> {
  try {
    const queryString = new URLSearchParams({
      key: process.env.YOUTUBE_API_KEY || '',
      ...params,
    }).toString();

    const url = `${YOUTUBE_API_BASE_URL}/${endpoint}?${queryString}`;

    const response = await fetch(url, {
      next: cacheConfig,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `API error: ${response.statusText}`);
    }

    return await response.json() as T;
  } catch (error) {
    console.error(`YouTube API fetch error on endpoint ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Safely gets the highest quality thumbnail available
 */
function getThumbnailUrl(thumbnails: YouTubeSnippet['thumbnails'], videoId: string): string {
  const highRes = thumbnails.high?.url?.trim();
  const mediumRes = thumbnails.medium?.url?.trim();
  const defaultRes = thumbnails.default?.url?.trim();
  return highRes || mediumRes || defaultRes || `https://i.ytimg.com/vi/${videoId}/default.jpg`;
}

/**
 * Transforms YouTube API response to our Video format
 */
function transformVideos(items: YouTubePlaylistItem[]): Video[] {
  return items.map(item => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: getThumbnailUrl(item.snippet.thumbnails, item.snippet.resourceId.videoId),
    publishedAt: item.snippet.publishedAt,
  }));
}

/**
 * Fetches all page tokens for a playlist and caches them.
 * This is the key to enabling direct page number navigation.
 */
const fetchAllPageTokens = cache(
  async (playlistId: string): Promise<string[]> => {
    validateEnv();
    const tokens: string[] = ['']; // Page 1 has no token
    let nextPageToken: string | undefined = undefined;

    do {
      const response: YouTubeApiResponse = await fetchYouTubeApi('playlistItems', {
        part: 'id', // We only need the token, not the full snippet
        playlistId: playlistId,
        maxResults: VIDEOS_PER_PAGE,
        pageToken: nextPageToken || '',
      }, { revalidate: DEFAULT_CACHE_DURATION });

      nextPageToken = response.nextPageToken;
      if (nextPageToken) {
        tokens.push(nextPageToken);
      }
    } while (nextPageToken);

    return tokens;
  },
  ['youtube-page-tokens'], // Cache key
  { revalidate: DEFAULT_CACHE_DURATION }
);

// === PUBLIC API FUNCTIONS ===

/**
 * Fetches a page of videos from a YouTube playlist using a page number.
 * @param page Current page number
 * @param playlistId Optional custom playlist ID
 */
export async function fetchYouTubeVideos(
  page = 1,
  playlistId?: string
): Promise<VideosResponse> {
  try {
    validateEnv();
    const currentPlaylistId = getPlaylistId(playlistId);

    // Fetch the cached list of all page tokens
    const allTokens = await fetchAllPageTokens(currentPlaylistId);
    const totalPages = allTokens.length;
    const pageToken = allTokens[page - 1];

    if (page > totalPages || page < 1) {
      throw new Error("Page not found");
    }

    const videosData = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', {
      part: 'snippet',
      playlistId: currentPlaylistId,
      maxResults: VIDEOS_PER_PAGE,
      pageToken: pageToken || '',
    });

    if (videosData.error) {
      throw new Error(videosData.error.message || 'Failed to fetch videos');
    }

    return {
      videos: transformVideos(videosData.items || []),
      nextPageToken: videosData.nextPageToken || null,
      prevPageToken: videosData.prevPageToken || null,
      totalPages,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('YouTube videos fetch error:', errorMessage);
    return {
      videos: [],
      nextPageToken: null,
      prevPageToken: null,
      totalPages: 0,
      error: errorMessage,
    };
  }
}

/**
 * Fetches a page of shorts from a YouTube shorts playlist
 * @param page Current page number
 * @param playlistId Optional custom shorts playlist ID
 */
export async function fetchYouTubeShorts(
  page = 1,
  playlistId?: string
): Promise<VideosResponse> {
  const shortsPlaylistId = playlistId ||
    process.env.YOUTUBE_SHORTS_PLAYLIST_ID ||
    "PLiWELLjBSGHI-W3KiwxHlOwaa9awYoq3H";
  // Re-use the same logic as fetchYouTubeVideos, just with the shorts playlist
  return fetchYouTubeVideos(page, shortsPlaylistId);
}


/**
 * Fetches the latest video from a YouTube playlist
 */
export async function fetchLatestVideo(
  playlistId?: string
): Promise<{ id?: string; title?: string; description?: string; error?: string }> {
  try {
    validateEnv();
    const data = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', {
      part: 'snippet',
      playlistId: getPlaylistId(playlistId),
      maxResults: 1
    });

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
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest video';
    console.error('Latest video fetch error:', errorMessage);
    return { error: errorMessage };
  }
}

/**
 * Fetches videos from a specific YouTube playlist
 */
export async function fetchPlaylistVideos(
  playlistId: string,
  maxResults: number = 10
): Promise<{ videos: Video[]; error: string | null }> {
  try {
    validateEnv();
    const data = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', {
      part: 'snippet',
      playlistId,
      maxResults
    });

    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch playlist videos');
    }

    return {
      videos: transformVideos(data.items || []),
      error: null
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch playlist videos';
    console.error(`Error fetching playlist ${playlistId}:`, errorMessage);
    return {
      videos: [],
      error: errorMessage
    };
  }
}

