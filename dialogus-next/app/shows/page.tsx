"use client";

import React, { useEffect } from "react";
import Image from "next/image";

// Shows data with playlist information
const showsData = [
  {
    title: "WORLD VIEW",
    thumbnail: "/shows thumbnail/WORLD VIEW.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHI3c517bIrA7kVx0leH6v-y",
    delay: "0ms",
  },
  {
    title: "TALK IT OUT",
    thumbnail: "/shows thumbnail/TALK IT OUT.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHKxeFFSKSKQBhunIhR_aIMS",
    delay: "100ms",
  },
  {
    title: "SAMAJIK VIMARSH",
    thumbnail: "/shows thumbnail/SAMAJIK VIMARSH.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHIBgML8hbZlpzMfbN4awCBt",
    delay: "200ms",
  },
  {
    title: "PRAWAH",
    thumbnail: "/shows thumbnail/PRAWAH.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHI32tt2UdDEBsJ-6r_ccmMD",
    delay: "300ms",
  },
  {
    title: "GEARHEAD",
    thumbnail: "/shows thumbnail/GEARHEAD.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHI43SXuLkOzNNA01Hh5RhiB",
    delay: "400ms",
  },
  {
    title: "CLEAR CUT",
    thumbnail: "/shows thumbnail/CLEAR CUT.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHKVHzN80d4HjHYSz-mjpOhx",
    delay: "500ms",
  },
  {
    title: "BITS & PIECES",
    thumbnail: "/shows thumbnail/BITS & PIECES.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHIJh5QCyMBS4YLNCVxC1Wxc",
    delay: "600ms",
  },
  {
    title: "BAAT TAKE KI",
    thumbnail: "/shows thumbnail/BAAT TAKE KI.png",
    playlistUrl: "https://www.youtube.com/playlist?list=PLiWELLjBSGHKXxhdLYg3uB-bl_T6U7jz1",
    delay: "700ms",
  },
];

const ShowCard = ({
  title,
  thumbnail,
  playlistUrl,
  delay,
}: {
  title: string;
  thumbnail: string;
  playlistUrl: string;
  delay: string;
}) => (
  <div
    className="fade-in group cursor-pointer"
    style={{ transitionDelay: delay }}
    onClick={() => window.open(playlistUrl, "_blank", "noopener,noreferrer")}
  >
    <div className="relative overflow-hidden rounded-2xl bg-gray-900 border border-gray-800 transition-all duration-300 hover:border-fuchsia-500 hover:shadow-2xl hover:shadow-fuchsia-500/20 hover:-translate-y-2">
      {/* Thumbnail Image */}
      <div className="relative aspect-video overflow-hidden">
        <Image
          src={thumbnail}
          alt={`${title} show thumbnail`}
          width={800}
          height={450}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          priority={title === "WORLD VIEW" || title === "TALK IT OUT"}
        />
        
        {/* Overlay with play icon */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-fuchsia-600 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10 md:h-12 md:w-12 text-white ml-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Title Section */}
      <div className="p-8">
        <h3 className="font-bold text-2xl md:text-3xl text-white mb-3 group-hover:text-fuchsia-400 transition-colors">
          {title}
        </h3>
        <p className="text-gray-400 text-base group-hover:text-gray-300 transition-colors">
          Watch on YouTube
        </p>
      </div>
    </div>
  </div>
);

export default function ShowsPage() {
  // Intersection Observer for fade-in effect
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const targets = document.querySelectorAll(".fade-in");
    targets.forEach((target) => observer.observe(target));

    return () => targets.forEach((target) => observer.unobserve(target));
  }, []);

  return (
    <main className="pt-24">
      <section id="shows" className="py-20 md:py-28 bg-black">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="section-title text-3xl md:text-5xl mb-6 font-bold fade-in">
              Our Shows
            </h2>
            <p className="text-gray-400 text-lg md:text-xl fade-in" style={{ transitionDelay: "100ms" }}>
              Explore our diverse collection of shows. Click on any show to watch the complete playlist on YouTube.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 md:gap-12">
            {showsData.map((show) => (
              <ShowCard key={show.title} {...show} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
