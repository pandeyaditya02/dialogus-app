"use client";

import React, { useState } from 'react';
import { Youtube, Twitter, Linkedin, Menu } from 'lucide-react';

// --- Header Component (for Talent Page) ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/productions/", label: "Productions" },
        { href: "/shows/", label: "Shows" },
        { href: "/talent/", label: "Talent", active: true },
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

// --- Talent Page Content ---
const talentData = [
    {
        name: "Pawan Kumar",
        role: "Host, The Digital Dialogue",
        imgSrc: "/pawan kumar.jpg",
        alt: "Pawan Kumar",
        delay: "0ms"
    },
    {
        name: "Vishal Dahia",
        role: "Host, Uncharted Territories",
        imgSrc: "/Vishal Dahia.jpg",
        alt: "Vishal Dahia",
        delay: "100ms"
    },
    {
        name: "Sonia Singh",
        role: "Host, The Creative Code",
        imgSrc: "/Sonia Singh.jpg",
        alt: "Sonia Singh",
        delay: "200ms"
    },
    {
        name: "Sweta",
        role: "Executive Producer",
        imgSrc: "/Sweta.jpg",
        alt: "Sweta",
        delay: "300ms"
    },
    {
        name: "Elena Sato",
        role: "Head of Audio",
        imgSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        alt: "Headshot of Elena Sato",
        delay: "400ms"
    }
];

const SpeakerCard = ({ name, role, imgSrc, alt, delay }: { name: string, role: string, imgSrc: string, alt: string, delay: string }) => (
    <div className="speaker-card rounded-lg overflow-hidden relative" style={{ transitionDelay: delay }}>
        <img src={imgSrc} alt={alt} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" />
        <div className="speaker-info">
            <h3 className="font-bold text-lg text-white">{name}</h3>
            <p className="text-fuchsia-300 text-sm">{role}</p>
        </div>
    </div>
);

const TalentContent = () => {
    return (
        <main className="pt-24">
            <section id="speakers" className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="section-title text-3xl md:text-4xl mb-4">The Voices Behind Dialogus</h2>
                        <p className="text-gray-400">Meet the brilliant minds and compelling personalities that host our shows and lead our creative productions.</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {talentData.map(speaker => <SpeakerCard key={speaker.name} {...speaker} />)}
                    </div>
                </div>
            </section>
        </main>
    );
};

// --- Main Talent Page Component ---
export default function TalentPage() {
  return (
    <>
      <Header />
      <TalentContent />
      <Footer />
    </>
  );
}
