import Link from "next/link";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import StockNotice from "@/components/StockNotice";
import VehicleCard from "@/components/VehicleCard";
import { ArrowRight, Phone, WhatsApp } from "@/components/Icons";
import { getFeaturedVehicles } from "@/lib/crm";
import { contact, financeDisclaimer, whatsappLink } from "@/lib/site";

/**
 * Root 404.
 *
 * A dealership's 404 has one job: return someone who followed a dead link to a
 * car they might buy. So this is a forecourt, not an apology — real stock, real
 * ways to narrow it, and a human within one tap.
 *
 * Sold cars do NOT land here. `app/cars/[slug]/not-found.tsx` handles those,
 * because "this car went" and "this page never existed" are different events
 * and deserve different copy.
 */

/**
 * Price is the only axis that meaningfully splits this forecourt — it is 91%
 * Toyota, 86% hybrid and 96% automatic, so a make or fuel filter would remove
 * almost nothing. These three bands are cut against live stock so none of them
 * can land the visitor on an empty list.
 */
const BUDGETS = [
  { label: "Under £11,000", href: "/cars?max_price=11000" },
  { label: "£11,000 – £14,000", href: "/cars?min_price=11000&max_price=14000" },
  { label: "£14,000 and up", href: "/cars?min_price=14000" },
];

/** Above this, a car stops representing the forecourt. See below. */
const TYPICAL_CEILING = 20000;

export default async function NotFound() {
  const wa = whatsappLink(
    "Hi Burraq Motors, I hit a broken link on your site — can you help me find a car?",
  );

  /*
   * Already degrades to [] on a CRM outage, so there is no failure path here.
   *
   * The featured list is filtered before it is shown: three of the six featured
   * cars are the £74,999 Land Cruiser, the £38,750 Prado and a £24,800 Prius,
   * and leading with those on a forecourt whose median is £12,700 tells a lost
   * visitor the wrong thing about what this dealership sells. The unfiltered
   * list is the fallback so the band never empties just because stock moved
   * upmarket.
   */
  const featured = await getFeaturedVehicles(6);
  const typical = featured.filter((car) => car.price <= TYPICAL_CEILING);
  const cars = (typical.length >= 3 ? typical : featured).slice(0, 3);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-canvas pt-32 pb-20">
        <div className="relative mx-auto max-w-[90rem] px-5 sm:px-8">
          <div className="relative mx-auto max-w-2xl text-center">
            {/* The numeral is a watermark, not content. It is announced by
                nothing — the eyebrow and heading already say what happened,
                and "four zero four" read aloud is noise. It is deliberately
                still: an animated 404 is exactly the joke this page must not
                make while someone is trying to find a car. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-1/2 -z-10 -translate-x-1/2 select-none text-[clamp(9rem,34vw,17rem)] font-bold leading-none tracking-[-0.5px] text-(--ghost-numeral)"
            >
              404
            </span>

            {/*
              Nothing in this hero is wrapped in Reveal, and that is deliberate.
              `data-js` is stamped on <html> before first paint and globals.css
              hides every [data-reveal] until an IntersectionObserver runs after
              hydration. On the one page people reach when a link or a deploy
              has broken, every route out must be readable with no JavaScript at
              all. Do not "tidy this up" by wrapping it.
            */}
            <span className="eyebrow eyebrow-center justify-center">
              Page not found
            </span>

            <h1 className="display-lg mt-8 text-ink">
              That page has gone. The forecourt hasn&apos;t.
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base font-light leading-relaxed text-muted">
              The link you followed is broken or the page has moved. Everything
              we have in stock is still a tap away — pick a budget below, or
              tell us what you&apos;re after and we&apos;ll go and find it.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cars" className="btn btn-solid">
                Browse all cars
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>

              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <WhatsApp aria-hidden className="h-5 w-5" />
                  WhatsApp us
                </a>
              ) : (
                contact.phone && (
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="btn btn-outline"
                  >
                    <Phone aria-hidden className="h-5 w-5" />
                    {contact.phone}
                  </a>
                )
              )}
            </div>

            <nav aria-labelledby="budget-rail" className="mt-12">
              <p id="budget-rail" className="label-uppercase text-faint">
                Or jump straight to a budget
              </p>
              <ul className="mt-5 flex flex-wrap justify-center gap-3">
                {BUDGETS.map((budget) => (
                  <li key={budget.href}>
                    <Link href={budget.href} className="btn btn-quiet px-6">
                      {budget.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </section>

      {/* Real stock. Dropped whole if the CRM is unreachable — the notice below
          is the page's only apology, and two of them reads as a double fault. */}
      {cars.length > 0 && (
        <section className="bg-canvas pb-24">
          <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
            <SectionHeading
              eyebrow="Still Available"
              title="Straight from"
              accent="the forecourt"
            />

            <ul className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, index) => (
                <Reveal key={car.slug} as="li" delay={(index % 3) * 90}>
                  <VehicleCard vehicle={car} />
                </Reveal>
              ))}
            </ul>

            <div className="mt-12 flex justify-center">
              <Link href="/cars" className="btn btn-outline">
                View all cars
                <ArrowRight aria-hidden className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* The answer for someone who followed a dead link chasing one specific
          car: the CRM has no model filter, but the dealership sources to order. */}
      <section className="bg-canvas pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <StockNotice
            title="Not seeing what you came for?"
            body="We buy to order from Japanese auctions, so the car you were looking at may be one we can source. Tell us the model, the budget and the mileage you want and we'll go and find it."
            action={{ label: "Tell us what you need", href: "/contact" }}
          />

          <p className="label-uppercase mt-12 text-center text-faint">
            Showroom open {contact.openingHours}
          </p>

          <p className="caption mx-auto mt-5 max-w-2xl text-center leading-relaxed text-faint">
            {financeDisclaimer}
          </p>

          <div className="mt-10 flex justify-center">
            <Link href="/" className="link-m">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
