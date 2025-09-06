"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Youtube, Twitter, Linkedin, Menu, ChevronLeft, ChevronRight } from 'lucide-react';

// --- Header Component (for Productions Page) ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/productions/", label: "Productions", active: true },
        { href: "/shows/", label: "Shows" },
        { href: "/talent/", label: "Talent" },
        { href: "/insights/", label: "Insights" },
    ];

    return (
        <header id="header" className="dark-glass-nav fixed top-0 left-0 right-0 z-50 scrolled">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="/">
                    <img src="/NEW LOGO.png" alt="Dialogus Logo" className="h-10 w-auto" />
                </a>
                <nav className="hidden md:flex space-x-12 items-center text-sm font-medium">
                    {navLinks.map(link => (
                        <a key={link.href} href={link.href} className={`nav-link ${link.active ? 'active' : ''}`}>{link.label}</a>
                    ))}
                </nav>
                <div className="hidden md:flex items-center gap-4">
                    <a href="#" className="subscribe-cta font-medium py-2 px-5 rounded-full text-sm">
                        Subscribe
                    </a>
                    <a href="/#contact" className="primary-cta font-medium py-2 px-5 rounded-full text-sm">
                        Start a Project
                    </a>
                </div>
                <button id="mobile-menu-button" className="md:hidden text-white" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    <Menu size={24} />
                </button>
            </div>
            {/* Mobile Menu */}
            <div id="mobile-menu" className={`mobile-menu absolute top-full left-0 right-0 bg-black md:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                 {navLinks.map(link => (
                    <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className={`block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link ${link.active ? 'active' : ''}`}>{link.label}</a>
                ))}
                <div className="p-4 flex flex-col gap-4">
                    <a href="#" className="block text-center py-3 px-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-300">Subscribe</a>
                    <a href="/#contact" onClick={() => setIsMenuOpen(false)} className="block text-center py-3 px-4 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-500 transition-colors duration-300">Start a Project</a>
                </div>
            </div>
        </header>
    );
};

// --- Footer Component (Copied for this page) ---
const Footer = () => {
    return (
        <footer id="contact" className="bg-gradient-to-t from-black to-gray-900/50 border-t border-gray-800">
            <div className="container mx-auto px-6 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
                    <div className="md:col-span-2 lg:col-span-1">
                        <h3 className="text-lg font-bold text-white mb-4">Dialogus</h3>
                        <p className="text-gray-400 max-w-xs leading-relaxed">
                            Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><a href="/about" className="footer-link">About Us</a></li>
                            <li><a href="/#disclaimer" className="footer-link">Disclaimer</a></li>
                            <li><a href="#" className="footer-link">Privacy Policy</a></li>
                            <li><a href="#" className="footer-link">Terms of Service</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="social-icon"><Youtube size={24} /></a>
                            <a href="#" className="social-icon"><Twitter size={24} /></a>
                            <a href="#" className="social-icon"><Linkedin size={24} /></a>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Stay Updated</h3>
                        <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest insights.</p>
                        <a href="#" className="primary-cta text-white font-semibold py-2 px-5 rounded-full inline-block">
                            Subscribe Now
                        </a>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center text-xs">
                    <p className="text-gray-500">Copyright © 2025 Dialogus. All rights reserved.</p>
                    <p className="text-gray-500 mt-2 sm:mt-0">Made with ❤️ by the Dialogus Team</p>
                </div>
            </div>
        </footer>
    );
};

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
  return (
    <>
      <Header />
      <ProductionsContent />
      <Footer />
    </>
  );
}
