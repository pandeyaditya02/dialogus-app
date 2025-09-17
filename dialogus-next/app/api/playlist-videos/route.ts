// app/api/playlist-videos/route.ts
import { NextRequest, NextResponse } from 'next/server';

// Types
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

interface Video {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  publishedAt: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const playlistId = searchParams.get('playlistId');
  const maxResults = searchParams.get('maxResults') || '10';

  if (!playlistId) {
    return NextResponse.json(
      { error: 'playlistId parameter is required' },
      { status: 400 }
    );
  }

  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'YouTube API Key not configured' },
      { status: 500 }
    );
  }

  try {
    // Fetch playlist items from YouTube API
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${maxResults}&key=${apiKey}`,
      {
        // Cache for 12 hours (43200 seconds)
        next: { revalidate: 43200 }
      }
    );

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Failed to fetch playlist videos');
    }

    if (!data.items) {
      return NextResponse.json({ videos: [] });
    }

    // Transform the YouTube API response to our format
    const videos: Video[] = data.items.map((item: YouTubePlaylistItem) => ({
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

    return NextResponse.json({ videos });

  } catch (error) {
    console.error('YouTube API Error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to fetch playlist videos',
        videos: [] 
      },
      { status: 500 }
    );
  }
}
