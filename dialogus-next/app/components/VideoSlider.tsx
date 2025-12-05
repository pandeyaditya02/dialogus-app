"use client";

import { useRef, useState, useEffect } from "react";
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

interface VideoSliderProps {
    title: string;
    videos: Video[];
    error: string | null;
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
            unoptimized
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
    <div className="flex-shrink-0 w-64 md:w-80 lg:w-96 aspect-video rounded-lg overflow-hidden bg-gray-200 animate-pulse">
        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
    </div>
);

export default function VideoSlider({ title, videos, error }: VideoSliderProps) {
    const sliderRef = useRef<HTMLDivElement>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, []);

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
    }, [loading]); // Re-run when loading changes to capture new elements

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
        <section className="py-8 md:py-12 bg-gray-50">
            <div className="container mx-auto px-6">
                <div className="fade-in slider-wrapper relative">
                    <h3 className="text-2xl md:text-4xl font-bold text-gray-900 mb-6">{title}</h3>

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
                                [...Array(5)].map((_, index) => (
                                    <VideoCardSkeleton key={`skeleton-${index}`} />
                                ))
                            ) : videos.length > 0 ? (
                                videos.map((video, index) => (
                                    <VideoCard
                                        key={`${video.id}-${index}`}
                                        video={video}
                                    />
                                ))
                            ) : (
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
                                className="slider-arrow prev-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full p-2 z-10 hidden md:block bg-white/80 hover:bg-white text-gray-900 shadow-lg transition-all hover:scale-110 border border-gray-200"
                                aria-label="Previous videos"
                            >
                                <ChevronLeft size={32} />
                            </button>
                            <button
                                onClick={() => scroll("right")}
                                className="slider-arrow next-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full p-2 z-10 hidden md:block bg-white/80 hover:bg-white text-gray-900 shadow-lg transition-all hover:scale-110 border border-gray-200"
                                aria-label="Next videos"
                            >
                                <ChevronRight size={32} />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}
