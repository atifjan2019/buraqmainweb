import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Car Finance" };

export default function FinancePage() {
  return (
    <ComingSoon
      eyebrow="FINANCE"
      title="Finance applications, coming shortly"
      body="The online finance enquiry form is being built. For now, get in touch and our team will talk you through the options available on any car in stock. Finance is subject to status, terms and conditions, and affordability."
    />
  );
}
