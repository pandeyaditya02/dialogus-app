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
  nextPageToken: string | null;
  prevPageToken: string | null;
  totalPages: number; // Accept the new totalPages prop
  isLoading?: boolean;
}

export default function VideosGrid({
  videos,
  currentPage,
  nextPageToken,
  prevPageToken,
  totalPages, // Destructure the totalPages prop
  isLoading = false,
}: VideosGridProps) {
  const [localLoading, setLocalLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

  // Handle the initial loading state for better UX
  useEffect(() => {
    if (isLoading !== undefined) {
      setLocalLoading(isLoading);
    } else {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 300); // Minimum 300ms loading time

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  // Close video player when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.group') && playing) {
        setPlaying(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [playing]);

  // Show skeleton loaders while data is being fetched
  if (localLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
        {[...Array(6)].map((_, i) => (
          <VideoSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  // Show a message if no videos are found
  if (videos.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-xl">No videos found.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
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
        totalPages={totalPages} // Pass totalPages down to the controls
      />
    </>
  );
}
