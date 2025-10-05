// app/components/Adsense.tsx
"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Adsense() {
  const pathname = usePathname();

  useEffect(() => {
    // This is for page-level ads, which Auto Ads handles.
    // The script will automatically detect route changes in Next.js.
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, [pathname]);

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
