// app/videos/VideosGrid.tsx
"use client";

import { useState, useEffect } from "react";
import VideoCard from "./VideoCard";
import VideoSkeleton from "./VideoSkeleton";
import PaginationControls from "./PaginationControls";


interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
}

interface VideosGridProps {
  videos: Video[];
  currentPage: number;
  nextPageToken?: string;
  prevPageToken?: string;
  isLoading?: boolean;
}

// In VideosGrid.tsx
// Add this useEffect to handle data fetching from the client side if needed
// useEffect(() => {
//   const fetchData = async () => {
//     if (videos.length === 0) {
//       setLocalLoading(true);
//       try {
//         const response = await fetch(`/api/videos?page=${currentPage}&token=${token}`);
//         const data = await response.json();
//         // Update with new data
//       } catch (error) {
//         console.error('Failed to fetch videos:', error);
//       } finally {
//         setLocalLoading(false);
//       }
//     }
//   };

//   // Only fetch if we're in client-side navigation
//   if (typeof window !== 'undefined' && videos.length === 0) {
//     fetchData();
//   }
// }, [currentPage, token, videos.length]);

export default function VideosGrid({
  videos,
  currentPage,
  nextPageToken,
  prevPageToken,
  isLoading = false,
}: VideosGridProps) {
  const [localLoading, setLocalLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  
  // Handle the initial loading state
  useEffect(() => {
    // If parent component passes isLoading prop, use that
    if (isLoading !== undefined) {
      setLocalLoading(isLoading);
    } else {
      // Otherwise, implement a minimum loading time for better UX
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 300); // Minimum 300ms loading time
      
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Close video player when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.video-card-container') && playing) {
        setPlaying(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [playing]);

  // Show skeleton states while loading
  if (localLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        {[...Array(6)].map((_, i) => (
          <VideoSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Show "no videos" message if no videos and not loading
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-xl">No videos found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            isPlaying={playing === video.id}
            onPlay={() => setPlaying(playing === video.id ? null : video.id)}
          />
        ))}
      </div>

      <PaginationControls
        currentPage={currentPage}
        nextPageToken={nextPageToken}
        prevPageToken={prevPageToken}
      />
    </>
  );
}

