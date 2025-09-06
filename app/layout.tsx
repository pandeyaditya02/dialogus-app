import type { Metadata } from "next";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "Dialogus - Crafting Digital Narratives",
  description:
    "Dialogus is a digital media platform bringing clarity in a noisy world. We cover politics, business, law, and culture with data-driven analysis and storytelling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Tailwind CSS CDN */}
        <script src="https://cdn.tailwindcss.com"></script>

        {/* Google Fonts: Inter & Space Grotesk */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />

        {/* Global Styles */}
        <style>
          {`
            /* Base Styles */
            body {
                font-family: 'Inter', sans-serif;
                background-color: #050505;
                color: #E4E4E7;
            }
            
            /* Apply Space Grotesk to the header and hero title */
            #header, .hero-title {
                font-family: 'Space Grotesk', sans-serif;
            }
            
            /* Dark Navigation Bar Styles with Scroll Effect */
            .dark-glass-nav {
                background: transparent;
                backdrop-filter: blur(16px);
                -webkit-backdrop-filter: blur(16px);
                border-bottom: 1px solid transparent;
                transition: background-color 0.4s ease-in-out, border-color 0.4s ease-in-out;
            }

            .dark-glass-nav.scrolled {
                background: rgba(5, 5, 5, 0.7);
                border-bottom-color: rgba(255, 255, 255, 0.08);
            }

            .nav-link {
                position: relative;
                color: #a1a1aa;
                text-decoration: none;
                transition: color 0.3s ease;
                font-size: 0.95rem;
            }

            .nav-link:hover, .nav-link.active {
                color: #ffffff;
            }
            
            .nav-link::after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                background-color: #c026d3;
                transition: width 0.3s ease-in-out;
            }

            .nav-link:hover::after, .nav-link.active::after {
                width: 100%;
            }

            /* Cinematic Hero Section */
            .hero-video-bg {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100vw;
                height: 56.25vw; /* 16:9 aspect ratio */
                min-height: 100vh;
                min-width: 177.77vh; /* 16:9 aspect ratio for portrait */
                transform: translate(-50%, -50%);
                z-index: 0;
                pointer-events: none;
            }
            
            /* Netflix-style Slider */
            .slider-container {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            .slider-container::-webkit-scrollbar {
                display: none;
            }

            .slider-arrow {
                background: rgba(0, 0, 0, 0.5);
                transition: all 0.2s ease-in-out;
                opacity: 0;
            }
            
            .slider-wrapper:hover .slider-arrow {
                opacity: 1;
            }
            
            .slider-arrow:hover {
                background: rgba(0, 0, 0, 0.8);
                transform: translateY(-50%) scale(1.1);
            }
            
            .video-card-thumbnail {
                transition: transform 0.3s ease-in-out;
            }
            
            .video-card:hover .video-card-thumbnail {
                transform: scale(1.05);
            }
            
            .video-title-truncate {
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            /* General Styles */
            .section-title {
                color: #F4F4F5;
                font-weight: 800;
            }

            .primary-cta {
                background-color: #c026d3;
                color: #fff;
                transition: all 0.3s ease;
                box-shadow: 0 0 20px rgba(192, 38, 211, 0.4);
            }

            .primary-cta:hover {
                background-color: #d946ef;
                transform: scale(1.05);
                box-shadow: 0 0 30px rgba(217, 70, 239, 0.6);
            }
            
            .subscribe-cta {
                background-color: transparent;
                border: 1px solid rgba(255, 255, 255, 0.4);
                color: #d4d4d8;
                transition: all 0.3s ease;
            }
            .subscribe-cta:hover {
                background-color: rgba(255, 255, 255, 0.1);
                border-color: #ffffff;
                color: #ffffff;
            }
            
            .speaker-card {
                position: relative;
                border-radius: 0.75rem;
                overflow: hidden;
                aspect-ratio: 4 / 5;
                transition: transform 0.3s ease;
            }
            
            .speaker-card:hover {
                transform: scale(1.03);
            }

            .speaker-info {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
                padding: 1.5rem 1rem 1rem;
                opacity: 0;
                transform: translateY(10px);
                transition: all 0.3s ease;
            }
            
            .speaker-card:hover .speaker-info {
                opacity: 1;
                transform: translateY(0);
            }
            
            .fade-in {
                opacity: 0;
                transform: translateY(20px);
                transition: opacity 0.6s ease-out, transform 0.6s ease-out;
            }
            .fade-in.visible {
                opacity: 1;
                transform: translateY(0);
            }
            
            .footer-link {
                color: #ccc;
                transition: color 0.2s ease-in-out;
            }
            .footer-link:hover {
                color: #fff;
                text-decoration: underline;
            }
            .social-icon {
                color: #ccc;
                transition: all 0.2s ease-in-out;
            }
            .social-icon:hover {
                color: #c026d3;
                transform: scale(1.1);
            }
          `}
        </style>
      </head>
      <body className="antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
