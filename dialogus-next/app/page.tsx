import React from "react";
import Hero from "./components/Hero";
import VideosWrapper from "./components/VideosWrapper";
import InsightsSection from "./components/InsightsSection";

export const revalidate = 60; // Revalidate every 60 seconds

export default function Home() {
  return (
    <main>
      <InsightsSection />
      <Hero />
      <VideosWrapper />
    </main>
  );
}