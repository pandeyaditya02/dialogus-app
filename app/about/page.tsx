"use client";

import React, { useState, useEffect } from 'react';
import { Youtube, Twitter, Linkedin, Menu } from 'lucide-react';

// --- Header Component (Copied for this page) ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // Note: Active link logic is simplified for this page.
    const navLinks = [
        { href: "/", label: "Home" },
        { href: "/productions/", label: "Productions" },
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
                        <a key={link.href} href={link.href} className="nav-link">{link.label}</a>
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
                    <a key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)} className="block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link">{link.label}</a>
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
                    {/* Column 1: About Us */}
                    <div className="md:col-span-2 lg:col-span-1">
                        <h3 className="text-lg font-bold text-white mb-4">Dialogus</h3>
                        <p className="text-gray-400 max-w-xs leading-relaxed">
                            Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.
                        </p>
                    </div>
                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-3">
                            <li><a href="/about" className="footer-link">About Us</a></li>
                            <li><a href="/#disclaimer" className="footer-link">Disclaimer</a></li>
                            <li><a href="#" className="footer-link">Privacy Policy</a></li>
                            <li><a href="#" className="footer-link">Terms of Service</a></li>
                        </ul>
                    </div>
                    {/* Column 3: Social Media */}
                    <div>
                        <h3 className="text-lg font-bold text-white mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="social-icon"><Youtube size={24} /></a>
                            <a href="#" className="social-icon"><Twitter size={24} /></a>
                            <a href="#" className="social-icon"><Linkedin size={24} /></a>
                        </div>
                    </div>
                    {/* Column 4: CTA */}
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

// --- About Page Content ---
const AboutContent = () => {
    return (
        <main className="pt-24">
            <section id="about" className="py-20 md:py-28 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left column: Visual graphic */}
                        <div className="relative hidden lg:flex justify-center items-center h-full">
                            <div className="absolute w-80 h-80 bg-fuchsia-500 rounded-full opacity-20 blur-3xl"></div>
                            <div className="absolute w-64 h-64 bg-cyan-500 rounded-full opacity-20 blur-3xl bottom-0 right-0"></div>
                            <div className="relative w-full max-w-sm">
                                <img src="/NEW LOGO.png" alt="Dialogus Logo Mark" className="w-full h-auto opacity-10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
                            </div>
                        </div>

                        {/* Right column: Content */}
                        <div>
                            <h2 className="section-title text-3xl md:text-4xl mb-4">Clarity in a World of Noise</h2>
                            <p className="text-base text-gray-400 leading-relaxed mb-8">
                                In an era where information is everywhere but clarity is rare, Dialogus stands apart. Our mission is to cut through the noise and deliver insights that truly matter.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-6 my-10 text-center">
                                <div className="card-base p-6">
                                    <h3 className="font-bold text-white text-lg">Debate</h3>
                                    <p className="text-gray-400 text-sm mt-1">Challenge assumptions with data-driven analysis.</p>
                                </div>
                                <div className="card-base p-6">
                                    <h3 className="font-bold text-white text-lg">Discuss</h3>
                                    <p className="text-gray-400 text-sm mt-1">Engage with diverse perspectives from domain experts.</p>
                                </div>
                                <div className="card-base p-6">
                                    <h3 className="font-bold text-white text-lg">Decide</h3>
                                    <p className="text-gray-400 text-sm mt-1">Form your own informed opinions with confidence.</p>
                                </div>
                            </div>
                            
                            <div className="text-gray-300 space-y-4 text-base leading-relaxed">
                                <p>At Dialogus, we cover a broad spectrum of subjects: politics, policy, economics, law, culture, and the disruptive trends shaping our future. Our commitment is to go beyond surface-level reporting, giving you the context you need.</p>
                                <p>Our platform bridges generations, fostering dialogue, not division. With a foundation built on expertise and cutting-edge digital storytelling, Dialogus is more than a channel—it’s a movement toward smarter conversations.</p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                                <p className="text-lg text-gray-200 mb-4">In a world of fleeting trends, Dialogus offers something rare: <strong className="text-white">substance.</strong></p>
                                <p className="text-xl font-bold tracking-widest text-fuchsia-400">
                                    WATCH | JOIN | SUBSCRIBE | ENGAGE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

// --- Main About Page Component ---
export default function AboutPage() {
  return (
    <>
      <Header />
      <AboutContent />
      <Footer />
    </>
  );
}
