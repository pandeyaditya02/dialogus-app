"use client";

import React from "react";
import Hero from "./components/Hero";
import Videos from "./components/Videos";
import Speakers from "./components/Speakers";
import FlagshipShows from "./components/FlagshipShows";

export default function Home() {
  return (
    <main>
      <Hero />
      <Videos />
      <FlagshipShows />
      <Speakers />
    </main>
  );
}
