// app/videos/page.tsx
import Link from 'next/link';

// Type definitions for YouTube API responses
interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

interface YouTubeSnippet {
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

interface YouTubePlaylistResponse {
  items: YouTubePlaylistItem[];
  nextPageToken?: string;
  prevPageToken?: string;
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
  error?: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

interface YouTubeChannelResponse {
  items: Array<{
    contentDetails: {
      relatedPlaylists: {
        uploads: string;
      };
    };
  }>;
  error?: {
    code: number;
    message: string;
    errors: Array<{
      domain: string;
      reason: string;
      message: string;
    }>;
  };
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

// Truncate text utility function
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Main component - now an async Server Component
export default async function VideosPage({ searchParams }: { searchParams: Promise<{ page?: string; token?: string }> }) {
  // Get pagination parameters from search parameters
  const { page = '1', token = '' } = await searchParams;
  
  // Convert page to number and validate
  const currentPage = Math.max(1, parseInt(page) || 1);
  
  // Get API key and channel ID from environment variables
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;
  
  // Validate required environment variables
  if (!apiKey || !channelId) {
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white mb-4">Error Loading Videos</h2>
              <p className="text-gray-400">
                YouTube API configuration is missing. Please check your .env.local file.
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                Required: YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }
  
  try {
    // First, get the channel's uploads playlist ID
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`,
      {
        next: { revalidate: 3600 }
      }
    );
    
    const channelData = await channelResponse.json() as YouTubeChannelResponse;
    
    // Handle channel API errors
    if (channelData.error || channelData.items.length === 0) {
      throw new Error(channelData.error?.message || 'Channel not found or invalid channel ID');
    }
    
    // Get the uploads playlist ID from channel data
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    
    // Now fetch videos from the uploads playlist
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=12&pageToken=${token}&key=${apiKey}`,
      {
        next: { revalidate: 3600 }
      }
    );
    
    const playlistData = await playlistResponse.json() as YouTubePlaylistResponse;
    
    // Handle playlist API errors
    if (playlistData.error) {
      throw new Error(playlistData.error.message || 'Failed to fetch playlist items');
    }
    
    // Process videos data
    const videos = playlistData.items.map(item => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.maxres?.url || 
                 item.snippet.thumbnails.high?.url || 
                 item.snippet.thumbnails.medium?.url ||
                 item.snippet.thumbnails.default?.url ||
                 'https://i.ytimg.com/vi/default.jpg', // Fallback URL
      publishedAt: item.snippet.publishedAt
    }));
    
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
            
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-xl">No videos found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
                  {videos.map(video => (
                    <div key={video.id} className="video-card-container group relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 transition-all duration-300 hover:border-gray-700">
                      <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1`}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
                          title={video.title}
                          frameBorder="0"
                        />
                      </div>
                      
                      <div className="px-5 pb-7">
                        <h3 className="text-white font-bold text-xl mb-3 line-clamp-2 hover:underline cursor-pointer transition-colors">
                          <Link
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            {video.title}
                          </Link>
                        </h3>
                        <p className="text-gray-300 text-base line-clamp-3">
                          {truncateText(video.description, 150)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls - FIXED: Now uses numbered format */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-16 gap-4">
                  <div className="w-full sm:w-auto">
                    {playlistData.prevPageToken && (
                      <Link 
                        href={`/videos?page=${currentPage - 1}&token=${playlistData.prevPageToken}`}
                        className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous Page
                      </Link>
                    )}
                  </div>
                  
                  {/* FIXED: Changed to numbered format "Page X" */}
                  <div className="text-gray-400 text-center text-lg font-medium">
                    Page {currentPage}
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    {playlistData.nextPageToken && (
                      <Link 
                        href={`/videos?page=${currentPage + 1}&token=${playlistData.nextPageToken}`}
                        className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
                      >
                        Next Page
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
    );
  } catch (error) {
    // Handle unknown error type properly
    let errorMessage = 'Failed to fetch videos from YouTube';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error('YouTube API Error:', errorMessage);
    return (
      <main className="pt-24">
        <section className="py-20 md:py-28 bg-black">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl text-white mb-4">Error Loading Videos</h2>
              <p className="text-gray-400">
                {errorMessage}
              </p>
              <p className="text-gray-500 mt-4 text-sm">
                Please check your YouTube API configuration or try again later
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }
}