"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

// Types
interface Video {
  id: string;
  title: string;
  thumbnail: string;
  description: string;
  publishedAt: string;
}

interface PlaylistData {
  title: string;
  videos: Video[];
  loading: boolean;
  error: string | null;
}

// Playlist configurations
const PLAYLISTS = {
  exclusiveInterviews: {
    id: "PLiWELLjBSGHIlwS-6Btqaze1rQko3otMP",
    title: "EXCLUSIVE INTERVIEWS"
  },
  talkItOut: {
    id: "PLiWELLjBSGHKxeFFSKSKQBhunIhR_aIMS", 
    title: "TALK IT OUT"
  },
  worldView: {
    id: "PLiWELLjBSGHI3c517bIrA7kVx0leH6v-y",
    title: "WORLD VIEW"
  }
};

// Fetch videos from a playlist
async function fetchPlaylistVideos(playlistId: string): Promise<Video[]> {
  try {
    const response = await fetch(`/api/playlist-videos?playlistId=${playlistId}&maxResults=10`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data.videos || [];
  } catch (error) {
    console.error(`Error fetching playlist ${playlistId}:`, error);
    throw error;
  }
}

// Video Card Component
const VideoCard = ({ video }: { video: Video }) => (
  <a
    href={`https://www.youtube.com/watch?v=${video.id}`}
    target="_blank"
    rel="noopener noreferrer"
    className="video-card group relative flex-shrink-0 w-64 md:w-80 lg:w-96 aspect-video rounded-lg overflow-hidden cursor-pointer"
  >
    <Image
      src={video.thumbnail}
      alt={video.title}
      width={1280}
      height={720}
      className="video-card-thumbnail w-full h-full object-cover"
      unoptimized // YouTube images are already optimized
    />
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
    <div className="absolute bottom-0 left-0 p-4 w-full">
      <h4 className="text-white font-bold text-lg video-title-truncate">
        {video.title}
      </h4>
    </div>
  </a>
);

// Loading Skeleton Component
const VideoCardSkeleton = () => (
  <div className="flex-shrink-0 w-64 md:w-80 lg:w-96 aspect-video rounded-lg overflow-hidden bg-gray-800 animate-pulse">
    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-700"></div>
  </div>
);

// Slider Component
const VideoSlider = ({
  title,
  videos,
  loading,
  error,
}: {
  title: string;
  videos: Video[];
  loading: boolean;
  error: string | null;
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.clientWidth * 0.8;
      sliderRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="fade-in slider-wrapper relative">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h3>
      
      {error ? (
        <div className="text-red-400 p-4 bg-red-900/20 rounded-lg">
          <p>Error loading videos: {error}</p>
        </div>
      ) : (
        <div
          ref={sliderRef}
          className="slider-container flex overflow-x-auto space-x-4 md:space-x-6 pb-4 scroll-smooth"
        >
          {loading ? (
            // Show skeleton loading
            [...Array(5)].map((_, index) => (
              <VideoCardSkeleton key={`skeleton-${index}`} />
            ))
          ) : videos.length > 0 ? (
            // Show actual videos
            videos.map((video, index) => (
              <VideoCard
                key={`${video.id}-${index}`}
                video={video}
              />
            ))
          ) : (
            // Show no videos message
            <div className="text-gray-400 p-4">
              No videos found in this playlist.
            </div>
          )}
        </div>
      )}
      
      {!loading && !error && videos.length > 0 && (
        <>
          <button
            onClick={() => scroll("left")}
            className="slider-arrow prev-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full p-2 z-10 hidden md:block"
          >
            <ChevronLeft className="text-white" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="slider-arrow next-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full p-2 z-10 hidden md:block"
          >
            <ChevronRight className="text-white" />
          </button>
        </>
      )}
    </div>
  );
};

const Videos = () => {
  // State for each playlist
  const [playlistsData, setPlaylistsData] = useState<{
    [key: string]: PlaylistData;
  }>({
    exclusiveInterviews: {
      title: PLAYLISTS.exclusiveInterviews.title,
      videos: [],
      loading: true,
      error: null,
    },
    talkItOut: {
      title: PLAYLISTS.talkItOut.title,
      videos: [],
      loading: true,
      error: null,
    },
    worldView: {
      title: PLAYLISTS.worldView.title,
      videos: [],
      loading: true,
      error: null,
    },
  });

  // Fetch videos for all playlists
  useEffect(() => {
    const loadPlaylistVideos = async () => {
      const playlistKeys = Object.keys(PLAYLISTS) as Array<keyof typeof PLAYLISTS>;
      
      // Fetch all playlists concurrently
      const playlistPromises = playlistKeys.map(async (key) => {
        try {
          const videos = await fetchPlaylistVideos(PLAYLISTS[key].id);
          return { key, videos, error: null };
        } catch (error) {
          return { 
            key, 
            videos: [], 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const results = await Promise.all(playlistPromises);
      
      // Update state with results
      setPlaylistsData(prev => {
        const newData = { ...prev };
        results.forEach(({ key, videos, error }) => {
          newData[key] = {
            title: PLAYLISTS[key as keyof typeof PLAYLISTS].title,
            videos,
            loading: false,
            error,
          };
        });
        return newData;
      });
    };

    loadPlaylistVideos();
  }, []);

  // Intersection Observer for fade-in effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll(".fade-in");
    targets.forEach((target) => observer.observe(target));

    return () => targets.forEach((target) => observer.unobserve(target));
  }, []);

  return (
    <section id="videos" className="py-20 md:py-28 bg-black/50">
      <div className="container mx-auto px-6">
        <div className="text-left max-w-2xl mb-12">
          {/* <h2 className="section-title text-3xl md:text-4xl fade-in">
            Latest Videos
          </h2> */}
        </div>

        <div className="space-y-16">
          <VideoSlider 
            title={playlistsData.exclusiveInterviews.title}
            videos={playlistsData.exclusiveInterviews.videos}
            loading={playlistsData.exclusiveInterviews.loading}
            error={playlistsData.exclusiveInterviews.error}
          />
          <VideoSlider 
            title={playlistsData.talkItOut.title}
            videos={playlistsData.talkItOut.videos}
            loading={playlistsData.talkItOut.loading}
            error={playlistsData.talkItOut.error}
          />
          <VideoSlider 
            title={playlistsData.worldView.title}
            videos={playlistsData.worldView.videos}
            loading={playlistsData.worldView.loading}
            error={playlistsData.worldView.error}
          />
        </div>
      </div>
    </section>
  );
};

export default Videos;
