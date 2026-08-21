import Image from "next/image";

/**
 * The BMM roundel — the dealership's own logo, used as supplied.
 *
 * TWO RASTERS, NOT ONE FILTERED RASTER. The mark this replaced was a
 * single-colour horse silhouette, so `brand-mark` could flip it between black
 * and white with a filter and be done. This lockup is not a silhouette: just
 * over half its visible pixels are near-black — the horse and "MANCHESTER" —
 * and the rest is largely the brand red. On the dark canvas that black half
 * disappears and leaves the red type wrapped around a horse-shaped hole, and
 * no single filter fixes that without also mangling the red.
 *
 * So the dark file inverts ONLY the near-neutral pixels and leaves anything
 * with real chroma untouched, which keeps the trademark red identical in both
 * themes. It costs almost nothing: barely one percent of the mark was light to
 * begin with, so there is essentially no bright detail to lose in the swap.
 *
 * Both are in the DOM and CSS picks one, rather than JS choosing after mount —
 * the theme is stamped on <html> before first paint, so a scripted swap would
 * show the wrong mark for a frame on every load.
 *
 * The wordmark beside it is NOT redundant with the one inside the roundel. At
 * the 44px it renders at in the header, the badge's own "BurraqMotors" is about
 * five pixels tall — present, not readable. The typeset pair is what actually
 * says the name at that size.
 */
export default function Logo({
  className = "",
  /**
   * Height utility for the roundel. Defaults to the header's compact size.
   *
   * It is a prop because the constraint is real: the mark is a circular badge
   * carrying three lines of its own type, and inside a 64px header none of that
   * type is legible — it reads as a roundel, and the wordmark beside it does the
   * talking. Anywhere with vertical room can afford to show what it actually
   * says.
   */
  markClassName = "h-11",
}: {
  className?: string;
  markClassName?: string;
}) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      {/* Sized from the display size, not the source: the largest use on the
          site is the footer at 80px, so 256px covers 3x displays. The 500px
          original is in the repo history if a print asset is ever needed. */}
      <Image
        src="/brand/bmm-logo.png"
        alt=""
        width={256}
        height={256}
        priority
        className={`brand-logo brand-logo--light w-auto ${markClassName}`}
      />
      <Image
        src="/brand/bmm-logo-dark.png"
        alt=""
        width={256}
        height={256}
        priority
        className={`brand-logo brand-logo--dark w-auto ${markClassName}`}
      />

      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-bold uppercase tracking-[-0.015625rem] text-ink">
          Burraq
        </span>
        <span className="mt-1 label-uppercase-sm text-muted">Motors</span>
      </span>
    </span>
  );
}
