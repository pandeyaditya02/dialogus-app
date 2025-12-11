// app/components/Adsense.tsx
"use client";

import Script from "next/script";

export default function Adsense() {
  // IMPORTANT: Replace this with your own AdSense client ID
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-XXXXXXXXXXXXXXXX";

  if (!adClient || adClient === "ca-pub-XXXXXXXXXXXXXXXX") {
    console.warn("AdSense client ID is not set. Ads will not be displayed.");
    // Render nothing if the client ID is the placeholder
    return null;
  }

  return (
    <Script
      id="adsense-script"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`}
      crossOrigin="anonymous"
      strategy="afterInteractive" // Load after the page is interactive
    />
  );
}