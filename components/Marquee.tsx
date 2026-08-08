import { specialisms } from "@/lib/site";

/**
 * Infinite ticker of specialisms. The list is rendered twice and translated
 * by -50%, which makes the loop seamless.
 *
 * Set in the machined uppercase rather than in display type, and separated by
 * the tricolour rather than by a rotated square. A ticker is chrome, so it
 * takes the label voice — and the separator is the one place in a strip like
 * this where the brand mark earns its keep.
 */
export default function Marquee() {
  const items = [...specialisms, ...specialisms];

  return (
    <section
      aria-label="Our specialisations"
      className="relative overflow-hidden border-y border-line-soft bg-canvas py-6"
    >
      {/* Edge fades so items enter and leave rather than being clipped. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-canvas to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-canvas to-transparent"
      />

      <div className="flex w-max animate-marquee items-center gap-10 pr-10">
        {items.map((item, i) => (
          <div key={`${item}-${i}`} className="flex items-center gap-10">
            <span className="label-uppercase whitespace-nowrap text-muted">
              {item}
            </span>
            <span aria-hidden className="m-stripe h-1 w-6 shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
}
