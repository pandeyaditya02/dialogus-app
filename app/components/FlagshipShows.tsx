"use client";

import { useEffect } from "react";
import Image from "next/image";

const showsData = [
  {
    title: "The Digital Dialogue",
    host: "With Ava Chen",
    imageUrl:
      "https://images.unsplash.com/photo-1620641788421-7a1c36226328?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    alt: "Abstract colorful liquid podcast cover",
    delay: "0ms",
  },
  {
    title: "Uncharted Territories",
    host: "With Leo Kim",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    alt: "Abstract wave podcast cover",
    delay: "150ms",
  },
  {
    title: "The Creative Code",
    host: "With Mia Jones",
    imageUrl:
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    alt: "Colorful gradient podcast cover",
    delay: "300ms",
  },
  {
    title: "Blueprint",
    host: "With David Rodriguez",
    imageUrl:
      "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
    alt: "Abstract 3D shapes podcast cover",
    delay: "450ms",
  },
];

const ShowCard = ({
  title,
  host,
  imageUrl,
  alt,
  delay,
}: (typeof showsData)[0]) => (
  <div className="text-center group fade-in" style={{ transitionDelay: delay }}>
    <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden shadow-2xl group">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <h3 className="font-bold text-lg text-white">{title}</h3>
    <p className="text-gray-400 text-sm">{host}</p>
  </div>
);

const FlagshipShows = () => {
  // This useEffect is managed in Productions.tsx but can be added here if needed for standalone use.
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
            Our chart-topping podcasts are where culture-defining conversations
            happen. Tune in and get inspired.
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
