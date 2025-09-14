"use client";

import { useEffect } from "react";

const showsData = [
  {
    title: "TALK IT OUT",
    host: "Pawan Kumar",
    playlistId: "PLiWELLjBSGHKxeFFSKSKQBhunIhR_aIMS",
    delay: "0ms",
  },
  {
    title: "BITS & PIECES",
    host: "Sweta",
    playlistId: "PLiWELLjBSGHIJh5QCyMBS4YLNCVxC1Wxc",
    delay: "150ms",
  },
  {
    title: "WORLD VIEW",
    host: "Vishal Dahia",
    playlistId: "PLiWELLjBSGHI3c517bIrA7kVx0leH6v-y",
    delay: "300ms",
  },
  {
    title: "SAMAJIK VIMARSH",
    host: "Preeta Harit",
    playlistId: "PLiWELLjBSGHIBgML8hbZlpzMfbN4awCBt",
    delay: "450ms",
  },
];

const ShowCard = ({
  title,
  host,
  playlistId,
  delay,
}: (typeof showsData)[0]) => (
  <div
    className="block text-center group fade-in"
    style={{ transitionDelay: delay }}
  >
    <div className="relative w-full aspect-video mb-6 rounded-2xl overflow-hidden shadow-2xl group bg-gray-900 border border-gray-800">
      <iframe
        src={`https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full transition-transform duration-300 group-hover:scale-[1.02]"
        title={`${title} Playlist`}
        frameBorder="0"
      />
    </div>
    <h3 className="font-bold text-xl md:text-2xl text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-base">{host}</p>
  </div>
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
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="section-title text-3xl md:text-5xl mb-4 fade-in font-bold">
            Flagship Shows
          </h2>
          <p
            className="text-gray-400 text-lg md:text-xl fade-in"
            style={{ transitionDelay: "100ms" }}
          >
            Explore our curated playlists hosted by brilliant voices. All content embedded directly on this page.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {showsData.map((show) => (
            <ShowCard key={show.title} {...show} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FlagshipShows;