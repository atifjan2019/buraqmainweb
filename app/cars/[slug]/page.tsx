import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import EnquiryForm from "@/components/EnquiryForm";
import { ArrowRight } from "@/components/Icons";
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
      <section className="bg-canvas pt-32 pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
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
    { label: "Year", value: vehicle.year ? String(vehicle.year) : "" },
    {
      label: "Mileage",
      value: vehicle.mileage ? formatMileage(vehicle.mileage) : "",
    },
    { label: "Fuel", value: vehicle.fuelType },
    { label: "Gearbox", value: vehicle.transmission },
    { label: "Colour", value: vehicle.color },
    { label: "Registration", value: vehicle.registration },
    { label: "MOT until", value: motExpiry },
    { label: "Service due", value: serviceDue },
  ].filter((spec) => spec.value?.trim());

  const mainImage = vehicle.images[0] ?? vehicle.featuredImage;

  return (
    <section className="bg-canvas pt-32 pb-24">
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

      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <Link href="/cars" className="link-m">
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          All cars
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          {/* Vehicle */}
          <div>
            <Reveal>
              {/* Square chips in ink and hairline — the system has no pill
                  shape and no accent hue to tint a status with. */}
              <div className="flex flex-wrap items-center gap-2">
                {reserved && (
                  <span className="border border-ink px-3 py-1.5 label-uppercase-sm text-ink">
                    Reserved
                  </span>
                )}
                {vehicle.isFeatured && (
                  <span className="bg-ink px-3 py-1.5 label-uppercase-sm text-on-ink">
                    Featured
                  </span>
                )}
                {/* Still the plate: the human-facing identifier, just not the URL. */}
                <span className="border border-line px-3 py-1.5 label-uppercase-sm font-mono text-muted">
                  {vehicle.registration}
                </span>
              </div>

              <h1 className="display-md mt-6 text-ink">
                {vehicleTitle(vehicle)}
              </h1>

              <div className="mt-8">
                <VehicleGallery
                  images={vehicle.images}
                  make={vehicle.make}
                  model={vehicle.model}
                />
              </div>

              {/* Joined rather than interpolated with literal separators: a
                  car with no colour recorded would otherwise render a stranded
                  "2020 ·  · 55,043 miles". */}
              <p className="mt-4 text-base font-light text-muted">
                {[
                  vehicle.year ? String(vehicle.year) : "",
                  vehicle.color,
                  vehicle.mileage ? formatMileage(vehicle.mileage) : "",
                ]
                  .filter((part) => part?.trim())
                  .join(" · ")}
              </p>

              <p className="display-md mt-6 text-ink">
                {formatPrice(vehicle.price)}
              </p>

              {reserved && (
                <p className="mt-6 max-w-lg border border-line px-5 py-4 text-sm font-light leading-relaxed text-muted">
                  This car is currently reserved for another customer.
                  Reservations do fall through — send us an enquiry and
                  we&apos;ll let you know if it becomes available.
                </p>
              )}
            </Reveal>

            <Reveal delay={80}>
              {/*
                `spec-cell` from the design doc: the value on top at display
                weight and the machined label beneath it — the reverse of the
                usual label-then-value tile, and the reason a table of these
                scans as an instrument panel. The icons that used to sit beside
                each label are gone; the doc keeps chrome off these entirely.

                4-up at desktop, 2-up at tablet, 1-up on a phone, with the
                value staying at display-sm regardless of column count.
              */}
              <dl className="mt-12 grid grid-cols-1 gap-px border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="spec-cell px-6 py-6">
                    <dt className="title-lg text-ink">{spec.value}</dt>
                    <dd className="label-uppercase-sm mt-3 text-faint">
                      {spec.label}
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
              <div className="mt-16 flex flex-wrap items-center gap-6">
                <Link
                  href={`/finance?vehicle=${vehicle.slug}`}
                  className="btn btn-outline"
                >
                  Calculate finance
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <p className="caption max-w-sm text-faint">
                  {financeDisclaimer}
                </p>
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
