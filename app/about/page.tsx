"use client";

import React from 'react';

export default function AboutPage() {
    return (
        <main className="pt-24">
            <section id="about" className="py-20 md:py-28 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        {/* Left column: Visual graphic */}
                        <div className="relative hidden lg:flex justify-center items-center h-full">
                            <div className="absolute w-80 h-80 bg-fuchsia-500 rounded-full opacity-20 blur-3xl"></div>
                            <div className="absolute w-64 h-64 bg-cyan-500 rounded-full opacity-20 blur-3xl bottom-0 right-0"></div>
                            <div className="relative w-full max-w-sm">
                                <img src="/NEW LOGO.png" alt="Dialogus Logo Mark" className="w-full h-auto opacity-10" />
                                <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-transparent"></div>
                            </div>
                        </div>

                        {/* Right column: Content */}
                        <div>
                            <h2 className="section-title text-3xl md:text-4xl mb-4">Clarity in a World of Noise</h2>
                            <p className="text-base text-gray-400 leading-relaxed mb-8">
                                In an era where information is everywhere but clarity is rare, Dialogus stands apart. Our mission is to cut through the noise and deliver insights that truly matter.
                            </p>

                            <div className="grid sm:grid-cols-3 gap-6 my-10 text-center">
                                <div className="card-base p-6">
                                    <h3 className="font-bold text-white text-lg">Debate</h3>
                                    <p className="text-gray-400 text-sm mt-1">Challenge assumptions with data-driven analysis.</p>
                                </div>
                                <div className="card-base p-6">
                                    <h3 className="font-bold text-white text-lg">Discuss</h3>
                                    <p className="text-gray-400 text-sm mt-1">Engage with diverse perspectives from domain experts.</p>
                                </div>
                                <div className="card-base p-6">
                                    <h3 className="font-bold text-white text-lg">Decide</h3>
                                    <p className="text-gray-400 text-sm mt-1">Form your own informed opinions with confidence.</p>
                                </div>
                            </div>
                            
                            <div className="text-gray-300 space-y-4 text-base leading-relaxed">
                                <p>At Dialogus, we cover a broad spectrum of subjects: politics, policy, economics, law, culture, and the disruptive trends shaping our future. Our commitment is to go beyond surface-level reporting, giving you the context you need.</p>
                <p>Our platform bridges generations, fostering dialogue, not division. With a foundation built on expertise and cutting-edge digital storytelling, Dialogus is more than a channel—it&apos;s a movement toward smarter conversations.</p>
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-800 text-center">
                                <p className="text-lg text-gray-200 mb-4">In a world of fleeting trends, Dialogus offers something rare: <strong className="text-white">substance.</strong></p>
                                <p className="text-xl font-bold tracking-widest text-fuchsia-400">
                                    WATCH | JOIN | SUBSCRIBE | ENGAGE
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
  );
}
