// app/shorts/ShortsGrid.tsx
"use client";

import { useState, useEffect } from "react";
import ShortsCard from "./ShortsCard";
import ShortsSkeleton from "./ShortsSkeleton";
import ShortsPaginationControls from "./ShortsPaginationControls";
import { Video } from "@/lib/youtubeService";

interface ShortsGridProps {
  shorts: Video[];
  currentPage: number;
  totalPages: number;
  isLoading?: boolean;
}

export default function ShortsGrid({
  shorts,
  currentPage,
  totalPages,
  isLoading = false,
}: ShortsGridProps) {
  const [localLoading, setLocalLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);
  
  // Handle the initial loading state
  useEffect(() => {
    if (isLoading !== undefined) {
      setLocalLoading(isLoading);
    } else {
      const timer = setTimeout(() => {
        setLocalLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);
  
  // Close video player when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.shorts-card-container') && playing) {
        setPlaying(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [playing]);

  if (localLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 md:gap-8">
        {[...Array(12)].map((_, i) => (
          <ShortsSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (shorts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-xl">No shorts found</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
        {shorts.map((short) => (
          <ShortsCard
            key={short.id}
            short={short}
            isPlaying={playing === short.id}
            onPlay={() => setPlaying(playing === short.id ? null : short.id)}
          />
        ))}
      </div>

      <ShortsPaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
      />
    </>
  );
}

