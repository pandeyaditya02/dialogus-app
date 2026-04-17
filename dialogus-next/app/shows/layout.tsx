import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Shows - Explore Dialogus Playlists",
  description:
    "Explore the diverse collection of Dialogus shows including World View, Talk It Out, Clear Cut, and more. Watch complete playlists on YouTube.",
  alternates: {
    canonical: "/shows",
  },
  openGraph: {
    title: "Our Shows - Explore Dialogus Playlists",
    description:
      "Explore the diverse collection of Dialogus shows.",
    type: "website",
  },
};

export default function ShowsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
