import type { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = { title: "Our Cars" };

export default function CarsPage() {
  return (
    <ComingSoon
      eyebrow="OUR COLLECTION"
      title="The full stock list is on its way"
      body="We're building the searchable stock page right now, with filters for price, mileage, fuel type and transmission. In the meantime, message us and we'll send you what's currently available."
    />
  );
}
