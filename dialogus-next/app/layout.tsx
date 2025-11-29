import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Adsense from "./components/Adsense";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
    title: "Dialogus - Debate Discuss Decide",
    description:
        "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
    icons: {
        icon: "/logo3.jpg", // ✅ path relative to /public
    },
    other: {
        "google-adsense-account": "ca-pub-1871872152018500",
    },
};

// Inter for body text
const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["300", "400", "500", "600", "700", "800"],
    preload: true,
});

// Space Grotesk for headers / hero titles
const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
    preload: true,
});
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable}`}>
            <head>
                <Adsense />

                <link rel="preconnect" href="https://www.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.googleapis.com" />


            </head>
            <body className="antialiased font-smooth">
                <Header />
                {children}
                <Footer />
            </body>
        </html>
    );
}
