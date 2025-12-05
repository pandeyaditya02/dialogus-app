"use client";

import { useState } from "react";
import { Play, Star } from "lucide-react";

interface HeroContentProps {
    videoData: {
        id: string;
        title: string;
        description: string;
    };
}

// Helper to truncate title
const truncateTitle = (title: string, wordLimit: number = 15) => {
    if (!title) return '';

    const cleanTitle = title
        .replace(/\n/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();

    const words = cleanTitle.split(' ');
    if (words.length <= wordLimit) {
        return cleanTitle;
    }

    return words.slice(0, wordLimit).join(' ') + '...';
};

// Helper to clean description
const cleanDescription = (desc: string) => {
    if (!desc) return '';

    // Clean up description (remove URLs, normalize whitespace)
    const cleanDesc = desc
        .replace(/https?:\/\/[^\s]+/g, '') // Remove URLs
        .replace(/\|/g, '') // Remove | character
        .replace(/\n/g, ' ') // Replace line breaks with spaces
        .replace(/\s{2,}/g, ' ') // Replace multiple spaces with single space
        .trim();

    return cleanDesc;
};

const HeroContent = ({ videoData }: HeroContentProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const wordLimit = 45;

    const cleanedDesc = cleanDescription(videoData.description || "");
    const words = cleanedDesc.split(' ');
    const needsTruncation = words.length > wordLimit;

    const displayText = isExpanded
        ? cleanedDesc
        : (needsTruncation ? words.slice(0, wordLimit).join(' ') : cleanedDesc);

    return (
        <div className={`relative z-20 container mx-auto px-4 sm:px-6 w-full text-center md:text-left transition-all duration-300 ease-in-out`}>
            <div className={`w-full ${isExpanded ? 'md:w-full' : 'md:w-4/5 lg:w-3/4 xl:w-2/3'} pb-12 sm:pb-16 md:py-0 transition-all duration-300 ease-in-out`}>
                {/* Title */}
                <h1 className="hero-title text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-4 leading-tight max-w-4xl hyphens-auto break-words">
                    {videoData.title
                        ? truncateTitle(videoData.title)
                        : "Latest Video"}
                </h1>

                {/* Description */}
                <div className={`mb-8 ${isExpanded ? 'max-w-none w-full' : 'max-w-3xl'} transition-all duration-300 ease-in-out`}>
                    <div className="hyphens-auto break-words">
                        <p className="text-gray-300 text-sm sm:text-base md:text-lg">
                            {displayText}
                            {!isExpanded && needsTruncation && "..."}
                        </p>
                        {needsTruncation && (
                            <button
                                onClick={() => setIsExpanded(!isExpanded)}
                                className="mt-2 text-fuchsia-400 hover:text-fuchsia-300 font-semibold text-sm sm:text-base transition-colors duration-200 underline"
                            >
                                {isExpanded ? "Less" : "More"}
                            </button>
                        )}
                    </div>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                    <a
                        href={`https://www.youtube.com/watch?v=${videoData.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-full"
                    >
                        <Play size={20} fill="currentColor" />
                        Watch Now
                    </a>
                    <a
                        href="https://www.youtube.com/@Dialogusdigital"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="primary-cta w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white font-semibold py-3 px-6 rounded-full"
                    >
                        <Star size={20} className="text-yellow-400" fill="currentColor" />
                        Subscribe to Dialogus
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HeroContent;
