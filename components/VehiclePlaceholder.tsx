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
      /* Flat, with no glow behind it. DESIGN-bmw-m.md rules out atmospheric
         backdrops, and a tile standing in for a photograph is the last place
         to spend the exception on. */
      className="flex h-full w-full flex-col items-center justify-center gap-4 bg-surface-2"
    >
      <span aria-hidden className="m-stripe h-1 w-12" />
      <p
        className={`px-4 text-center text-ink ${
          feature ? "label-uppercase" : "label-uppercase-sm"
        }`}
      >
        {make} {model}
      </p>
      <p
        className={`caption px-4 text-center font-light text-faint ${
          feature ? "" : "opacity-80"
        }`}
      >
        Photographs coming soon
      </p>
    </div>
  );
}
