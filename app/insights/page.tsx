"use client";

import React, { useState } from 'react';
import { Youtube, Twitter, Linkedin, Menu } from 'lucide-react';

// --- Header Component (for Insights Page) ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/productions/", label: "Productions" },
        { href: "/shows/", label: "Shows" },
        { href: "/talent/", label: "Talent" },
        { href: "/insights/", label: "Insights", active: true },
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
  return (
    <>
      <Header />
      <InsightsContent />
      <Footer />
    </>
  );
}
