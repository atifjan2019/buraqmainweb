import Link from "next/link";
import { getStockFilters } from "@/lib/crm";
import type { MakerOption } from "@/lib/vehicles";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Browse by manufacturer — a shortcut into /cars?make=X.
 *
 * The makes come from the CRM's own filters endpoint, which derives them from
 * live stock. So this grid can never offer a marque with nothing behind it,
 * and a new make appears the moment the first car of it is published. That is
 * the whole reason not to hard-code a list of manufacturers here.
 *
 * Manufacturer logos are supplied by the dealership through the CRM's Makers
 * page and served from the CRM's own storage. An earlier revision of this file
 * argued against logos here: that they are trademarks we would be re-hosting,
 * and that DESIGN-bmw-m.md builds hierarchy from weight and scale with no
 * decorative iconography. The first point is the dealership's call to make and
 * it has made it — these are the marques it is an authorised retailer of. The
 * second still binds the *rendering*: the marks sit flat on canvas with no
 * shadow, no gradient, no plate and no hue outside their own artwork, in a
 * fixed optical box (`.maker-logo` in globals.css) so a wide wordmark and a
 * round badge carry the same weight.
 *
 * A marque with no logo yet renders its name in display weight — the tile this
 * section shipped with. The section is therefore complete on day one and
 * improves as artwork arrives, with no state in between where a tile is blank.
 */
export default async function SearchByMaker() {
  let makers: MakerOption[];
  try {
    const filters = await getStockFilters();

    // `makers` carries the logos and the counts in the one request. `makes` is
    // the fallback for a CRM that predates the Makers page: same marques, same
    // links, no artwork and no count — never an empty section.
    makers =
      filters.makers.length > 0
        ? filters.makers
        : filters.makes.map((name) => ({
            name,
            slug: name,
            displayName: name,
            logoUrl: null,
            logoDarkUrl: null,
            count: 0,
          }));
  } catch {
    // A CRM outage costs the homepage one section, never the whole page.
    return null;
  }

  if (makers.length === 0) return null;

  return (
    <section className="bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Browse The Range"
          title="Search By"
          accent="Maker"
          body="Jump straight to the marque you came for. Every badge here has cars behind it right now."
        />

        {/* 2-up on phones through 6-up on desktop. The tiles are square-ish
            and equal-weight: no marque is promoted over another, because the
            ordering is the CRM's own, not a ranking. */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {makers.map((maker, i) => (
            <Reveal key={maker.name} delay={(i % 6) * 60}>
              {/*
                The 1px grid: tiles sit on a --color-line ground with a gap-px
                gutter, so every divider is a true hairline and the block reads
                as one ruled table rather than as loose cards. This system has
                no shadows to separate surfaces, so the hairline does that work.

                Hover is a one-step flat lift to surface-2 rather than the ink
                flood the name-only tiles used to get. An image cannot invert
                with its ground: a dark mark would vanish on a black hover fill
                in the light theme, and a light one on the white fill in the
                dark theme. surface-2 is a tokenised flat step — no shadow, no
                gradient, no hue — and it gives logo tiles and name tiles the
                same hover.
              */}
              <Link
                href={`/cars?make=${encodeURIComponent(maker.name)}`}
                className="group flex h-full flex-col justify-between gap-6 bg-canvas p-6
                           transition-colors duration-200 hover:bg-surface-2
                           focus-visible:bg-surface-2 focus-visible:outline-none sm:p-7"
              >
                {maker.logoUrl ? (
                  /* Fixed-height optical box, left-aligned so every mark shares
                     an edge with the count beneath it and the grid still reads
                     as a ruled table. The height never depends on the artwork,
                     so nothing reflows as the logos load. */
                  <span className="flex h-14 w-full items-center justify-start sm:h-16">
                    {/* eslint-disable-next-line @next/next/no-img-element --
                        served straight from the CRM, the same call VehicleCard
                        documents: next/image would proxy through /_next/image
                        and pin a logo swapped in the CRM to a stale copy.

                        alt is the marque, never "" — if the CRM is unreachable
                        or a file 404s the browser prints the name, which is
                        precisely the fallback tile. */}
                    <img
                      src={maker.logoUrl}
                      alt={maker.displayName}
                      loading="lazy"
                      decoding="async"
                      className={`maker-logo${
                        maker.logoDarkUrl ? " maker-logo--light" : ""
                      }`}
                    />

                    {/* Both grounds ship in the DOM and CSS picks one — the
                        idiom .theme-icon-sun/.theme-icon-moon already uses, and
                        for the same reason: the theme lives in localStorage and
                        is only known in the browser, so choosing here would
                        hand every visitor on the non-default theme a hydration
                        mismatch and a visible swap. */}
                    {maker.logoDarkUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element -- see above */
                      <img
                        src={maker.logoDarkUrl}
                        alt={maker.displayName}
                        loading="lazy"
                        decoding="async"
                        className="maker-logo maker-logo--dark"
                      />
                    )}
                  </span>
                ) : (
                  <span className="display-sm text-ink">
                    {maker.displayName}
                  </span>
                )}

                <span className="text-xs font-light uppercase tracking-[0.18em] text-faint transition-colors group-hover:text-ink group-focus-visible:text-ink">
                  {maker.count > 0
                    ? `${maker.count} ${maker.count === 1 ? "car" : "cars"}`
                    : "In stock"}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
