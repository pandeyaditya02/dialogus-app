// layout.tsx
import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Adsense from "./components/Adsense";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css"; // ✅ Import global styles

export const metadata: Metadata = {
  title: "Dialogus - Debate Discuss Decide",
  description:
    "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
  icons: {
    icon: "/NEW LOGO.png",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <Adsense />
      </head>
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}