import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check } from "./Icons";
import Reveal from "./Reveal";

/** Indoor showroom shot — rows of stock, good for the sourcing story. */
const SHOWCASE_IMAGE = "/cars/111-audi-a3-sedan-quattro/01.jpeg";

const points = [
  "Direct Japanese imports, sourced to order",
  "Every car HPI clear before it reaches the forecourt",
  "6 or 12 months MOT and warranty options",
  "Nationwide delivery to your door",
];

/**
 * Full-bleed band that breaks up the card grids and shows the actual
 * premises rather than another row of tiles.
 */
export default function Showcase() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-20">
        <Image
          src={SHOWCASE_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
      </div>

      {/* Scrims: darken overall, then bias contrast toward the copy column */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-canvas via-canvas/90 to-canvas/55"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-b from-canvas via-transparent to-canvas"
      />
      <div
        aria-hidden
        className="grain-overlay pointer-events-none absolute inset-0 -z-10 opacity-[0.12] mix-blend-overlay"
      />

      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-xl">
          <Reveal>
            <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber">
              <span className="h-px w-6 bg-amber/50" />
              OUR SHOWROOM
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h2 className="mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink">
              Japanese engineering,
              <span className="text-gold"> Manchester prices</span>
            </h2>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
              We specialise in hybrid and imported vehicles — the models that
              hold their value, sip fuel and keep going. Come and see them in
              person at our Bury showroom.
            </p>
          </Reveal>

          <ul className="mt-9 flex flex-col gap-3.5">
            {points.map((point, i) => (
              <li key={point}>
                <Reveal delay={200 + i * 70}>
                  <span className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-amber/30 bg-amber/10">
                      <Check className="h-3 w-3 text-amber" />
                    </span>
                    {point}
                  </span>
                </Reveal>
              </li>
            ))}
          </ul>

          <Reveal delay={480}>
            <Link
              href="/cars"
              className="group mt-10 inline-flex items-center gap-2 rounded-full border border-line bg-canvas/60 px-7 py-3.5 font-semibold text-ink backdrop-blur transition-all hover:border-amber/50 hover:text-amber"
            >
              See what's in stock
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
