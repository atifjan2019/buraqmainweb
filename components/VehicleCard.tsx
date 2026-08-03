import Image from "next/image";
import Link from "next/link";
import {
  formatMileage,
  formatPrice,
  primaryImage,
  vehicleTitle,
  type Vehicle,
} from "@/lib/vehicles";
import { ArrowRight, Calendar, Car, Fuel, Gauge, Gear } from "./Icons";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const title = vehicleTitle(vehicle);
  const hero = primaryImage(vehicle);

  const specs = [
    { icon: Calendar, label: String(vehicle.year) },
    { icon: Gauge, label: formatMileage(vehicle.mileage) },
    { icon: Fuel, label: vehicle.fuelType },
    { icon: Gear, label: vehicle.transmission },
  ];

  return (
    <article className="group glass relative flex flex-col overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-1.5 hover:border-amber/30 hover:shadow-[0_24px_60px_-24px_rgba(245,165,36,0.35)]">
      {/* Media */}
      <div className="relative aspect-16/10 overflow-hidden bg-surface-2">
        {hero ? (
          <Image
            src={hero}
            alt={`${vehicle.year} ${title} — ${vehicle.color}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div
            className="grid h-full w-full place-items-center"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 120%, rgba(245,165,36,0.14), transparent 60%)",
            }}
          >
            <Car className="h-14 w-14 text-line" strokeWidth={1} />
          </div>
        )}

        {/* Fade so badges and price stay legible over any photo */}
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-canvas via-canvas/10 to-transparent"
        />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {vehicle.featured && (
            <span className="rounded-full bg-amber px-2.5 py-1 text-[0.68rem] font-semibold tracking-wide text-canvas">
              Featured
            </span>
          )}
          {vehicle.financeAvailable && (
            <span className="rounded-full border border-line bg-canvas/80 px-2.5 py-1 text-[0.68rem] font-medium text-muted backdrop-blur">
              Finance Available
            </span>
          )}
        </div>

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
            href={`/cars/${vehicle.slug}`}
            className="group/btn inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-surface-2 px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-amber hover:text-canvas"
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
