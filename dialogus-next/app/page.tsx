"use client";

import React from "react";
import Hero from "./components/Hero";
import dynamic from 'next/dynamic'

export default function Home() {

  const Videos = dynamic(() => import('./components/Videos'))
  const Speakers = dynamic(() => import('./components/Speakers'))

  return (
    <main>
      <Hero />
      <Videos />
      <Speakers />
    </main>
  );
}
