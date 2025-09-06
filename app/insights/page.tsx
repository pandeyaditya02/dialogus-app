"use client";

import React from 'react';

// --- Insights Page Content ---
const insightsData = [
    {
        date: "Sep 04, 2025",
        title: "The Art of the Interview: Building Rapport in Minutes",
        description: "Our top producers share their secrets for creating conversations that feel authentic and revealing.",
        link: "#"
    },
    {
        date: "Aug 28, 2025",
        title: "Sonic Branding: Why Your Podcast Needs a Signature Sound",
        description: "Exploring the psychology of sound and how to craft an unforgettable audio identity for your show.",
        link: "#"
    },
    {
        date: "Aug 15, 2025",
        title: "Beyond the Mic: Our Approach to Visual Podcasting",
        description: "How we turn audio-first content into compelling visual experiences for platforms like YouTube.",
        link: "#"
    }
];

const InsightCard = ({ date, title, description, link }: { date: string, title: string, description: string, link: string }) => (
    <a href={link} className="card-base group p-6 flex flex-col">
        <div className="card-glow-border"></div>
        <p className="text-sm text-gray-400 mb-4">{date}</p>
        <h3 className="font-bold text-xl mb-2 flex-grow text-white group-hover:text-fuchsia-400 transition-colors">{title}</h3>
        <p className="text-gray-400 text-sm mb-4">{description}</p>
        <span className="font-semibold text-fuchsia-400 text-sm mt-auto">Read Article &rarr;</span>
    </a>
);


const InsightsContent = () => {
    return (
        <main className="pt-24">
            <section id="blog" className="py-20 md:py-28 bg-black">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="section-title text-3xl md:text-4xl mb-4">Insights & Stories</h2>
                        <p className="text-gray-400">Go behind the scenes and explore our perspective on the evolving media landscape.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {insightsData.map(post => <InsightCard key={post.title} {...post} />)}
                    </div>
                </div>
            </section>
        </main>
    );
};


// --- Main Insights Page Component ---
export default function InsightsPage() {
  return <InsightsContent />;
}
