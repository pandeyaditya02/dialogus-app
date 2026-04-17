import Speakers from "../components/Speakers";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Hosts - Meet the Dialogus Team",
  description:
    "Meet the hosts and speakers who bring you data-driven analysis and insightful discussions on Dialogus.",
  alternates: {
    canonical: "/hosts",
  },
  openGraph: {
    title: "Our Hosts - Meet the Dialogus Team",
    description:
      "Meet the hosts and speakers who bring you insightful discussions on Dialogus.",
    type: "website",
  },
};

export default function HostsPage() {
  return (
    <main className="pt-24 min-h-screen">
      <Speakers />
    </main>
  );
}
