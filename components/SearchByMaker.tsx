import Link from "next/link";
import { getStockFilters, getVehicles } from "@/lib/crm";
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
 * No manufacturer logos. Two reasons, and the second is the real one: those
 * marks are registered trademarks we would be re-hosting, and this design
 * system has no place to put them — DESIGN-bmw-m.md builds hierarchy from
 * weight and scale, with photography carrying the visual load and no
 * decorative iconography anywhere. A wall of chrome badges would be the most
 * ornamental thing on the site. The marque set in display weight, with its
 * stock count beside it, is both on-system and more useful: it tells you
 * whether it is worth clicking.
 */
export default async function SearchByMaker() {
  let makes: string[];
  try {
    const filters = await getStockFilters();
    makes = filters.makes;
  } catch {
    return null;
  }

  if (makes.length === 0) return null;

  // One count per marque. These are small, cached (120s) reads against an
  // endpoint that rate-limits at 120/min, and this runs on the server at
  // revalidation — not per visitor — so the fan-out is bounded by the number
  // of marques in stock, not by traffic.
  const counts = await Promise.all(
    makes.map(async (make) => {
      try {
        const { meta } = await getVehicles({ make, perPage: 1 });
        return { make, count: meta.total };
      } catch {
        // A marque whose count failed still deserves its link — the count is
        // an enhancement, not the point of the tile.
        return { make, count: null as number | null };
      }
    }),
  );

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
            ordering is the CRM's alphabetical list, not a ranking. */}
        <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
          {counts.map(({ make, count }, i) => (
            <Reveal key={make} delay={(i % 6) * 60}>
              {/*
                The 1px grid: tiles sit on a --color-line ground with a gap-px
                gutter, so every divider is a true hairline and the block reads
                as one ruled table rather than as loose cards. This system has
                no shadows to separate surfaces, so the hairline does that work.
              */}
              <Link
                href={`/cars?make=${encodeURIComponent(make)}`}
                className="group flex h-full flex-col justify-between gap-6 bg-canvas p-6
                           transition-colors duration-200 hover:bg-ink
                           focus-visible:bg-ink focus-visible:outline-none sm:p-7"
              >
                <span className="display-sm text-ink transition-colors group-hover:text-on-ink group-focus-visible:text-on-ink">
                  {make}
                </span>

                <span className="text-xs font-light uppercase tracking-[0.18em] text-faint transition-colors group-hover:text-on-ink/70 group-focus-visible:text-on-ink/70">
                  {count === null
                    ? "In stock"
                    : `${count} ${count === 1 ? "car" : "cars"}`}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
