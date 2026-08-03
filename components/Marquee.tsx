import { specialisms } from "@/lib/site";

/**
 * Infinite ticker of specialisms. The list is rendered twice and translated
 * by -50%, which makes the loop seamless.
 */
export default function Marquee() {
  const items = [...specialisms, ...specialisms];

  return (
    <section
      aria-label="Our specialisations"
      className="relative overflow-hidden border-y border-line-soft py-6"
    >
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
            <span className="whitespace-nowrap font-display text-lg font-medium tracking-tight text-muted sm:text-xl">
              {item}
            </span>
            <span className="h-1.5 w-1.5 shrink-0 rotate-45 bg-amber/60" />
          </div>
        ))}
      </div>
    </section>
  );
}
