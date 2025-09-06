"use client";

import React from "react";
import Image from "next/image";
import Speakers from "../components/Speakers";

// --- Talent Page Content ---
// const talentData = [
//   {
//     name: "Pawan Kumar",
//     role: "Host, The Digital Dialogue",
//     imgSrc: "/pawan kumar.jpg",
//     alt: "Pawan Kumar",
//     delay: "0ms",
//   },
//   {
//     name: "Vishal Dahia",
//     role: "Host, Uncharted Territories",
//     imgSrc: "/Vishal Dahia.jpg",
//     alt: "Vishal Dahia",
//     delay: "100ms",
//   },
//   {
//     name: "Sonia Singh",
//     role: "Host, The Creative Code",
//     imgSrc: "/Sonia Singh.jpg",
//     alt: "Sonia Singh",
//     delay: "200ms",
//   },
//   {
//     name: "Sweta",
//     role: "Executive Producer",
//     imgSrc: "/Sweta.jpg",
//     alt: "Sweta",
//     delay: "300ms",
//   },
// ];

// const SpeakerCard = ({
//   name,
//   role,
//   imgSrc,
//   alt,
//   delay,
// }: {
//   name: string;
//   role: string;
//   imgSrc: string;
//   alt: string;
//   delay: string;
// }) => (
//   <div
//     className="speaker-card rounded-lg overflow-hidden relative"
//     style={{ transitionDelay: delay }}
//   >
//     <Image
//       src={imgSrc}
//       alt={alt}
//       width={500}
//       height={500}
//       className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
//     />
//     <div className="speaker-info">
//       <h3 className="font-bold text-lg text-white">{name}</h3>
//       <p className="text-fuchsia-300 text-sm">{role}</p>
//     </div>
//   </div>
// );

// const TalentContent = () => {
//   return (
//     <main className="pt-24">
//       <section id="speakers" className="py-20 md:py-28">
//         <div className="container mx-auto px-6">
//           <div className="text-center max-w-2xl mx-auto mb-16">
//             <h2 className="section-title text-3xl md:text-4xl mb-4">
//               The Voices Behind Dialogus
//             </h2>
//             <p className="text-gray-400">
//               Meet the brilliant minds and compelling personalities that host
//               our shows and lead our creative productions.
//             </p>
//           </div>
//           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
//             {talentData.map((speaker) => (
//               <SpeakerCard key={speaker.name} {...speaker} />
//             ))}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// };

// --- Main Talent Page Component ---
export default function TalentPage() {
  // return <TalentContent />;
  return <Speakers />
}
