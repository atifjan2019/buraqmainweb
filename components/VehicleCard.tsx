import Link from "next/link";
import {
  formatMileage,
  formatPrice,
  vehicleHref,
  vehicleTitle,
  type Vehicle,
} from "@/lib/vehicles";
import { ArrowRight } from "./Icons";
import VehiclePlaceholder from "./VehiclePlaceholder";

interface VehicleCardProps {
  vehicle: Vehicle;
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
export default function VehicleCard({ vehicle, priority }: VehicleCardProps) {
  const title = vehicleTitle(vehicle);
  const reserved = vehicle.status === "reserved";
  const photo = vehicle.featuredImage;

  // Anything the CRM hasn't recorded is dropped rather than rendered as an
  // empty entry — a stranded separator reads as a broken card.
  const specs = [
    vehicle.year ? String(vehicle.year) : "",
    vehicle.mileage ? formatMileage(vehicle.mileage) : "",
    vehicle.fuelType,
    vehicle.transmission,
  ].filter((spec) => spec?.trim());

  return (
    <article className="group flex h-full flex-col">
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

            The stack is width-capped: the plate badge is pinned to the top-right
            of this same photograph, and an uncapped row would slide underneath
            it as soon as a third chip appears on a narrow card. */}
        <div className="absolute left-0 top-0 flex max-w-[calc(100%-6rem)] flex-wrap">
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

          {/* Which showroom the car is at. Rendered only when the CRM has
              allocated one — an empty chip reads as a rendering fault. */}
          {vehicle.branch && (
            <span className="border border-line bg-canvas px-3 py-1.5 label-uppercase-sm text-muted">
              {vehicle.branch.name}
            </span>
          )}
        </div>

        {/* Without a plate this is an empty chip floating on the photo, which
            looks like a rendering fault rather than a gap. */}
        {vehicle.registration?.trim() && (
          <span className="absolute right-0 top-0 bg-canvas px-2.5 py-1.5 label-uppercase-sm font-mono text-muted">
            {vehicle.registration}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col pt-5">
        <h3 className="title-lg break-words text-ink">{title}</h3>

        {/* One tracked line rather than an icon grid. The doc keeps chrome off
            the card and lets type carry the detail; four labelled icons under
            every photo is exactly the decoration it backs away from. */}
        {specs.length > 0 && (
          <p className="caption mt-3 text-faint">{specs.join(" · ")}</p>
        )}

        <p className="display-sm mt-5 text-ink">{formatPrice(vehicle.price)}</p>

        {/* min-h-11 carries both to the 44px touch minimum. These are the
            primary actions on a grid most people meet on a phone. */}
        <div className="mt-auto flex items-center gap-6 border-t border-line-soft pt-5">
          <Link href={vehicleHref(vehicle)} className="link-m">
            View details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href={`/finance?vehicle=${vehicle.slug}`}
            className="inline-flex min-h-11 items-center text-sm font-light text-muted transition-colors hover:text-ink"
          >
            Finance
          </Link>
        </div>
      </div>
    </article>
  );
}
