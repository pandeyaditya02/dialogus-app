import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - Clarity in a World of Noise",
  description:
    "Learn about Dialogus, a digital media platform committed to cutting through the noise with data-driven analysis covering politics, business, law, and culture.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Dialogus - Clarity in a World of Noise",
    description:
      "Learn about Dialogus, a digital media platform committed to cutting through the noise.",
    type: "website",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
