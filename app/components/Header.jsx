"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        // Cleanup function to remove the event listener
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };
    
    const closeMenu = () => {
        setIsMenuOpen(false);
    }

    return (
        <header id="header" className={`dark-glass-nav fixed top-0 left-0 right-0 z-50 ${isScrolled ? 'scrolled' : ''}`}>
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <a href="/" onClick={closeMenu}>
                    <img src="/NEW LOGO.png" alt="Dialogus Logo" className="h-10 w-auto" />
                </a>
                <nav className="hidden md:flex space-x-12 items-center text-sm font-medium">
                    <a href="/" className="nav-link active">Home</a>
                    <a href="/productions" className="nav-link">Productions</a>
                    <a href="/shows" className="nav-link">Shows</a>
                    <a href="/talent" className="nav-link">Talent</a>
                    <a href="/insights" className="nav-link">Insights</a>
                </nav>
                <div className="hidden md:flex items-center gap-4">
                    <a href="#" className="subscribe-cta font-medium py-2 px-5 rounded-full text-sm">
                        Subscribe
                    </a>
                    <a href="#contact" className="primary-cta font-medium py-2 px-5 rounded-full text-sm">
                        Start a Project
                    </a>
                </div>
                <button onClick={toggleMenu} className="md:hidden text-white">
                    {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
            
            {/* Mobile Menu */}
            <div id="mobile-menu" className={`mobile-menu absolute top-full left-0 right-0 bg-black md:hidden transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <a href="/" onClick={closeMenu} className="block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link active">Home</a>
                <a href="/productions" onClick={closeMenu} className="block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link">Productions</a>
                <a href="/shows" onClick={closeMenu} className="block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link">Shows</a>
                <a href="/talent" onClick={closeMenu} className="block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link">Talent</a>
                <a href="/insights" onClick={closeMenu} className="block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link">Insights</a>
                <div className="p-4 flex flex-col gap-4">
                    <a href="#" onClick={closeMenu} className="block text-center py-3 px-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-300">Subscribe</a>
                    <a href="#contact" onClick={closeMenu} className="block text-center py-3 px-4 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-500 transition-colors duration-300">Start a Project</a>
                </div>
            </div>
        </header>
    );
};

export default Header;

