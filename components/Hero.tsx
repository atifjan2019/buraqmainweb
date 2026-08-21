import HeroCar from "./HeroCar";
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
 * The hero: an UPPERCASE display-xl headline on bare canvas, with the car
 * driving in from the right.
 *
 * This was `hero-photo-band` from DESIGN-bmw-m.md — a full-bleed showroom
 * photograph with the type laid over it. The photograph has been taken out, and
 * three things went with it, because all three existed only to rescue type from
 * the image underneath:
 *
 *   - the two linear scrims, which flattened the photo toward canvas so the
 *     headline could clear 4.5:1 over any crop of it;
 *   - the headline's halo text-shadow, which separated the glyphs from it;
 *   - the ambient glow and film grain, already removed for the same reason.
 *
 * Over flat canvas a scrim is a gradient with nothing to correct, and a halo is
 * a bloom behind text that already has full contrast. The doc's Don't list
 * names both. Keeping them "just in case" is how a system accumulates chrome
 * nobody can later justify.
 *
 * Depth now comes from the one thing in the band that has any: the car's own
 * lighting, and the lamps that ignite once it has arrived.
 */
export default async function Hero() {
  // Same request the featured section makes, so the two share one fetch.
  const [spotlight] = await getFeaturedVehicles(6);

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden pt-16">
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

                No halo: it sat here to lift the glyphs off the photograph, and
                over canvas the text is already at full token contrast. */}
            <h1 className="display-xl mt-8 text-ink">
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

      {/* The car — front end only, and the one part of this band that changes
          shape between a phone and a desktop.

          FRONT HALF, not the whole vehicle. The render's own alpha box puts the
          car at 6.4%–89% of the image width, so its midpoint is 47.7% across;
          translating by about that much sends the rear off the right edge and
          keeps the front. That is the half worth showing — it is the end with
          the headlights on it, and the entire point of this image is that they
          light up. Cropping also buys size: only part of it is on screen, so
          the image can be wider than the viewport without the visible portion
          swelling to match.

          WHY IT IS POSITIONED TWO DIFFERENT WAYS. From `xl` up the car is an
          absolute overlay filling the band, centred, with the headline holding
          the left half — the composition this hero is built around.

          Below `xl` that does not work, and nudging the numbers does not fix
          it. The text column is capped at max-w-3xl (768px), so type runs to
          roughly x=800 no matter how narrow the window gets; the overlay was
          first tried at `lg` (1024px) and the headline landed squarely on the
          bonnet, because 1024 minus a 768 column does not leave a car's worth
          of room. Narrower still and it is worse: on a 375px phone the
          headline, lede, both buttons, the disclaimer and the stats stack into
          one full-width column about 1100px tall. There is no free strip to
          put a car in — centre it and the bonnet lands on the call to action,
          floor it and it sits below the fold of an 812px screen where nobody
          sees it at all. With the photograph gone there is no scrim left to
          rescue type from any of those outcomes.

          So on small screens it stops being an overlay and becomes a band in
          the flow, sitting between the disclaimer and the stats and bleeding
          off the right edge. It gets its own room instead of competing for
          someone else's, and it is on screen without scrolling. */}
      <div className="pointer-events-none relative -mr-5 mt-10 flex justify-end sm:-mr-8 xl:absolute xl:inset-0 xl:-z-10 xl:m-0 xl:items-center">
        <div className="w-[112%] max-w-none translate-x-[6%] sm:w-[92%] sm:translate-x-[4%] xl:w-[85%] xl:translate-x-[40%] xl:-translate-y-[6%]">
          <HeroCar />
        </div>
      </div>

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
            {/* Stacked below `sm`, three-up above. Three columns on a phone
                left ~66px of text per cell, and "SATISFACTION" at the 10px
                floor with the system's mandatory 1.5px tracking needs ~90px —
                so the label overflowed its cell and was silently clipped by
                the body's overflow-x guard. Tightening the padding doesn't
                recover 24px; the column count has to give. */}
            <dl className="mt-14 grid max-w-2xl gap-px border border-line-soft bg-line-soft sm:grid-cols-3">
              {heroStats.map((s) => (
                <div key={s.label} className="spec-cell px-5 py-6">
                  <dt className="display-sm text-ink">{s.value}</dt>
                  <dd className="mt-2 label-uppercase-sm text-faint">
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
