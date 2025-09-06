"use client";
import React from 'react';
import { Play } from 'lucide-react';

// --- Productions Page Content ---
const productionsData = [
    { 
        id: 'qRXKNV92TWs', 
        title: 'The Real Reason We Still Struggle With Hindu-Muslim Unity',
        duration: '12:35',
        synopsis: 'A deep dive into the historical and cultural factors that continue to challenge Hindu-Muslim unity in India.'
    },
    { 
        id: 'Hy_9H97bPgE', 
        title: 'War should be the last resort when other options have been exhausted',
        duration: '08:42',
        synopsis: 'Experts discuss the ethical and strategic implications of warfare in modern geopolitics.'
    },
    { 
        id: 'HzrQc3sgtSs', 
        title: "India has a huge development agenda; war is not the country's priority",
        duration: '15:20',
        synopsis: 'Qamar Agha explains why India is focusing on economic development over military conflict.'
    },
    { 
        id: 'Ryp224aa05Y', 
        title: 'India needs to expand its fighter squadrons to bolster national security',
        duration: '11:10',
        synopsis: 'An analysis of India’s current air force capabilities and future needs for national security.'
    },
    { 
        id: '4PTGVVsbrAU', 
        title: 'Pahalgam attack is a conspiracy hatched by the Pakistan Army',
        duration: '09:55',
        synopsis: 'Investigating the origins and motives behind the recent attack in Pahalgam.'
    },
    { 
        id: 'ATg1cBN8hR0', 
        title: 'India should help revive WTO, Rule of law will favour Global Trade',
        duration: '14:05',
        synopsis: 'Exploring the role India can play in reviving the World Trade Organization for global benefit.'
    },
        { 
        id: 'j7F5KNw5F20', 
        title: 'Casteism in the Cockpit: Indigo\'s Dark Side Under the Radar',
        duration: '18:30',
        synopsis: 'An explosive look into allegations of casteism within one of India\'s largest airlines.'
    },
    { 
        id: 'Qz8E3T4L0zY', 
        title: 'The Future of Artificial Intelligence in Healthcare',
        duration: '22:15',
        synopsis: 'How AI is revolutionizing diagnostics, treatment, and patient care across the globe.'
    },
];

const VideoCard = ({ id, title, duration, synopsis }: { id: string, title: string, duration: string, synopsis: string }) => (
    <div className="video-card-container group relative rounded-lg overflow-hidden cursor-pointer">
        <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noopener noreferrer">
            <img 
                src={`https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`} 
                className="w-full h-full object-cover transition-transform duration-300 transform group-hover:scale-110" 
                alt={title} 
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-4">
                <div>
                    <span className="bg-black/50 text-white text-xs font-bold py-1 px-2 rounded absolute top-2 right-2">{duration}</span>
                    <h4 className="text-white font-bold text-lg video-title-truncate">{title}</h4>
                    <p className="text-gray-300 text-sm mt-2 video-synopsis-truncate">{synopsis}</p>
                </div>
                <div className="self-center">
                    <Play className="text-white h-12 w-12" />
                </div>
                <div></div>
            </div>
            <div className="absolute bottom-0 left-0 p-4 w-full bg-gradient-to-t from-black/80 to-transparent group-hover:opacity-0 transition-opacity duration-300">
                <h4 className="text-white font-bold text-lg video-title-truncate">{title}</h4>
            </div>
        </a>
    </div>
);

const ProductionsContent = () => {
    return (
        <main className="pt-24">
            <section id="videos" className="py-20 md:py-28 bg-black">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-12">
                        <h2 className="section-title text-3xl md:text-4xl">All Productions</h2>
                        <p className="text-gray-400 mt-4">Explore our full library of in-depth analysis and compelling stories.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {productionsData.map(video => <VideoCard key={video.id} {...video} />)}
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
