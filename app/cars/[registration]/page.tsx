import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import { ArrowRight, Calendar, Car, Fuel, Gauge, Gear, Shield } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import StockNotice from "@/components/StockNotice";
import { CrmError, getVehicle } from "@/lib/crm";
import { financeDisclaimer, site } from "@/lib/site";
import {
  formatDate,
  formatMileage,
  formatPrice,
  vehicleHeadline,
  vehicleSlug,
  vehicleTitle,
} from "@/lib/vehicles";

interface PageProps {
  params: Promise<{ registration: string }>;
}

/**
 * The API resolves registrations ignoring case and spacing, so the URL slug
 * ("ma71kgv") is handed straight over without a lookup.
 *
 * Both this and `generateMetadata` call it with the same argument, and
 * identical fetches are memoised within a render, so it costs one request.
 */
async function loadVehicle(registration: string) {
  try {
    return { vehicle: await getVehicle(registration), reachable: true };
  } catch (error) {
    if (error instanceof CrmError) {
      console.error(`[cars] could not load ${registration}`, error);
      return { vehicle: null, reachable: false };
    }
    throw error;
  }
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { registration } = await params;
  const { vehicle } = await loadVehicle(registration);

  if (!vehicle) {
    return { title: "Vehicle no longer available", robots: { index: false } };
  }

  const title = `${vehicleHeadline(vehicle)} — ${formatPrice(vehicle.price)}`;
  const description =
    `${vehicleHeadline(vehicle)} in ${vehicle.color}, ` +
    `${formatMileage(vehicle.mileage)}, ${vehicle.fuelType}, ` +
    `${vehicle.transmission}. Available now at ${site.name} in Manchester.`;

  return {
    title,
    description,
    alternates: { canonical: `/cars/${vehicleSlug(vehicle.registration)}` },
    openGraph: { title, description, type: "website" },
  };
}

export default async function VehiclePage({ params }: PageProps) {
  const { registration } = await params;
  const { vehicle, reachable } = await loadVehicle(registration);

  // The CRM is down: we can't tell whether this car exists, so we mustn't
  // claim it's gone.
  if (!reachable) {
    return (
      <section className="pt-32 pb-24 sm:pt-40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <StockNotice
            title="We can't load this vehicle right now"
            body="Something went wrong reaching our stock system. Please try again in a moment, or message us and we'll confirm availability straight away."
            action={{ label: "Back to all cars", href: "/cars" }}
          />
        </div>
      </section>
    );
  }

  // Sold or unpublished — a car can go while someone has the page open.
  if (!vehicle) notFound();

  const reserved = vehicle.status === "reserved";
  const motExpiry = formatDate(vehicle.motExpiry);
  const serviceDue = formatDate(vehicle.serviceDue);

  const specs = [
    { icon: Calendar, label: "Year", value: String(vehicle.year) },
    { icon: Gauge, label: "Mileage", value: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: "Fuel", value: vehicle.fuelType },
    { icon: Gear, label: "Gearbox", value: vehicle.transmission },
    { icon: Car, label: "Colour", value: vehicle.color },
    { icon: Shield, label: "Registration", value: vehicle.registration },
    ...(motExpiry
      ? [{ icon: Shield, label: "MOT until", value: motExpiry }]
      : []),
    ...(serviceDue
      ? [{ icon: Shield, label: "Service due", value: serviceDue }]
      : []),
  ];

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,165,36,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <Link
          href="/cars"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-amber"
        >
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          All cars
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          {/* Vehicle */}
          <div>
            <Reveal>
              <div className="flex flex-wrap items-center gap-2">
                {reserved && (
                  <span className="rounded-full bg-surface-2 px-3 py-1 text-xs font-semibold tracking-wide text-amber ring-1 ring-amber/40">
                    Reserved
                  </span>
                )}
                {vehicle.isFeatured && (
                  <span className="rounded-full bg-amber px-3 py-1 text-xs font-semibold tracking-wide text-canvas">
                    Featured
                  </span>
                )}
                <span className="rounded-md border border-line bg-canvas/70 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                  {vehicle.registration}
                </span>
              </div>

              <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink">
                {vehicleTitle(vehicle)}
              </h1>

              <p className="mt-3 text-base text-muted">
                {vehicle.year} · {vehicle.color} · {formatMileage(vehicle.mileage)}
              </p>

              <p className="mt-6 font-display text-4xl font-bold text-gold sm:text-5xl">
                {formatPrice(vehicle.price)}
              </p>

              {reserved && (
                <p className="mt-4 max-w-lg rounded-xl border border-amber/25 bg-amber/5 px-4 py-3 text-sm leading-relaxed text-muted">
                  This car is currently reserved for another customer. Reservations
                  do fall through — send us an enquiry and we&apos;ll let you know
                  if it becomes available.
                </p>
              )}
            </Reveal>

            <Reveal delay={80}>
              <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft sm:grid-cols-3">
                {specs.map((spec) => (
                  <div key={spec.label} className="bg-canvas px-5 py-5">
                    <dt className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint">
                      <spec.icon className="h-3.5 w-3.5 text-amber/70" />
                      {spec.label}
                    </dt>
                    <dd className="mt-2 text-sm font-medium text-ink">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {vehicle.description && (
              <Reveal delay={140}>
                <div className="mt-12">
                  <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                    About this car
                  </h2>
                  <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted">
                    {vehicle.description}
                  </p>
                </div>
              </Reveal>
            )}

            <Reveal delay={200}>
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <Link
                  href={`/finance?vehicle=${vehicleSlug(vehicle.registration)}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
                >
                  Calculate finance
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <p className="text-xs text-faint">{financeDisclaimer}</p>
              </div>
            </Reveal>
          </div>

          {/* Enquiry */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal delay={120}>
              <EnquiryForm
                registration={vehicle.registration}
                vehicleHeadline={vehicleHeadline(vehicle)}
              />
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
