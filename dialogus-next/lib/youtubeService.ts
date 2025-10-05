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
  items: {
    contentDetails: {
      itemCount: number;
    };
  }[];
}


// === SHARED UTILITIES ===
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3';
const DEFAULT_PLAYLIST_ID = 'PLiWELLjBSGHJegQWqDl9EImihEW0Rakzc';
const DEFAULT_CACHE_DURATION = 43200; // 12 hours
const VIDEOS_PER_PAGE = 12;

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
    const response = await fetch(url, { next: cacheConfig });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || `API Error: ${response.status}`);
    }
    return await response.json() as T;
  } catch (error) {
    console.error(`YouTube API fetch error on endpoint '${endpoint}':`, error);
    throw error;
  }
}

function validateEnv() {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YOUTUBE_API_KEY is not configured in environment variables.');
  }
}

function getPlaylistId(customId?: string): string {
  return customId || process.env.YOUTUBE_PLAYLIST_ID || DEFAULT_PLAYLIST_ID;
}

function getThumbnailUrl(thumbnails: YouTubeSnippet['thumbnails'], videoId: string): string {
  const highRes = thumbnails.high?.url?.trim();
  const mediumRes = thumbnails.medium?.url?.trim();
  const defaultRes = thumbnails.default?.url?.trim();
  return highRes || mediumRes || defaultRes || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function transformVideos(items: YouTubePlaylistItem[]): Video[] {
  return items.map(item => ({
    id: item.snippet.resourceId.videoId,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: getThumbnailUrl(item.snippet.thumbnails, item.snippet.resourceId.videoId),
    publishedAt: item.snippet.publishedAt,
  }));
}

// === PUBLIC API FUNCTIONS ===

export async function fetchYouTubeVideos(
  page = 1,
  token = "",
  playlistId?: string
): Promise<VideosResponse> {
  try {
    validateEnv();
    const currentPlaylistId = getPlaylistId(playlistId);
    let totalPages = 0;

    try {
      const playlistDetails = await fetchYouTubeApi<YouTubePlaylistDetails>('playlists', {
        part: 'contentDetails',
        id: currentPlaylistId,
      });
      if (playlistDetails?.items?.length > 0) {
        const totalVideos = playlistDetails.items[0].contentDetails.itemCount;
        totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE);
      }
    } catch (error) {
      console.error("Could not fetch playlist details for total count.", error);
    }

    const videosData = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', {
      part: 'snippet', // Ensure part is specified
      playlistId: currentPlaylistId,
      maxResults: VIDEOS_PER_PAGE,
      pageToken: token,
    });

    return {
      videos: videosData.items ? transformVideos(videosData.items) : [],
      nextPageToken: videosData.nextPageToken || null,
      prevPageToken: videosData.prevPageToken || null,
      totalPages,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('YouTube videos fetch error:', errorMessage);
    return { videos: [], nextPageToken: null, prevPageToken: null, totalPages: 0, error: errorMessage };
  }
}

export async function fetchYouTubeShorts(
  page = 1,
  token = "",
  playlistId?: string
): Promise<VideosResponse> {
  try {
    validateEnv();
    const shortsPlaylistId = playlistId || process.env.YOUTUBE_SHORTS_PLAYLIST_ID || "PLiWELLjBSGHI-W3KiwxHlOwaa9awYoq3H";
    let totalPages = 0;

    try {
      const playlistDetails = await fetchYouTubeApi<YouTubePlaylistDetails>('playlists', {
        part: 'contentDetails',
        id: shortsPlaylistId,
      });
      if (playlistDetails?.items?.length > 0) {
        const totalVideos = playlistDetails.items[0].contentDetails.itemCount;
        totalPages = Math.ceil(totalVideos / VIDEOS_PER_PAGE);
      }
    } catch (error) {
      console.error("Could not fetch shorts playlist details.", error);
    }

    const shortsData = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', {
      part: 'snippet', // Ensure part is specified
      playlistId: shortsPlaylistId,
      maxResults: VIDEOS_PER_PAGE,
      pageToken: token,
    });

    return {
      videos: shortsData.items ? transformVideos(shortsData.items) : [],
      nextPageToken: shortsData.nextPageToken || null,
      prevPageToken: shortsData.prevPageToken || null,
      totalPages,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('YouTube shorts fetch error:', errorMessage);
    return { videos: [], nextPageToken: null, prevPageToken: null, totalPages: 0, error: errorMessage };
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
      part: 'snippet', // FIX: Ensure 'snippet' is requested
      playlistId: getPlaylistId(playlistId),
      maxResults: 1
    };
    const data = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', params);

    if (!data.items || data.items.length === 0) {
      return { error: 'No videos found in the playlist' };
    }
    const item = data.items[0].snippet;
    return {
      id: item.resourceId.videoId,
      title: item.title,
      description: item.description,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch latest video';
    console.error('Latest video fetch error:', errorMessage);
    return { error: errorMessage };
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
      part: 'snippet',
      playlistId,
      maxResults,
    };
    const data = await fetchYouTubeApi<YouTubeApiResponse>('playlistItems', params);

    if (!data.items || data.items.length === 0) {
      return { videos: [], error: null };
    }
    return {
      videos: transformVideos(data.items),
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch playlist videos';
    console.error(`Error fetching playlist ${playlistId}:`, errorMessage);
    return { videos: [], error: errorMessage };
  }
}

