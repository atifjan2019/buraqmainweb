import Image from "next/image";
import Link from "next/link";
import { financeDisclaimer } from "@/lib/site";
import { getFeaturedVehicles } from "@/lib/crm";
import { formatPrice, vehicleHref, vehicleTitle } from "@/lib/vehicles";
import { ArrowRight } from "./Icons";
import Reveal from "./Reveal";

const heroStats = [
  { value: "200+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support" },
];

/**
 * Brand photography, not stock — a low-angle shot from the dealership's own
 * library. The car it shows may no longer be for sale, so nothing here claims
 * it is.
 */
const HERO_IMAGE = "/cars/112-toyota-prius/03.jpeg";

/**
 * `hero-photo-band` from DESIGN-bmw-m.md: a full-bleed photograph filling the
 * frame, an UPPERCASE display-xl h1 sitting left over it, and nothing else. No
 * card frame — the photo IS the band.
 *
 * The ambient glow and the film grain that used to sit here are gone. Both are
 * named in the doc's Don't list: this system adds no atmospheric backdrops and
 * no decoration, and depth is supposed to come from the photograph's own
 * lighting rather than from chrome laid over it.
 *
 * The two linear scrims below are not decoration and do stay. Type over a
 * photograph fails contrast wherever the image runs toward the headline's own
 * value, and these flatten the photo toward canvas so it clears 4.5:1 at every
 * crop. They resolve through --color-canvas, so they lighten on the white
 * surface and darken on the black one without the component knowing which it is
 * in — the same markup, inverted by the token.
 */
export default async function Hero() {
  // Same request the featured section makes, so the two share one fetch.
  const [spotlight] = await getFeaturedVehicles(6);

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden pt-16">
      {/* Photography — full-bleed, edge to edge, never inset into a container.
          The doc is explicit that it stays that way at every breakpoint. */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] lg:object-[70%_center]"
        />
      </div>

      {/* Legibility scrims — see the note above. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-r from-canvas via-canvas/85 to-canvas/30 lg:via-canvas/70 lg:to-canvas/10"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-t from-canvas via-transparent to-canvas/70"
      />

      {/* 64px internal padding, which is the doc's `spacing.xxl` for hero
          bands — tighter than a section gap, because the photograph is doing
          the work the whitespace would otherwise do. */}
      <div className="mx-auto w-full max-w-[90rem] px-5 py-16 sm:px-8">
        <div className="max-w-3xl">
          <Reveal>
            <span className="eyebrow">Japanese Imports · Manchester</span>
          </Reveal>

          <Reveal delay={80}>
            {/* UPPERCASE display-xl. The doc treats sentence-case display as
                off-brand outright — the all-caps setting is a brand-voice
                signal here, not a styling preference.

                The halo separates the headline from the photo behind it, so it
                inverts with the theme: a black bloom under near-black text
                would smear it rather than lift it. Kept tight — past a few
                pixels from the glyph edge a wider blur adds no legibility, it
                just puts a cloud behind the whole word. */}
            <h1 className="display-xl mt-8 text-ink [text-shadow:var(--hero-text-shadow)]">
              Premium Japanese cars in Manchester
            </h1>
          </Reveal>

          <Reveal delay={160}>
            {/* Light (300) against the headline's 700. The gap between the two
                is the editorial signature the whole system rests on. */}
            <p className="mt-8 max-w-xl text-base font-light leading-relaxed text-lead sm:text-lg">
              Browse quality hybrid and imported vehicles, each one HPI checked
              and prepared to a standard we&apos;d happily drive ourselves.
              Finance available on selected cars.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link href="/cars" className="btn btn-solid">
                Browse Cars
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/finance" className="btn btn-outline">
                Calculate Finance
              </Link>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="caption mt-6 max-w-lg text-faint">
              {financeDisclaimer}
            </p>
          </Reveal>

          <Reveal delay={400}>
            {/* Spec cells, the same instrument-panel treatment the vehicle
                detail page uses: value on top at display weight, machined
                label beneath. Hairline gaps rather than gutters, so the row
                reads as one panel divided rather than three separate tiles. */}
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-px border border-line-soft bg-line-soft">
              {heroStats.map((s) => (
                <div key={s.label} className="spec-cell px-5 py-6">
                  <dt className="display-sm text-ink">{s.value}</dt>
                  <dd className="mt-2 text-[0.7rem] font-bold uppercase leading-tight tracking-[1.5px] text-faint">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* Spotlight card — anchors the photograph to a real car you can buy. */}
      {spotlight && (
        <div className="absolute right-8 bottom-14 z-10 hidden xl:block">
          <Reveal delay={520}>
            <Link
              href={vehicleHref(spotlight)}
              className="surface-card group block w-72 p-6 transition-colors hover:border-ink"
            >
              <span className="label-uppercase block text-ink">
                In the spotlight
              </span>
              <p className="title-lg mt-4 text-ink">
                {vehicleTitle(spotlight)}
              </p>
              <p className="mt-2 text-sm font-light text-muted">
                {spotlight.year} · {spotlight.fuelType} ·{" "}
                {spotlight.transmission}
              </p>
              <p className="display-sm mt-5 text-ink">
                {formatPrice(spotlight.price)}
              </p>
              <span className="link-m mt-2">
                View details
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      )}
    </section>
  );
}
