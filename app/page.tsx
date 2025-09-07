"use client";

import React from 'react';
import Hero from './components/Hero';
import Productions from './components/Productions';
import Speakers from './components/Speakers';
import FlagshipShows from './components/FlagshipShows';

export default function Home() {
  return (
    <main>
      <Hero />
      <Productions />
      <FlagshipShows />
      <Speakers />
    </main>
  );
}