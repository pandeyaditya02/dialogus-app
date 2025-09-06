"use client";

import { useEffect } from 'react';

const speakersData = [
    { name: 'Pawan Kumar', role: 'Host, The Digital Dialogue', image: '/pawan kumar.jpg', delay: '0ms' },
    { name: 'Vishal Dahia', role: 'Host, Uncharted Territories', image: '/Vishal Dahia.jpg', delay: '100ms' },
    { name: 'Sonia Singh', role: 'Host, The Creative Code', image: '/Sonia Singh.jpg', delay: '200ms' },
    { name: 'Sweta', role: 'Executive Producer', image: '/Sweta.jpg', delay: '300ms' },
];

const SpeakerCard = ({ name, role, image, delay }: typeof speakersData[0]) => (
    <div className="speaker-card fade-in" style={{ transitionDelay: delay }}>
        <img src={image} alt={name} className="w-full h-full object-cover object-center" />
        <div className="speaker-info">
            <h3 className="font-bold text-lg text-white">{name}</h3>
            <p className="text-fuchsia-300 text-sm">{role}</p>
        </div>
    </div>
);


const Speakers = () => {
     // This useEffect is now managed in Productions.tsx, but can be duplicated if sections are used independently.
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });

        const targets = document.querySelectorAll('.fade-in');
        targets.forEach(target => observer.observe(target));

        return () => targets.forEach(target => observer.unobserve(target));
    }, []);

    return (
        <section id="speakers" className="py-20 md:py-28">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="section-title text-3xl md:text-4xl mb-4 fade-in">The Voices Behind Dialogus</h2>
                    <p className="text-gray-400 fade-in" style={{ transitionDelay: '100ms' }}>
                        Meet the brilliant minds and compelling personalities that host our shows and lead our creative productions.
                    </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-8">
                    {speakersData.map((speaker) => (
                        <SpeakerCard key={speaker.name} {...speaker} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Speakers;

