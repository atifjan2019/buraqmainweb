import Image from "next/image";

/**
 * The winged-horse (Buraq) emblem from the dealership's logo, paired with a
 * typeset wordmark so it stays crisp at small sizes, and separated from it by
 * the M tricolour bar.
 *
 * That bar is the system's brand-identity marker and this is its primary home —
 * DESIGN-bmw-m.md puts the tricolour on the wordmark, on motorsport chrome and
 * on section rules, and nowhere else. It is not a divider of convenience: drop
 * it in beside an arbitrary heading and it stops meaning anything.
 *
 * The mark is baked as a flat #f5a524 raster by scripts/build-brand-assets.mjs,
 * which predates this palette. `brand-mark` in globals.css desaturates it to
 * white on the dark canvas and to black on the light one, rather than shipping
 * two more rasters: it is a single-colour silhouette, so a filter shifts the
 * whole thing cleanly and keeps the soft alpha edges the build script produces.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/brand/mark-amber.png"
        alt=""
        width={256}
        height={134}
        priority
        className="brand-mark h-9 w-auto"
      />

      {/* The tricolour, run vertically so it reads as a badge edge rather than
          as an underline. Decorative — the wordmark beside it is the name. */}
      <span aria-hidden className="m-stripe-y h-9 w-1 shrink-0" />

      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold uppercase tracking-[-0.25px] text-ink">
          Burraq
        </span>
        <span className="mt-1 text-[0.62rem] font-bold uppercase tracking-[1.5px] text-muted">
          Motors
        </span>
      </span>
    </span>
  );
}
