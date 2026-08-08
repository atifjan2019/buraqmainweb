import Link from "next/link";
import { getFeaturedVehicles } from "@/lib/crm";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import VehicleCard from "./VehicleCard";

export default async function FeaturedVehicles() {
  const vehicles = await getFeaturedVehicles(6);

  return (
    /* py-24 is the doc's `spacing.section` — 96px between major editorial
       bands, uniform across the whole site so the vertical rhythm is
       grid-aligned rather than tuned per section. */
    <section id="stock" className="bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Our Collection"
          title="Featured"
          accent="Vehicles"
          body="Handpicked premium vehicles that represent the best of our current inventory."
        />

        {vehicles.length === 0 ? (
          <Reveal>
            <p className="mt-16 text-center font-light text-muted">
              Our next vehicles are being prepared. Get in touch and we&apos;ll
              let you know the moment they land.
            </p>
          </Reveal>
        ) : (
          /* 24px gutters, 3-up at desktop and 2-up at tablet. Columns reduce
             rather than cards scaling down, so photography keeps its crop. */
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle, i) => (
              <Reveal key={vehicle.slug} delay={(i % 3) * 90}>
                <VehicleCard vehicle={vehicle} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={120}>
          <div className="mt-16 flex justify-center">
            <Link href="/cars" className="btn btn-outline">
              View All Cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
