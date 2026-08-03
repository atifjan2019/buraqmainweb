import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <ComingSoon
      eyebrow="CONTACT"
      title="Let's talk about your next car"
      body="Our contact form and showroom details are being added. Message us on WhatsApp in the meantime and we'll get straight back to you."
    />
  );
}
