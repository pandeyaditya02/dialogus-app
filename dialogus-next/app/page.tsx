import React from "react";
import Hero from "./components/Hero";
import VideosWrapper from "./components/VideosWrapper";
import Speakers from "./components/Speakers";

export default function Home() {

  return (
    <main>
      <Hero />
      <VideosWrapper />
      <Speakers />
    </main>
  );
}
