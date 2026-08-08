import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "./Icons";
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
 * Full-bleed photo band, and the reason it exists is rhythm: DESIGN-bmw-m.md
 * forbids two text-only bands in a row, which it says reads as a corporate
 * site. Photo band → card grid → photo band is the pattern, and this is the
 * beat between two grids.
 *
 * Split rather than overlaid: on a white canvas a scrim heavy enough to carry
 * black body copy over a photograph washes the car out to nothing, and the doc
 * would rather have the photograph intact than the copy on top of it. So the
 * image takes half the band at full strength and the copy takes the other half
 * on clean canvas. On the black surface the same split still holds.
 *
 * The grain overlay and the two atmospheric scrims that used to sit here are
 * gone — both are on the doc's Don't list.
 */
export default function Showcase() {
  return (
    <section className="border-y border-line-soft bg-canvas">
      <div className="grid lg:grid-cols-2">
        {/* Photography, edge to edge on its own half. Full-bleed at every
            breakpoint — the doc never lets it collapse into a margin. */}
        <div
          aria-hidden
          className="relative order-first min-h-[22rem] lg:order-last lg:min-h-[38rem]"
        >
          {/* Decorative, and the empty alt is deliberate. This is a vehicle
              photograph from the CRM library, not a shot of the premises —
              describing it as the showroom would be a claim the repo can't
              support. See the same note on the About page. */}
          <Image
            src={SHOWCASE_IMAGE}
            alt=""
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover object-center"
          />
        </div>

        <div className="flex items-center px-5 py-24 sm:px-8 lg:px-16">
          <div className="max-w-xl">
            <Reveal>
              <span className="eyebrow">Our Showroom</span>
            </Reveal>

            <Reveal delay={80}>
              <h2 className="display-lg mt-6 text-ink">
                Japanese engineering, Manchester prices
              </h2>
            </Reveal>

            <Reveal delay={140}>
              <p className="mt-6 max-w-md text-base font-light leading-relaxed text-muted">
                We specialise in hybrid and imported vehicles — the models that
                hold their value, sip fuel and keep going. Come and see them in
                person at our Bury showroom.
              </p>
            </Reveal>

            {/* A hairline-ruled list rather than ticks in circles. The system
                has no chip, badge or icon-in-a-ring shape; a rule between rows
                is how it separates items. */}
            <ul className="mt-10 border-t border-line-soft">
              {points.map((point, i) => (
                <li key={point} className="border-b border-line-soft">
                  <Reveal delay={200 + i * 70}>
                    <span className="block py-4 text-sm font-light text-muted">
                      {point}
                    </span>
                  </Reveal>
                </li>
              ))}
            </ul>

            <Reveal delay={480}>
              <Link href="/cars" className="btn btn-outline mt-10">
                See what&apos;s in stock
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
