"use client";

import { useEffect } from "react";
import Image from "next/image";

const showsData = [
  {
    title: "TALK IT OUT",
    host: "Pawan Kumar",
    imageUrl:
      "https://i3.ytimg.com/vi/GTnu0WBYt8U/maxresdefault.jpg",
    alt: "Talk It Out Playlist Cover",
    url: "https://www.youtube.com/watch?v=GTnu0WBYt8U&list=PLiWELLjBSGHKxeFFSKSKQBhunIhR_aIMS",
    delay: "0ms",
  },
  {
    title: "BITS & PIECES",
    host: "Sweta",
    imageUrl:
      "https://i3.ytimg.com/vi/BHG3aa3Mw0k/maxresdefault.jpg",
    alt: "Bits & Pieces Playlist Cover",
    url: "https://www.youtube.com/watch?v=BHG3aa3Mw0k&list=PLiWELLjBSGHIJh5QCyMBS4YLNCVxC1Wxc",
    delay: "150ms",
  },
  {
    title: "WORLD VIEW",
    host: "Vishal Dahia",
    imageUrl:
      "https://i3.ytimg.com/vi/KWaUj_C-xHU/maxresdefault.jpg",
    alt: "World View Playlist Cover",
    url: "https://www.youtube.com/watch?v=KWaUj_C-xHU&list=PLiWELLjBSGHI3c517bIrA7kVx0leH6v-y",
    delay: "300ms",
  },
  {
    title: "SAMAJIK VIMARSH",
    host: "Preeta Harit",
    imageUrl:
      "https://i3.ytimg.com/vi/7C4XbU0Z_IU/maxresdefault.jpg",
    alt: "Samajik Vimarsh Playlist Cover",
    url: "https://www.youtube.com/watch?v=7C4XbU0Z_IU&list=PLiWELLjBSGHIBgML8hbZlpzMfbN4awCBt",
    delay: "450ms",
  },
];

const ShowCard = ({
  title,
  host,
  imageUrl,
  alt,
  url,
  delay,
}: (typeof showsData)[0]) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="block text-center group fade-in"
    style={{ transitionDelay: delay }}
  >
    <div className="relative w-full aspect-square mb-4 rounded-2xl overflow-hidden shadow-2xl group">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <h3 className="font-bold text-lg text-white">{title}</h3>
    <p className="text-gray-400 text-sm">{host}</p>
  </a>
);

const FlagshipShows = () => {
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
    <section id="podcasts" className="py-20 md:py-28 bg-black">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="section-title text-3xl md:text-4xl mb-4 fade-in">
            Flagship Shows
          </h2>
          <p
            className="text-gray-400 fade-in"
            style={{ transitionDelay: "100ms" }}
          >
            Explore our curated playlists hosted by brilliant voices. Click a show to watch directly on YouTube.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {showsData.map((show) => (
            <ShowCard key={show.title} {...show} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlagshipShows;
