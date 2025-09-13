"use client";

import { useEffect } from "react";
import Image from "next/image";

const speakersData = [
  {
    name: "Pawan Kumar",
    image: "/pawan kumar.jpg",
    delay: "0ms",
    intro: [
      "PAWAN KUMAR is a veteran financial journalist and policy specialist with nearly three decades of experience in navigating India’s economy, politics and the corporate landscape.",
      "Over the course of his career, he has earned a reputation for sharp analysis, credible reporting, and deep policy insight, making him a trusted voice in the national discourse. ",
      "As managing editor at Dialogus and host of Talk It Out, Pawan brings together leaders, experts and changemakers to deliver thought-provoking conversations on policy, governance and the forces shaping India's future.",
    ],
  },
  {
    name: "Vishal Dahia",
    image: "/Vishal Dahia.jpg",
    delay: "100ms",
    intro: [
      "VISHAL DAHIYA is a noted journalist and strategic communicator with a distinguished career in news analysis and public discourse.",
      "With years of experience across TV and digital platforms, he is known for his in-depth understanding of global affairs, sharp interviewing skills, and balanced perspective on complex issues.",
      "Vishal currently anchors World View on Dialogus, where he breaks down global trends, geopolitical shifts, and key international debates with deep insight and precision.",
    ],
  },
  {
    name: "Sonia Singh",
    image: "/Sonia Singh.jpg",
    delay: "200ms",
    intro: [
      "Sonia blends creativity with sharp analysis in her approach to storytelling.",
      "At Dialogus, she curates conversations that spark curiosity and innovation.",
      "Her background in media production brings depth to every episode.",
    ],
  },
  {
    name: "Sweta",
    image: "/Sweta.jpg",
    delay: "300ms",
    intro: [
      "SWETA RANJAN is a seasoned journalist with over 18 years of excellence across electronic and print media.",
      "Renowned for her credible reporting, incisive analysis, and sharp news instincts, she transforms complex stories into clear, compelling narratives.",
      "A trusted voice in journalism, Sweta now anchors Clear Cut and Bits & Pieces on Dialogus, where her trademark depth and clarity continue to engage and enlighten audiences."
    ],
  },
];

const SpeakerCard = ({
  name,
  image,
  delay,
  intro,
}: (typeof speakersData)[0]) => (
  <div
    className="fade-in text-center relative group"
    style={{ transitionDelay: delay }}
  >
    {/* Image Card - Background Layer */}
    <div className="relative overflow-hidden rounded-2xl shadow-xl shadow-fuchsia-500/20 transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl">
      <Image
        src={image}
        alt={name}
        width={400}
        height={400}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
    </div>

    {/* Text Card - Overlay Layer */}
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-black/95 via-gray-900/90 to-black/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-center items-center p-6 z-10 border border-gray-700/30">
      <div className="text-center max-w-full">
        <h4 className="font-bold text-2xl text-fuchsia-400 mb-4 drop-shadow-lg">
          {name}
        </h4>
        <div className="space-y-3">
          {intro.map((line, index) => (
            <p
              key={index}
              className="leading-relaxed text-gray-100 text-sm drop-shadow-md"
            >
              {line}
            </p>
          ))}
        </div>
      </div>
    </div>

    {/* Speaker Name - Always Visible */}
    <div className="mt-4">
      <h3 className="font-bold text-lg text-white">{name}</h3>
    </div>
  </div>
);

const Speakers = () => {
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
    <section id="speakers" className="py-20 md:py-28">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="section-title text-3xl md:text-4xl mb-4 fade-in">
            The Voices Behind Dialogus
          </h2>
          <p
            className="text-gray-400 fade-in"
            style={{ transitionDelay: "100ms" }}
          >
            From hard-hitting conversations to thought-provoking discussions,
            our brilliant hosts bring intelligence, insight and range to every
            production
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 pt-8">
          {speakersData.map((speaker) => (
            <SpeakerCard key={speaker.name} {...speaker} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Speakers;
