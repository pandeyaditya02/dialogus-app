"use client";

import React, { useState } from 'react';
import { Youtube, Twitter, Linkedin, Menu, BriefcaseBusiness, ShieldCheck, ExternalLink, UserCheck, AlertTriangle, FileClock } from 'lucide-react';

// --- Define NavLink Type ---
interface NavLink {
    href: string;
    label: string;
    active?: boolean;
}

// --- Header Component (for Disclaimer Page) ---
const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navLinks: NavLink[] = [
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
                            <li><a href="/disclaimer" className="footer-link">Disclaimer</a></li>
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

// --- Disclaimer Page Content ---
const disclaimerCards = [
    {
        icon: <BriefcaseBusiness />,
        title: "No Professional Advice",
        text: "Our content is for informational purposes and does not constitute legal, financial, or medical advice. Please consult a qualified professional for specific guidance."
    },
    {
        icon: <ShieldCheck />,
        title: "Accuracy of Information",
        text: "While we strive for accuracy, we make no guarantees. Opinions expressed by hosts or guests are their own and not necessarily the views of Dialogus."
    },
    {
        icon: <ExternalLink />,
        title: "Third-Party Content",
        text: "We are not responsible for the content or practices of any third-party websites or services linked to from our platforms. Use them at your own risk."
    },
    {
        icon: <UserCheck />,
        title: "Viewer Responsibility",
        text: "You are solely responsible for how you interpret and use the information we provide. We do not endorse harmful or unlawful interpretations of our content."
    },
    {
        icon: <AlertTriangle />,
        title: "Limitation of Liability",
        text: "Dialogus and its team shall not be held liable for any damages or losses arising from the use of our content. This includes financial or reputational harm."
    },
    {
        icon: <FileClock />,
        title: "Updates to Disclaimer",
        text: "We may update this notice periodically. The updated version will be posted here with a new effective date to reflect any changes in our operations or laws."
    }
];

const DisclaimerCard = ({ icon, title, text }: { icon: React.ReactNode, title: string, text: string }) => (
    <div className="card-base p-6 text-center items-center flex flex-col">
        <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-fuchsia-500/10 text-fuchsia-400">
            {icon}
        </div>
        <h3 className="text-lg font-bold text-white mt-4">{title}</h3>
        <p className="text-gray-400 text-sm mt-2 flex-grow">{text}</p>
    </div>
);


const DisclaimerContent = () => {
    return (
        <main className="pt-24">
            <section id="disclaimer" className="py-20 md:py-28">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="text-center">
                            <h2 className="section-title text-3xl md:text-4xl mb-4">Disclaimer Notice</h2>
                            <p className="text-gray-400 max-w-2xl mx-auto">The following terms apply to all content on our website, YouTube channel, and other digital platforms. By accessing our content, you agree to this notice.</p>
                        </div>

                        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                           {disclaimerCards.map(card => <DisclaimerCard key={card.title} {...card} />)}
                        </div>

                        <div className="mt-16 text-center border-t border-gray-800 pt-10">
                            <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
                            <p className="text-gray-400">If you have any questions about this Disclaimer Notice, please contact us at:</p>
                            <p className="mt-4 text-gray-200">[Official email address]</p>
                            <p className="text-gray-400 text-sm">[Registered address]</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};


// --- Main Disclaimer Page Component ---
export default function DisclaimerPage() {
  return (
    <>
      <Header />
      <DisclaimerContent />
      <Footer />
    </>
  );
}

