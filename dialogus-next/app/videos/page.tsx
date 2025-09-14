// app/videos/page.tsx
import Image from 'next/image';
import Link from 'next/link';

// Type definitions for YouTube API response
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

interface YouTubeSearchResult {
  id: {
    videoId: string;
  };
  snippet: YouTubeSnippet;
}

interface YouTubeApiResponse {
  items: YouTubeSearchResult[];
  nextPageToken?: string;
  prevPageToken?: string;
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
export default async function VideosPage({ searchParams }: { searchParams: Promise<{ pageToken?: string }> }) {
  // Get pagination token from search parameters - MUST BE AWAITED IN NEXT.JS 15
  const { pageToken = '' } = await searchParams;
  
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
    // Construct YouTube API URL
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&type=video&maxResults=10&pageToken=${pageToken}&key=${apiKey}`;
    
    // Fetch data from YouTube API
    const response = await fetch(url, {
      next: { 
        revalidate: 3600 // Revalidate every hour
      }
    });
    const data = await response.json() as YouTubeApiResponse;
    
    // Handle API errors
    if (data.error) {
      throw new Error(data.error.message || 'YouTube API error');
    }
    
    // Process videos data - FIXED: Added fallback URL to ensure thumbnail is never undefined
    const videos = data.items.map(item => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.maxres?.url || 
                 item.snippet.thumbnails.high?.url || 
                 item.snippet.thumbnails.medium?.url ||
                 item.snippet.thumbnails.default?.url ||
                 'https://i.ytimg.com/vi/default.jpg', // Critical fallback URL added
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
                Browse our complete collection of podcasts and discussions
              </p>
            </div>
            
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-xl">No videos found</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                  {videos.map(video => (
                    <div key={video.id} className="video-card-container group relative rounded-lg overflow-hidden cursor-pointer">
                      <Link
                        href={`https://www.youtube.com/watch?v=${video.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <div className="relative w-full h-64">
                          <Image
                            src={video.thumbnail} // Now guaranteed to be a string
                            alt={video.title}
                            fill
                            className="object-cover transition-transform duration-300 transform group-hover:scale-110"
                          />
                        </div>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                          <div>
                            <h4 className="text-white font-bold text-lg video-title-truncate">
                              {video.title}
                            </h4>
                            <p className="text-gray-300 text-sm mt-2 video-synopsis-truncate">
                              {truncateText(video.description, 120)}
                            </p>
                          </div>
                          <div className="self-center">
                            <svg 
                              xmlns="http://www.w3.org/2000/svg" 
                              viewBox="0 0 24 24" 
                              fill="currentColor" 
                              className="text-white h-12 w-12"
                            >
                              <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.27a2.325 2.325 0 01-2.78-.714.75.75 0 00-1.057-1.057c1.426-1.427 1.426-3.74 0-5.165z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div></div>
                        </div>
                        <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                          <h4 className="text-white font-bold text-lg video-title-truncate">
                            {video.title}
                          </h4>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center mt-12 gap-4">
                  <div className="w-full sm:w-auto">
                    {data.prevPageToken && (
                      <Link 
                        href={`/videos?pageToken=${data.prevPageToken}`}
                        className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        Previous Page
                      </Link>
                    )}
                  </div>
                  
                  <div className="text-gray-400 text-center">
                    Page {data.prevPageToken ? '2' : '1'} of {data.nextPageToken ? '...' : '1'}
                  </div>
                  
                  <div className="w-full sm:w-auto">
                    {data.nextPageToken && (
                      <Link 
                        href={`/videos?pageToken=${data.nextPageToken}`}
                        className="flex items-center justify-center px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto"
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