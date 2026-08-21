import Link from "next/link";
import { getVehicles } from "@/lib/crm";
import { selectLiveStock } from "@/lib/live-stock";
import { ArrowRight } from "./Icons";
import CardRail from "./CardRail";
import Reveal from "./Reveal";
import VehicleCard from "./VehicleCard";

/**
 * The forecourt as it stands right now, in a horizontal rail.
 *
 * This is deliberately a different promise from `FeaturedVehicles` above it.
 * That section is an edit — six cars staff chose to lead with. This one is the
 * whole floor, unedited, in whatever order `selectLiveStock` decides. The two
 * sections answer different questions: "what do you recommend?" and "what have
 * you actually got?".
 *
 * A rail rather than a grid for the same reason: a grid reads as a curated
 * set with a boundary, a rail reads as a shelf that continues past the edge of
 * the screen — which is the honest shape for live inventory.
 *
 * On "live": stock reads revalidate every 120s (READ_REVALIDATE_SECONDS), so
 * the dot means "synced from the showroom system", not a websocket. The label
 * underneath says so in words rather than letting the dot overclaim.
 */
export default async function LiveStock() {
  let vehicles;
  try {
    // 50 is the CRM's per-page ceiling; selectLiveStock trims from there, so
    // the ordering decision sees the whole floor rather than an arbitrary
    // first page of it.
    const page = await getVehicles({ perPage: 50 });
    vehicles = selectLiveStock(page.vehicles);
  } catch {
    // Same contract as getFeaturedVehicles: a CRM outage costs the homepage
    // one section, never the whole page.
    return null;
  }

  if (vehicles.length === 0) return null;

  return (
    <section className="bg-canvas-deep py-24">
      {/* Everything sits inside the site's standard container. The rail used to
          run full-bleed so cards bled off the screen edge; that broke the
          page's left margin, which every other band holds to. The partially
          visible next card does the "there is more" job on its own. */}
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <span className="eyebrow">
                <LivePulse />
                Live Stock
              </span>

              <h2 className="display-lg mt-6 text-ink">On The Forecourt</h2>

              <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted">
                Every car currently with us in Manchester, synced from our
                showroom system. When one sells, it leaves this list.
              </p>
            </div>

            <Link href="/cars" className="btn btn-outline shrink-0">
              View All Cars
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>

        {/*
          Cards are a fraction of the container rather than a fixed rem width,
          so the rail always lands on a whole number of cards at every
          breakpoint and never leaves a stranded sliver. The fourth card is
          deliberately part-visible at desktop — that overflow is what tells
          you the shelf continues.
        */}
        <CardRail noun="vehicles" autoScroll>
          {/*
            The stock is rendered TWICE, and that is what makes the loop work:
            the rail drifts left, and once the first copy has passed it jumps
            back by exactly one copy's width. The jump lands on an identical
            frame, so there is no seam to see — no clone, no transform, no
            measurement of individual cards.

            The second copy is aria-hidden and its links are taken out of the
            tab order. It is the same twelve cars again, and a screen reader
            announcing every car twice — or a keyboard user tabbing through
            twenty-four links to leave the section — would be paying for a
            visual trick they get nothing from.
          */}
          {[0, 1].flatMap((copy) =>
            vehicles.map((vehicle, i) => (
              <div
                key={`${copy}-${vehicle.slug}`}
                className="w-[80%] shrink-0 snap-start sm:w-[45%] lg:w-[31%] xl:w-[23.5%]"
                {...(copy === 1 ? { "aria-hidden": true, inert: true } : {})}
              >
                <VehicleCard
                  vehicle={vehicle}
                  priority={copy === 0 && i === 0}
                  live
                />
              </div>
            )),
          )}
        </CardRail>
      </div>
    </section>
  );
}

/**
 * The live indicator.
 *
 * Green is legitimate here despite the doc forbidding hues outside the
 * tricolour: --color-success is a SEMANTIC token, not a brand one. The rule
 * exists so no second brand colour competes with the tricolour, and a status
 * light is not a brand moment. It is also the one colour a visitor already
 * reads as "on" without a caption.
 *
 * The pulse is a ring that expands and fades from behind a solid core, so the
 * dot itself never moves — motion in this system is restrained, and a dot that
 * throbs would pull focus from the headline it sits beside. Anyone with
 * prefers-reduced-motion set gets the solid dot and no ring.
 */
function LivePulse() {
  return (
    <span aria-hidden className="relative mr-2.5 flex h-2 w-2">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full
                   bg-success opacity-75 motion-reduce:hidden"
      />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
    </span>
  );
}
