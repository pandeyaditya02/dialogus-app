"use client";

import React from 'react';

// --- Shows Page Content ---
const showsData = [
    {
        imgSrc: "https://images.unsplash.com/photo-1620641788421-7a1c36226328?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        alt: "Abstract colorful liquid podcast cover",
        title: "The Digital Dialogue",
        host: "With Ava Chen"
    },
    {
        imgSrc: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        alt: "Abstract wave podcast cover",
        title: "Uncharted Territories",
        host: "With Leo Kim"
    },
    {
        imgSrc: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        alt: "Colorful gradient podcast cover",
        title: "The Creative Code",
        host: "With Mia Jones"
    },
    {
        imgSrc: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        alt: "Abstract 3D shapes podcast cover",
        title: "Blueprint",
        host: "With David Rodriguez"
    }
];

const ShowCard = ({ imgSrc, alt, title, host }: { imgSrc: string, alt: string, title: string, host: string }) => (
    <div className="text-center group">
        <img src={imgSrc} alt={alt} className="w-full h-auto rounded-xl mb-4 transition-transform duration-300 group-hover:scale-105 shadow-2xl aspect-square object-cover" />
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <p className="text-gray-400 text-sm">{host}</p>
    </div>
);

const ShowsContent = () => {
    return (
        <main className="pt-24">
            <section id="podcasts" className="py-20 md:py-28 bg-black">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="section-title text-3xl md:text-4xl mb-4">Flagship Shows</h2>
                        <p className="text-gray-400">Our chart-topping podcasts are where culture-defining conversations happen. Tune in and get inspired.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {showsData.map(show => <ShowCard key={show.title} {...show} />)}
                    </div>
                </div>
            </section>
        </main>
    );
};


// --- Main Shows Page Component ---
export default function ShowsPage() {
  return <ShowsContent />;
}
