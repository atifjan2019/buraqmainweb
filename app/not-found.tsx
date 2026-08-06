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
      <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        {/* Ambient warmth, mixed off --color-glow rather than --color-amber:
            it carries no text, so it has no contrast requirement and keeps the
            brand's vivid amber on both themes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 12%, transparent) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden
          className="grain-overlay pointer-events-none absolute inset-0 -z-10"
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="relative mx-auto max-w-2xl text-center">
            {/* The numeral is a watermark, not content. It is announced by
                nothing — the eyebrow and heading already say what happened,
                and "four zero four" read aloud is noise. It is deliberately
                still: an animated 404 is exactly the joke this page must not
                make while someone is trying to find a car. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -top-8 left-1/2 -z-10 -translate-x-1/2 select-none font-display text-[clamp(9rem,34vw,17rem)] font-bold leading-none tracking-tighter text-(--ghost-numeral)"
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
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber">
              <span aria-hidden className="h-px w-6 bg-amber/50" />
              PAGE NOT FOUND
              <span aria-hidden className="h-px w-6 bg-amber/50" />
            </span>

            <h1 className="mt-6 font-display text-[clamp(2.1rem,5.6vw,3.6rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
              That page has gone.{" "}
              <span className="text-gold">The forecourt hasn&apos;t.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted">
              The link you followed is broken or the page has moved. Everything
              we have in stock is still a tap away — pick a budget below, or
              tell us what you&apos;re after and we&apos;ll go and find it.
            </p>

            <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/cars"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow)"
              >
                Browse all cars
                <ArrowRight
                  aria-hidden
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                />
              </Link>

              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
                >
                  <WhatsApp aria-hidden className="h-5 w-5" />
                  WhatsApp us
                </a>
              ) : (
                contact.phone && (
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
                  >
                    <Phone aria-hidden className="h-5 w-5" />
                    {contact.phone}
                  </a>
                )
              )}
            </div>

            <nav aria-labelledby="budget-rail" className="mt-10">
              <p id="budget-rail" className="text-sm text-muted">
                Or jump straight to a budget
              </p>
              <ul className="mt-4 flex flex-wrap justify-center gap-2.5">
                {BUDGETS.map((budget) => (
                  <li key={budget.href}>
                    <Link
                      href={budget.href}
                      className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface-2 px-5 text-sm font-medium text-ink transition-colors hover:border-amber/40 hover:text-amber"
                    >
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
        <section className="pb-16 sm:pb-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <SectionHeading
              eyebrow="STILL AVAILABLE"
              title="Straight from"
              accent="the forecourt"
            />

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {cars.map((car, index) => (
                <Reveal key={car.slug} as="li" delay={(index % 3) * 90}>
                  <VehicleCard vehicle={car} />
                </Reveal>
              ))}
            </ul>

            <div className="mt-10 text-center">
              <Link
                href="/cars"
                className="group inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-amber transition-colors hover:text-amber-bright"
              >
                View all cars
                <ArrowRight
                  aria-hidden
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* The answer for someone who followed a dead link chasing one specific
          car: the CRM has no model filter, but the dealership sources to order. */}
      <section className="pb-24 sm:pb-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <StockNotice
            title="Not seeing what you came for?"
            body="We buy to order from Japanese auctions, so the car you were looking at may be one we can source. Tell us the model, the budget and the mileage you want and we'll go and find it."
            action={{ label: "Tell us what you need", href: "/contact" }}
          />

          <p className="mt-10 text-center text-sm text-muted">
            Showroom open {contact.openingHours}
          </p>

          <p className="mt-4 text-center text-xs leading-relaxed text-muted">
            {financeDisclaimer}
          </p>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center text-sm font-medium text-muted transition-colors hover:text-amber"
            >
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
