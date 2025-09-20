"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the event listener
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/videos", label: "Videos" },
    { href: "/shows", label: "Shows" },
    { href: "/shorts", label: "Shorts" },
    { href: "/insights", label: "Insights" },
  ];

  const isActive = (href) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      id="header"
      className={`dark-glass-nav fixed top-0 left-0 right-0 z-50 ${
        isScrolled ? "scrolled" : ""
      }`}
    >
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo and Tagline */}
        <div className="flex-shrink-0">
          <Link
            href="/"
            onClick={closeMenu}
            className="flex items-center gap-2 sm:gap-4"
          >
            <Image
              // src="/NEW LOGO.png"
              src="/logo3.jpg"
              alt="Dialogus Logo"
              width={200}
              height={67}
              className="h-8 md:h-10 w-auto"
            />
            <span className="hidden lg:block font-semibold tracking-wider text-sm text-gray-400 border-l border-gray-600 pl-4">
              DEBATE DISCUSS DECIDE
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-grow justify-center items-center space-x-4 lg:space-x-8 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link whitespace-nowrap ${
                isActive(link.href) ? "active" : ""
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center flex-shrink-0 gap-2 lg:gap-4">
          <a
            href="https://www.youtube.com/@Dialogusdigital"
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-cta font-medium py-2 px-4 rounded-full text-sm whitespace-nowrap"
          >
            Subscribe
          </a>
          <a
            href="https://www.youtube.com/@Dialogusdigital"
            target="_blank"
            rel="noopener noreferrer"
            className="primary-cta font-medium py-2 px-5 rounded-full text-sm whitespace-nowrap"
          >
            Connect With Us!
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-white z-10">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`absolute top-0 left-0 right-0 pt-20 bg-black/90 backdrop-blur-md md:hidden transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ minHeight: "100vh" }}
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={`block text-gray-300 text-center text-lg py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link ${
              isActive(link.href) ? "active" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
        <div className="p-6 flex flex-col gap-4 border-t border-gray-800 mt-4">
          <a
            href="https://www.youtube.com/@Dialogusdigital"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeMenu}
            className="block text-center py-3 px-4 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors duration-300"
          >
            Subscribe
          </a>
          <a
            href="#contact"
            onClick={closeMenu}
            className="block text-center py-3 px-4 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-500 transition-colors duration-300"
          >
            Connect With Us!
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
