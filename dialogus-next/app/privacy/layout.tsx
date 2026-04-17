import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read the Dialogus Privacy Policy. Learn how we collect, use, and safeguard your personal information in compliance with Indian data protection laws.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "Privacy Policy - Dialogus",
    description:
      "Learn how Dialogus collects, uses, and safeguards your personal information.",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
