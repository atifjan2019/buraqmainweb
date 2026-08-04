import Link from "next/link";
import { getFeaturedVehicles } from "@/lib/crm";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";
import VehicleCard from "./VehicleCard";

export default async function FeaturedVehicles() {
  const vehicles = await getFeaturedVehicles(6);

  return (
    <section id="stock" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="OUR COLLECTION"
          title="Featured"
          accent="Vehicles"
          body="Handpicked premium vehicles that represent the best of our current inventory."
        />

        {vehicles.length === 0 ? (
          <Reveal>
            <p className="mt-16 text-center text-muted">
              Our next vehicles are being prepared. Get in touch and we'll let
              you know the moment they land.
            </p>
          </Reveal>
        ) : (
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle, i) => (
              <Reveal key={vehicle.registration} delay={(i % 3) * 90}>
                <VehicleCard vehicle={vehicle} />
              </Reveal>
            ))}
          </div>
        )}

        <Reveal delay={120}>
          <div className="mt-14 flex justify-center">
            <Link
              href="/cars"
              className="group inline-flex items-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-all hover:border-amber/50 hover:text-amber"
            >
              View All Cars
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
