import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <ComingSoon
      eyebrow="ABOUT US"
      title="More about Burraq Motors"
      body="We specialise in quality Japanese imports and hybrids, sold with transparent pricing and no hidden fees. A fuller story about the team is on its way."
    />
  );
}
