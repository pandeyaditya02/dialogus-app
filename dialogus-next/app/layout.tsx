import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Adsense from "./components/Adsense";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

export const metadata: Metadata = {
    metadataBase: new URL("https://www.dialogus.co.in"),
    title: {
        default: "Dialogus - Debate Discuss Decide",
        template: "%s | Dialogus",
    },
    description:
        "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
    icons: {
        icon: "/logo3.jpg",
    },
    openGraph: {
        siteName: "Dialogus",
        type: "website",
        locale: "en_IN",
        images: [
            {
                url: "/logo3.jpg",
                width: 800,
                height: 600,
                alt: "Dialogus - Debate Discuss Decide",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        images: ["/logo3.jpg"],
    },
    alternates: {
        canonical: "/",
    },
    other: {
        "google-adsense-account": "ca-pub-1871872152018500",
    },
};

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: "swap",
    weight: ["300", "400", "500", "600", "700", "800"],
    preload: true,
});

const spaceGrotesk = Space_Grotesk({
    subsets: ["latin"],
    variable: "--font-space-grotesk",
    display: "swap",
    weight: ["300", "400", "500", "600", "700"],
    preload: true,
});

const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Dialogus",
    url: "https://www.dialogus.co.in",
    logo: "https://www.dialogus.co.in/logo3.jpg",
    description:
        "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
    sameAs: [
        "https://www.youtube.com/@dialogus",
    ],
};

const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Dialogus",
    url: "https://www.dialogus.co.in",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    return (
        <html lang="en" className={`scroll-smooth ${inter.variable} ${spaceGrotesk.variable}`}>
            <head>
                <Adsense />
                <link rel="preconnect" href="https://www.googleapis.com" />
                <link rel="dns-prefetch" href="https://www.googleapis.com" />
                <link rel="preconnect" href="https://cdn.sanity.io" />
                <link rel="dns-prefetch" href="https://cdn.sanity.io" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(organizationJsonLd),
                    }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(websiteJsonLd),
                    }}
                />
            </head>
            <body className="antialiased font-smooth">
                <Header />
                {children}
                <Footer />
                {gaId && <GoogleAnalytics gaId={gaId} />}
            </body>
        </html>
    );
}
