// app/videos/VideosGrid.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

// Truncate text utility function
const truncateText = (text: string, maxLength: number): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

export default function VideosGrid({
  videos,
  currentPage,
  nextPageToken,
  prevPageToken,
}: {
  videos: Video[];
  currentPage: number;
  nextPageToken?: string;
  prevPageToken?: string;
}) {
  // FIXED: Added state for playing video - this is now in a client component
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <>
      {videos.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-xl">No videos found</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
            {videos.map((video) => (
              <div
                key={video.id}
                className="video-card-container group relative rounded-2xl overflow-hidden bg-gray-900 border border-gray-800 transition-all duration-300 hover:border-gray-700"
              >
                <div className="relative w-full aspect-video mb-6 rounded-xl overflow-hidden bg-black">
                  <div
                    className="w-full h-full flex items-center justify-center bg-gray-900 cursor-pointer"
                    onClick={() => setPlaying(video.id)}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center transform hover:scale-110 transition-transform">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-white ml-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Only load the iframe when user clicks the play button */}
                  {playing === video.id && (
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}?rel=0&modestbranding=1&autoplay=1`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full absolute top-0 left-0"
                      title={video.title}
                      frameBorder="0"
                    />
                  )}
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

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center mt-16 gap-4">
            <div className="w-full sm:w-auto">
              {prevPageToken && (
                <Link
                  href={`/videos?page=${currentPage - 1}&token=${prevPageToken}`}
                  className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous Page
                </Link>
              )}
            </div>

            <div className="text-gray-400 text-center text-lg font-medium">
              Page {currentPage}
            </div>

            <div className="w-full sm:w-auto">
              {nextPageToken && (
                <Link
                  href={`/videos?page=${currentPage + 1}&token=${nextPageToken}`}
                  className="flex items-center justify-center px-6 py-4 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors w-full sm:w-auto font-medium text-lg"
                >
                  Next Page
                  <svg
                    xmlns="http://www.w.org/2000/svg"
                    className="h-5 w-5 ml-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}