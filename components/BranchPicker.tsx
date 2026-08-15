import Link from "next/link";
import { getStockFilters } from "@/lib/crm";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Browse by showroom — a shortcut into /cars?branch=X.
 *
 * The branches come from the CRM's own filters endpoint, which only offers a
 * showroom that is active *and* has published stock behind it. So this grid can
 * never send a visitor to an empty forecourt, and a new site appears the moment
 * its first car is published — which is the whole reason not to hard-code the
 * dealership's addresses here.
 *
 * No map, no pin, no photograph of a building. Same reasoning `SearchByMaker`
 * states for manufacturer logos: DESIGN-bmw-m.md builds hierarchy from weight
 * and scale with no decorative iconography, and the showroom name set in
 * display weight — with its city and stock count beside it — already tells you
 * whether the tile is worth clicking.
 */
export default async function BranchPicker() {
  let branches;
  try {
    const filters = await getStockFilters();
    branches = filters.branches;
  } catch {
    // Same contract as SearchByMaker and LiveStock: a CRM outage costs the
    // homepage one section, never the whole page.
    return null;
  }

  if (branches.length === 0) return null;

  return (
    <section className="bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Where We Are"
          title="Our"
          accent={branches.length === 1 ? "Showroom" : "Showrooms"}
          body="Every car is at one of our sites. Pick one to see exactly what's on that forecourt."
        />

        {/* Three across rather than SearchByMaker's six: each tile carries a
            city line as well as a count, so it needs the width. The 1px grid is
            the same — tiles on a --color-line ground with a gap-px gutter, so
            every divider is a true hairline and the block reads as one ruled
            table rather than as loose cards. */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch, i) => (
            <Reveal key={branch.slug} delay={(i % 3) * 60}>
              <Link
                href={`/cars?branch=${encodeURIComponent(branch.slug)}`}
                className="group flex h-full flex-col justify-between gap-6 bg-canvas p-6
                           transition-colors duration-200 hover:bg-ink
                           focus-visible:bg-ink focus-visible:outline-none sm:p-7"
              >
                <span className="display-sm text-ink transition-colors group-hover:text-on-ink group-focus-visible:text-on-ink">
                  {branch.name}
                </span>

                {/* The city is dropped when it only repeats the branch name —
                    "Manchester · Manchester" reads as a bug. */}
                <span className="text-xs font-light uppercase tracking-[0.18em] text-faint transition-colors group-hover:text-on-ink/70 group-focus-visible:text-on-ink/70">
                  {branch.city && branch.city !== branch.name
                    ? `${branch.city} · `
                    : ""}
                  {branch.count} {branch.count === 1 ? "car" : "cars"}
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
