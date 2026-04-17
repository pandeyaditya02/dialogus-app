import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Read the Dialogus Disclaimer Notice. Content is for informational purposes only and does not constitute professional advice.",
  alternates: {
    canonical: "/disclaimer",
  },
  openGraph: {
    title: "Disclaimer - Dialogus",
    description:
      "Read the Dialogus Disclaimer Notice covering content use and limitations.",
    type: "website",
  },
};

export default function DisclaimerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
