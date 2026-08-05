import Link from "next/link";
import {
  formatMileage,
  formatPrice,
  vehicleHref,
  vehicleTitle,
  type Vehicle,
} from "@/lib/vehicles";
import { ArrowRight, Calendar, Fuel, Gauge, Gear } from "./Icons";
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
 * Stock card.
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

  const specs = [
    { icon: Calendar, label: String(vehicle.year) },
    { icon: Gauge, label: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: vehicle.fuelType },
    { icon: Gear, label: vehicle.transmission },
  ];

  return (
    <article className="group glass relative flex h-full flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-amber/30 hover:shadow-(--shadow-card)">
      {/* Media — fixed 4:3 box so mixed-shape photos can't make the grid
          ragged, and so nothing reflows as images arrive. */}
      <div className="relative aspect-4/3 overflow-hidden bg-surface-2">
        {photo ? (
          /* eslint-disable-next-line @next/next/no-img-element --
             next/image would proxy these through /_next/image; the CRM already
             serves correctly-sized, cached JPEGs. */
          <img
            src={photo.thumb}
            alt={photo.alt}
            width={400}
            height={300}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <VehiclePlaceholder make={vehicle.make} model={vehicle.model} />
        )}

        {/* Fade so badges and price stay legible whatever sits behind them */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/10 to-transparent"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {reserved && (
            <span className="rounded-full bg-surface-2/90 px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-amber ring-1 ring-amber/40 backdrop-blur">
              Reserved
            </span>
          )}
          {vehicle.isFeatured && (
            <span className="rounded-full bg-amber px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-on-amber">
              Featured
            </span>
          )}
        </div>

        <span className="absolute right-4 top-4 rounded-md border border-line bg-canvas/70 px-2 py-1 font-mono text-[0.65rem] font-semibold uppercase tracking-widest text-muted backdrop-blur">
          {vehicle.registration}
        </span>

        <p className="absolute bottom-4 left-5 font-display text-3xl font-bold text-gold">
          {formatPrice(vehicle.price)}
        </p>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-semibold tracking-tight text-ink">
          {title}
        </h3>

        <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5">
          {specs.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-muted">
              <Icon className="h-4 w-4 shrink-0 text-amber/70" />
              <dd className="truncate text-[0.8rem]">{label}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 flex items-center gap-2 border-t border-line-soft pt-4">
          <Link
            href={vehicleHref(vehicle)}
            className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-amber hover:text-on-amber"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>
          <Link
            href={`/finance?vehicle=${vehicle.slug}`}
            className="rounded-full border border-line px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:border-amber/40 hover:text-amber"
          >
            Finance
          </Link>
        </div>
      </div>
    </article>
  );
}
