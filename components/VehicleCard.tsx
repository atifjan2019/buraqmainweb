import Link from "next/link";
import type { VehicleFinance } from "@/lib/codeweavers/types";
import {
  formatMileage,
  formatPrice,
  vehicleHref,
  vehicleTitle,
  type Vehicle,
} from "@/lib/vehicles";
import { ArrowRight } from "./Icons";
import CardFinanceTerms, { cardMonthlyPayment } from "./finance/CardFinance";
import VehiclePlaceholder from "./VehiclePlaceholder";

interface VehicleCardProps {
  vehicle: Vehicle;
  /**
   * The monthly payment for this car, already fetched.
   *
   * Passed in rather than fetched here on purpose: a card that fetched its own
   * quote would turn a twelve-card grid into twelve requests against a
   * rate-limited lender. The listings page collects every visible vehicle into
   * one batched call and hands each card its result.
   *
   * Null is ordinary — most of this forecourt fails PCP on age — and renders
   * no figure rather than a zero.
   */
  finance?: VehicleFinance | null;
  /**
   * Mark the card as live stock — a pulsing dot at the top-left of the
   * photograph. Set only by the Live Stock rail: on the grid pages every card
   * is current stock, so a dot on all of them would say nothing.
   */
  live?: boolean;
  /**
   * Set on the first card of the grid only. That card is the page's LCP
   * element, and lazy-loading an LCP image delays it measurably.
   */
  priority?: boolean;
}

/**
 * Stock card, built as DESIGN-bmw-m.md's `model-card`: canvas background with
 * no card surface at all — a 16:10 photograph on black, then the name, the
 * specs and a text link beneath it. The photograph is the card.
 *
 * That is the reason the translucent panel, the drop shadow and the lift-on-
 * hover are gone. This system has no shadows and no blur; a card is either a
 * flat step up from canvas or, as here, nothing but its own photograph. Hover
 * moves the image rather than the frame.
 *
 * The price moved out of the photograph and into the text block. Sitting it
 * over the image needed a gradient scrim to stay legible, and the doc rules
 * gradients out — with the price set below, the photo runs clean to its edges.
 *
 * Photography is served straight from the CRM's own URLs — never proxied or
 * re-hosted, so a photo swapped in the CRM appears here immediately rather than
 * being pinned to a stale cached copy. That rules out `next/image`, whose
 * default loader re-fetches and re-encodes through `/_next/image`.
 */
export default function VehicleCard({
  vehicle,
  priority,
  live,
  finance = null,
}: VehicleCardProps) {
  const title = vehicleTitle(vehicle);
  const monthly = cardMonthlyPayment(finance);
  const reserved = vehicle.status === "reserved";
  const photo = vehicle.featuredImage;

  // Anything the CRM hasn't recorded is dropped rather than rendered as an
  // empty chip — a blank cell reads as a broken card, and a car with no
  // recorded fuel type is an ordinary state while stock is being entered.
  const specs = [
    vehicle.year ? String(vehicle.year) : "",
    vehicle.mileage ? formatMileage(vehicle.mileage) : "",
    vehicle.transmission,
    vehicle.fuelType,
  ].filter((spec): spec is string => Boolean(spec?.trim()));

  return (
    <article className="group relative flex h-full flex-col">
      {/* Media — fixed 16:10 box so mixed-shape photos can't make the grid
          ragged, and so nothing reflows as images arrive. */}
      <div className="photo-frame relative aspect-16/10 overflow-hidden bg-surface-2">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element --
             next/image would proxy these through /_next/image; the CRM already
             serves correctly-sized, cached JPEGs. */
          <img
            src={photo.thumb}
            alt={photo.alt}
            width={400}
            height={250}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <VehiclePlaceholder make={vehicle.make} model={vehicle.model} />
        )}

        {/* Status chips. Solid fills rather than translucent ones: there is no
            scrim under them now, so each has to carry its own contrast.

            Three steps of loudness, all from the same type and box: Featured is
            solid ink because it is a claim, Reserved is ink-outlined because it
            is a caution, and the showroom is a hairline in muted text because it
            is only a fact. That ordering is what stops a third chip shouting
            over the first two.

            The row is width-capped because the showroom chip is pinned to the
            top-right of this same photograph; uncapped, a second claim chip
            would slide under it on a narrow card. */}
        <div className="absolute left-0 top-0 flex max-w-[calc(100%-8rem)] flex-wrap items-start">
          {/* The live marker leads the stack, so it reads as a state of the
              whole card rather than a property of whichever chip follows it.
              Solid core with a ring expanding behind it: the dot itself never
              moves, because a throbbing dot on twelve cards at once would be
              the loudest thing on the page. Reduced-motion gets the core. */}
          {live && (
            <span
              aria-hidden
              className="relative m-3 flex h-2 w-2 shrink-0"
              title="In stock now"
            >
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75 motion-reduce:hidden" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
            </span>
          )}

          {reserved && (
            <span className="border border-ink bg-canvas px-3 py-1.5 label-uppercase-sm text-ink">
              Reserved
            </span>
          )}
          {vehicle.isFeatured && (
            <span className="bg-ink px-3 py-1.5 label-uppercase-sm text-on-ink">
              Featured
            </span>
          )}
        </div>

        {/* Which showroom the car is at, opposite the claim chips.

            It sits on this side rather than in the left-hand stack because it
            is a different kind of statement: Featured and Reserved are claims
            about the car, the showroom is a fact about where it is. Splitting
            them across the photograph stops a fact reading as a third claim.
            (This corner previously held the registration plate, which came off
            the card — a plate is an administrative identifier, not something a
            buyer shops by, and it still appears in the spec table on the car's
            own page.)

            Rendered only when the CRM has allocated a branch — an empty chip
            reads as a rendering fault rather than a gap. */}
        {vehicle.branch && (
          <span className="absolute right-0 top-0 border border-line bg-canvas px-3 py-1.5 label-uppercase-sm text-muted">
            {vehicle.branch.name}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col pt-5">
        {/* The title IS the card's link, and its ::after is stretched over the
            whole article — so the photograph, the specs and the price are all
            clickable without any of them being a link of their own.

            One link rather than three. Making the image and the title separate
            anchors to the same page is the obvious way to do this and it puts
            two extra stops in the tab order and two duplicate entries in a
            screen reader's link list, for every card in a grid of twelve. */}
        <h3 className="title-lg break-words text-ink">
          <Link
            href={vehicleHref(vehicle)}
            className="after:absolute after:inset-0 after:content-[''] hover:text-muted"
          >
            {title}
          </Link>
        </h3>

        {/* Discrete chips rather than one tracked line. The line read as a
            sentence and buyers scan these four facts rather than read them —
            splitting them gives each its own edge to land on.

            Square, hairline, no fill. The reference this was modelled on uses
            rounded amber pills; this system has a 0px radius everywhere and no
            hue outside the tricolour, so the shape carries the grouping and the
            border carries the separation. Still no icons: four labelled icons
            under every photo is the decoration the doc backs away from. */}
        {specs.length > 0 && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {specs.map((spec) => (
              <li
                key={spec}
                className="border border-line-soft px-2.5 py-1 label-uppercase-sm text-muted"
              >
                {spec}
              </li>
            ))}
          </ul>
        )}

        <p className="display-sm mt-5 text-ink">{formatPrice(vehicle.price)}</p>

        {/* min-h-11 carries both to the 44px touch minimum. These are the
            primary actions on a grid most people meet on a phone. */}
        <div className="mt-auto flex items-stretch gap-3 border-t border-line-soft pt-5">
          {/* Reads as a button now, not a caption.

              As a tracked text link beside "Finance" the two carried the same
              visual weight, so the primary action looked like a footnote and
              the card looked like a picture. A bordered block that fills the
              row is unambiguous at a glance, which is the whole job here.

              Still NOT a link. The stretched overlay on the title already goes
              to this page; a second anchor to the same place would add a tab
              stop and a duplicate screen-reader entry on every card in the
              grid. aria-hidden for the same reason — the title has already
              announced the destination. Hover state is driven by the card's
              `group`, so it lights up wherever on the card the cursor is,
              which is honest: the whole card is the target. */}
          <span
            aria-hidden
            className="flex flex-1 items-center justify-center gap-2 border border-ink px-4 py-3
                       label-uppercase-sm text-ink transition-colors
                       group-hover:bg-ink group-hover:text-on-ink"
          >
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </span>

          {/* A different destination, so a real link — and z-10 to lift it out
              from under the card overlay, which would otherwise swallow it.

              The brand blue here is a DELIBERATE DIVERGENCE from
              DESIGN-bmw-m.md, which reserves the tricolour for identity and
              rules it out as an action surface. It is the dealership's own
              call: finance is the thing they want clicked, and the monthly
              figure is the reason someone clicks it.

              The payment is shown on the control that acts on it rather than
              floating above the card, so the number and the way to use it are
              one target. When no lender quotes, the label falls back to plain
              "Finance" and the button stays — the layout does not move. */}
          <Link
            href={`/finance?vehicle=${vehicle.slug}`}
            className="relative z-10 flex min-h-11 flex-col items-center justify-center
                       bg-m-blue px-4 py-2 text-center text-on-ink transition-opacity
                       hover:opacity-90"
          >
            {monthly ? (
              <>
                <span className="text-sm font-bold tabular-nums leading-none">
                  {monthly}
                </span>
                <span className="mt-1 label-uppercase-sm leading-none opacity-90">
                  per month
                </span>
              </>
            ) : (
              <span className="label-uppercase-sm">Finance</span>
            )}
          </Link>
        </div>

        {/* The APR that makes the figure on the button lawful. Rendered
            together with it, always. */}
        <CardFinanceTerms finance={finance} />
      </div>
    </article>
  );
}
