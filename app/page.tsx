"use client";

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Productions from './components/Productions';
import Speakers from './components/Speakers';
import FlagshipShows from './components/FlagshipShows';
import Footer from './components/Footer';
export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Productions />
        <Speakers />
        <FlagshipShows />
      </main>
      <Footer />
    </>
  );
}