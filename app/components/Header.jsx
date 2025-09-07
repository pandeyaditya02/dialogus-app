"use client";

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
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
    { href: "/productions", label: "Productions" },
    { href: "/shows", label: "Shows" },
    { href: "/hosts", label: "Hosts" },
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
        <a href="/" onClick={closeMenu} className="flex items-center gap-4">
          <Image
            src="/NEW LOGO.png"
            alt="Dialogus Logo"
            width={300}
            height={100}
            className="h-10 w-auto"
          />
          <span className="hidden md:block font-semibold tracking-wider text-sm md:text-lg lg:text-xl text-gray-400 border-l border-gray-500 pl-4">
            DEBATE DISCUSS DECIDE
          </span>
        </a>
        <nav className="hidden md:flex space-x-12 items-center text-sm font-medium">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`nav-link ${isActive(link.href) ? "active" : ""}`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <a
            href="https://www.youtube.com/@Dialogusdigital"
            target="_blank"
            rel="noopener noreferrer"
            className="subscribe-cta font-medium py-2 px-5 rounded-full text-sm"
          >
            Subscribe
          </a>
          <a
            href="https://www.youtube.com/@Dialogusdigital"
            target="_blank"
            rel="noopener noreferrer"
            className="primary-cta font-medium py-2 px-5 rounded-full text-sm"
          >
            Connect With Us!
          </a>
        </div>
        <button onClick={toggleMenu} className="md:hidden text-white">
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`mobile-menu absolute top-full left-0 right-0 bg-black md:hidden transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={closeMenu}
            className={`block text-gray-300 text-center py-4 px-4 hover:bg-gray-900 transition-colors duration-300 nav-link ${
              isActive(link.href) ? "active" : ""
            }`}
          >
            {link.label}
          </a>
        ))}
        <div className="p-4 flex flex-col gap-4">
          <a
            href="#"
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
