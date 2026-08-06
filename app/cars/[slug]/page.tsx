import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import {
  ArrowRight,
  Calendar,
  Car,
  Fuel,
  Gauge,
  Gear,
  Shield,
} from "@/components/Icons";
import Reveal from "@/components/Reveal";
import StockNotice from "@/components/StockNotice";
import VehicleDescription from "@/components/VehicleDescription";
import VehicleGallery from "@/components/VehicleGallery";
import { CrmError, getVehicle } from "@/lib/crm";
import { financeDisclaimer, site } from "@/lib/site";
import {
  formatDate,
  formatMileage,
  formatPrice,
  vehicleHeadline,
  vehicleTitle,
  type Vehicle,
} from "@/lib/vehicles";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Forwards the route param to the API untouched — it accepts the canonical
 * slug, a bare plate, or a stale slug from before a model name was corrected,
 * and only the trailing plate selects the car. Parsing it here would just be a
 * second, drifting implementation of the CRM's rule.
 *
 * Both this and `generateMetadata` call it with the same argument, and
 * identical fetches are memoised within a render, so it costs one request.
 */
async function loadVehicle(slug: string) {
  try {
    return { vehicle: await getVehicle(slug), reachable: true };
  } catch (error) {
    if (error instanceof CrmError) {
      console.error(`[cars] could not load ${slug}`, error);
      return { vehicle: null, reachable: false };
    }
    throw error;
  }
}

/** ~155 characters of the CRM description, cut on a word boundary. */
function metaDescription(vehicle: Vehicle): string {
  const source = vehicle.description?.replace(/\s+/g, " ").trim();

  if (!source) {
    // Same rule as the page body: an unrecorded field is dropped rather than
    // interpolated, so a missing colour can't ship "… in , 55,043 miles" to
    // Google as the snippet for this car.
    const facts = [
      vehicle.color,
      vehicle.mileage ? formatMileage(vehicle.mileage) : "",
      vehicle.fuelType,
      vehicle.transmission,
    ].filter((fact) => fact?.trim());

    return (
      `${vehicleHeadline(vehicle)}${facts.length ? ` in ${facts.join(", ")}` : ""}. ` +
      `Available now at ${site.name} in Manchester.`
    );
  }

  if (source.length <= 155) return source;

  const clipped = source.slice(0, 155);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { vehicle } = await loadVehicle(slug);

  if (!vehicle) {
    return { title: "Vehicle no longer available", robots: { index: false } };
  }

  const title = `${vehicle.year} ${vehicleTitle(vehicle)} for sale in Manchester`;
  const description = metaDescription(vehicle);

  return {
    title,
    description,
    // Always the canonical slug, never the URL that was requested — this is
    // what stops one car being indexed under several addresses.
    alternates: { canonical: `/cars/${vehicle.slug}` },
    openGraph: {
      title: `${title} | ${site.name}`,
      description,
      url: `/cars/${vehicle.slug}`,
      type: "website",
    },
  };
}

export default async function VehiclePage({ params }: PageProps) {
  const { slug } = await params;
  const { vehicle, reachable } = await loadVehicle(slug);

  // The CRM is down: we can't tell whether this car exists, so we mustn't
  // claim it's gone — and mustn't redirect anywhere either.
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

  // Arrived on a bare plate or a stale slug: send humans and crawlers to the
  // one canonical address. 308 rather than `redirect`'s 307, so the move reads
  // as permanent and link equity consolidates. Deliberately outside the
  // try/catch above, since this throws to unwind rendering.
  if (slug !== vehicle.slug) permanentRedirect(`/cars/${vehicle.slug}`);

  const reserved = vehicle.status === "reserved";
  const motExpiry = formatDate(vehicle.motExpiry);
  const serviceDue = formatDate(vehicle.serviceDue);

  /*
   * A spec tile with a label and no value tells the visitor nothing and reads
   * as a fault in the page. The CRM leaves fields blank as a matter of course —
   * MOT and service dates are unset on the entire forecourt, and a car can
   * reach the site before someone has recorded its colour — so every tile is
   * filtered on having something to show rather than each one carrying its own
   * guard. Year and mileage are checked as numbers: `0` is missing data here,
   * not a fact about the car, and would otherwise print "0 miles".
   */
  const specs = [
    { icon: Calendar, label: "Year", value: vehicle.year ? String(vehicle.year) : "" },
    {
      icon: Gauge,
      label: "Mileage",
      value: vehicle.mileage ? formatMileage(vehicle.mileage) : "",
    },
    { icon: Fuel, label: "Fuel", value: vehicle.fuelType },
    { icon: Gear, label: "Gearbox", value: vehicle.transmission },
    { icon: Car, label: "Colour", value: vehicle.color },
    { icon: Shield, label: "Registration", value: vehicle.registration },
    { icon: Shield, label: "MOT until", value: motExpiry },
    { icon: Shield, label: "Service due", value: serviceDue },
  ].filter((spec) => spec.value?.trim());

  const mainImage = vehicle.images[0] ?? vehicle.featuredImage;

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Starts the LCP image downloading before the gallery markup is parsed.
          React hoists this into <head>. */}
      {mainImage && (
        <link rel="preload" as="image" href={mainImage.display} fetchPriority="high" />
      )}

      <script
        type="application/ld+json"
        // Built server-side from CRM fields only. Note there is no purchase,
        // prep or margin figure anywhere in this payload — `price` is the only
        // money the public site is allowed to know.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(vehicleJsonLd(vehicle)),
        }}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          // --color-glow, not --color-amber: this wash carries no text, so it
          // has no contrast requirement and keeps the brand's vivid amber on
          // both themes. The light palette's darkened amber would settle into
          // a muddy tan here rather than the warm lift this is meant to be.
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 12%, transparent) 0%, transparent 65%)",
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
                  <span className="rounded-full bg-amber px-3 py-1 text-xs font-semibold tracking-wide text-on-amber">
                    Featured
                  </span>
                )}
                {/* Still the plate: the human-facing identifier, just not the URL. */}
                <span className="rounded-md border border-line bg-canvas/70 px-2.5 py-1 font-mono text-xs font-semibold uppercase tracking-widest text-muted">
                  {vehicle.registration}
                </span>
              </div>

              <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink">
                {vehicleTitle(vehicle)}
              </h1>

              <div className="mt-7">
                <VehicleGallery
                  images={vehicle.images}
                  make={vehicle.make}
                  model={vehicle.model}
                />
              </div>

              {/* Joined rather than interpolated with literal separators: a
                  car with no colour recorded would otherwise render a stranded
                  "2020 ·  · 55,043 miles". */}
              <p className="mt-3 text-base text-muted">
                {[
                  vehicle.year ? String(vehicle.year) : "",
                  vehicle.color,
                  vehicle.mileage ? formatMileage(vehicle.mileage) : "",
                ]
                  .filter((part) => part?.trim())
                  .join(" · ")}
              </p>

              <p className="mt-6 font-display text-4xl font-bold text-gold sm:text-5xl">
                {formatPrice(vehicle.price)}
              </p>

              {reserved && (
                <p className="mt-4 max-w-lg rounded-xl border border-amber/25 bg-amber/5 px-4 py-3 text-sm leading-relaxed text-muted">
                  This car is currently reserved for another customer.
                  Reservations do fall through — send us an enquiry and
                  we&apos;ll let you know if it becomes available.
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
                <VehicleDescription description={vehicle.description} />
              </Reveal>
            )}

            <Reveal delay={200}>
              <div className="mt-12 flex flex-wrap items-center gap-3">
                <Link
                  href={`/finance?vehicle=${vehicle.slug}`}
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
              {/* Registration, not slug — it's what the sales team recognises
                  on an incoming lead. */}
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

/**
 * schema.org `Car` — a subtype of both Vehicle and Product — with an Offer, so
 * the listing is eligible for rich results.
 */
function vehicleJsonLd(vehicle: Vehicle) {
  const url = `${site.url}/cars/${vehicle.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "Car",
    name: vehicleHeadline(vehicle),
    url,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    color: vehicle.color,
    fuelType: vehicle.fuelType,
    vehicleTransmission: vehicle.transmission,
    // Google's vehicle listing results want at least one image and prefer
    // several. Full-resolution URLs, omitted entirely when unphotographed
    // rather than emitted as an empty array.
    ...(vehicle.images.length > 0
      ? { image: vehicle.images.map((image) => image.full) }
      : {}),
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI", // UN/CEFACT code for the statute mile
    },
    ...(vehicle.description ? { description: vehicle.description } : {}),
    offers: {
      "@type": "Offer",
      url,
      price: vehicle.price,
      priceCurrency: "GBP",
      availability:
        vehicle.status === "reserved"
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
      itemCondition: "https://schema.org/UsedCondition",
      seller: { "@type": "AutoDealer", name: site.name },
    },
  };
}
