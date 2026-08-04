import { Car } from "./Icons";

interface VehiclePlaceholderProps {
  make: string;
  model: string;
  /** Larger treatment for the detail page's main slot. */
  size?: "card" | "feature";
}

/**
 * Stands in for photography on a car that hasn't been shot yet.
 *
 * Stock is routinely listed before the photographer sees it, so this is an
 * ordinary state rather than an error — it's branded and names the car, so the
 * card still reads as a real vehicle you can enquire about.
 *
 * It is decorative: the surrounding card already carries the make, model and
 * registration as real text, so announcing this again would only be noise.
 */
export default function VehiclePlaceholder({
  make,
  model,
  size = "card",
}: VehiclePlaceholderProps) {
  const feature = size === "feature";

  return (
    <div
      aria-hidden
      className="flex h-full w-full flex-col items-center justify-center gap-3 bg-surface-2"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 120%, rgba(245,165,36,0.14), transparent 60%)",
      }}
    >
      <Car
        className={feature ? "h-20 w-20 text-line" : "h-12 w-12 text-line"}
        strokeWidth={1}
      />
      <p
        className={`px-4 text-center font-display font-semibold tracking-tight text-faint ${
          feature ? "text-base" : "text-xs"
        }`}
      >
        {make} {model}
      </p>
      <p
        className={`px-4 text-center text-faint/70 ${
          feature ? "text-xs" : "text-[0.65rem]"
        }`}
      >
        Photographs coming soon
      </p>
    </div>
  );
}
