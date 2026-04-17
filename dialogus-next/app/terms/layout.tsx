import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the Dialogus Terms of Service. By using our platform you agree to these terms governing content use, user conduct, and liability.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "Terms of Service - Dialogus",
    description:
      "Read the Dialogus Terms of Service governing platform use.",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
