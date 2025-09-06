"use client";

import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// --- Productions Page Content ---
const productionsData = {
    editorsPick: [
        { id: 'qRXKNV92TWs', title: 'The Real Reason We Still Struggle With Hindu-Muslim Unity' },
        { id: 'Hy_9H97bPgE', title: 'War should be the last resort when other options have been exhausted' },
        { id: 'HzrQc3sgtSs', title: "India has a huge development agenda; war is not the country's priority || Qamar Agha || DIALOGUS" },
        { id: 'Ryp224aa05Y', title: 'India needs to expand its fighter squadrons to bolster national security || DIALOGUS' },
        { id: '4PTGVVsbrAU', title: 'Pahalgam attack is a conspiracy hatched by the Pakistan Army || DIALOGUS' },
        { id: 'ATg1cBN8hR0', title: 'India should help revive WTO, Rule of law will favour Global Trade || DIALOGUS' }
    ],
    trending: [
        { id: 'Ryp224aa05Y', title: 'India needs to expand its fighter squadrons to bolster national security || DIALOGUS' },
        { id: '4PTGVVsbrAU', title: 'Pahalgam attack is a conspiracy hatched by the Pakistan Army || DIALOGUS' },
        { id: 'ATg1cBN8hR0', title: 'India should help revive WTO, Rule of law will favour Global Trade || DIALOGUS' },
        { id: 'qRXKNV92TWs', title: 'The Real Reason We Still Struggle With Hindu-Muslim Unity' },
        { id: 'Hy_9H97bPgE', title: 'War should be the last resort when other options have been exhausted' },
        { id: 'HzrQc3sgtSs', title: "India has a huge development agenda; war is not the country's priority || Qamar Agha || DIALOGUS" }
    ],
    worldView: [
        { id: 'HzrQc3sgtSs', title: "India has a huge development agenda; war is not the country's priority || Qamar Agha || DIALOGUS" },
        { id: 'qRXKNV92TWs', title: 'The Real Reason We Still Struggle With Hindu-Muslim Unity' },
        { id: 'ATg1cBN8hR0', title: 'India should help revive WTO, Rule of law will favour Global Trade || DIALOGUS' },
        { id: 'Hy_9H97bPgE', title: 'War should be the last resort when other options have been exhausted' },
        { id: 'Ryp224aa05Y', title: 'India needs to expand its fighter squadrons to bolster national security || DIALOGUS' },
        { id: '4PTGVVsbrAU', title: 'Pahalgam attack is a conspiracy hatched by the Pakistan Army || DIALOGUS' }
    ]
};

const VideoCard = ({ id, title }: { id: string, title: string }) => (
    <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" className="video-card group relative flex-shrink-0 w-64 md:w-80 lg:w-96 aspect-video rounded-lg overflow-hidden cursor-pointer">
        <img src={`https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`} className="video-card-thumbnail w-full h-full object-cover" alt={title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-4 w-full">
            <h4 className="text-white font-bold text-lg video-title-truncate">{title}</h4>
        </div>
    </a>
);

const VideoSlider = ({ title, videos }: { title: string, videos: { id: string, title: string }[] }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="slider-wrapper relative">
            <h3 className="text-xl md:text-2xl font-bold text-white mb-4">{title}</h3>
            <div ref={scrollContainerRef} className="slider-container flex overflow-x-auto space-x-4 md:space-x-6 pb-4 scroll-smooth">
                {videos.map(video => <VideoCard key={video.id + title} {...video} />)}
            </div>
            <button onClick={() => handleScroll('left')} className="slider-arrow prev-btn absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full p-2 z-10 hidden md:block"><ChevronLeft className="text-white" /></button>
            <button onClick={() => handleScroll('right')} className="slider-arrow next-btn absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full p-2 z-10 hidden md:block"><ChevronRight className="text-white" /></button>
        </div>
    );
};

const ProductionsContent = () => {
    return (
        <main className="pt-24">
            <section id="videos" className="py-20 md:py-28 bg-black/50">
                <div className="container mx-auto px-6">
                    <div className="text-left max-w-2xl mb-12">
                        <h2 className="section-title text-3xl md:text-4xl">Latest Productions</h2>
                    </div>
                    <div className="space-y-16">
                        <VideoSlider title="EDITOR'S PICK" videos={productionsData.editorsPick} />
                        <VideoSlider title="TRENDING" videos={productionsData.trending} />
                        <VideoSlider title="WORLD VIEW" videos={productionsData.worldView} />
                    </div>
                </div>
            </section>
        </main>
    );
};


// --- Main Productions Page Component ---
export default function ProductionsPage() {
  return <ProductionsContent />;
}
