import Image from "next/image";
import Link from "next/link";
import { financeDisclaimer } from "@/lib/site";
import { getFeaturedVehicles } from "@/lib/crm";
import { formatPrice, vehicleHref, vehicleTitle } from "@/lib/vehicles";
import { ArrowRight, Handshake, Headset, Shield } from "./Icons";
import Reveal from "./Reveal";

/**
 * The showroom, shot in the dealership's own space with the marque wall in
 * frame. It is doing two jobs: it is the hero image, and it is the only place
 * on the site that shows the room a customer would actually walk into.
 */
const HERO_IMAGE = "/hero/showroom.jpg";

/**
 * The three assurances under the buttons.
 *
 * These replaced a row of figures — "200+ happy customers", "98% satisfaction
 * rate", "24/7 support". Two of those three were claims about ourselves that a
 * visitor cannot check and every dealership makes. These are three things we
 * actually do, and the first two are the specific worries somebody has before
 * buying an import. The support line survived the swap because it was already
 * a fact about availability rather than a self-assessment.
 */
const heroAssurances = [
  { icon: Shield, title: "HPI Checked", note: "For peace of mind" },
  { icon: Handshake, title: "Finance", note: "Available" },
  { icon: Headset, title: "24/7", note: "Customer support" },
] as const;

/**
 * `hero-photo-band` from DESIGN-bmw-m.md: a full-bleed photograph filling the
 * frame, an UPPERCASE display-xl h1 sitting left over it, and nothing else. No
 * card frame — the photo IS the band.
 *
 * The two linear scrims are not decoration, and they are the doc's own carve
 * out. Type over a photograph fails contrast wherever the image runs toward the
 * headline's own value, and these flatten the left of the photo toward canvas
 * so it clears 4.5:1 at every crop. They resolve through --color-canvas, so
 * they lighten on the white surface and darken on the black one without this
 * component knowing which it is in — the same markup, inverted by the token.
 *
 * (The revision before this one had no photograph, and therefore no scrims and
 * no halo: over flat canvas a scrim is a gradient correcting nothing, which the
 * doc's Don't list rules out. The photograph is back, so they are back with it.
 * The rule did not change — the thing it applies to did.)
 */
export default async function Hero() {
  // Same request the featured section makes, so the two share one fetch.
  const [spotlight] = await getFeaturedVehicles(6);

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden pt-16">
      {/* Legibility scrims — see the note above.

          The horizontal one carries the type: opaque at the left edge, clearing
          before the car so the vehicle keeps its own contrast. Its stop moves
          right as the viewport narrows, because the text column takes a larger
          share of a phone than of a desktop.

          The vertical one exists only below `lg`. There the column runs the
          height of the band and the assurances land on the floor tiles, which
          are light but busy. It settles that end of the frame without touching
          the desktop composition, where nothing sits that low. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 hidden bg-linear-to-r from-canvas from-20% via-canvas/70 via-44% to-transparent to-66% lg:block"
      />

      {/* 64px internal padding, which is the doc's `spacing.xxl` for hero
          bands — tighter than a section gap, because the photograph is doing
          the work the whitespace would otherwise do. */}
      <div className="mx-auto w-full max-w-[90rem] px-5 py-16 sm:px-8">
        {/* Narrower than the max-w-3xl this column used to be, and the width
            is set by the scrim rather than by taste: the type has to finish
            while the scrim is still opaque enough to carry it. At 576px the
            last glyph lands around 42% of a 1440px viewport, where the scrim
            still holds ~0.72 alpha — about 10:1 against ink even if the photo
            behind it were pure black. A wider column pushed the text into the
            part of the ramp that has to stay clear for the car. */}
        <div className="max-w-xl">
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
            <p className="mt-8 text-base font-light leading-relaxed text-lead sm:text-lg">
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

          {/* The photograph.

              It is a background layer from `lg` up and a band in the flow below
              that, and the reason is the frame, not taste. The shot is 3:2
              landscape; the hero band on a 375px phone is roughly 375x1100,
              taller than it is wide. Filling that box keeps the height and
              throws away the sides — about 31% of the image width survives, so
              the car stops being a car and becomes an enormous close-up of one
              headlight, with the showroom gone. No focal point fixes that;
              there is no crop of a landscape photo that fills a portrait box
              and still reads as a room.

              So below `lg` the photo takes its own 3:2 band in the flow and the
              type sits on plain canvas above it — which is also why the scrim
              is `lg`-only: below that there is no text over the photo for it to
              correct.

              The box is `top-16` rather than `inset-0` because the header is
              FIXED and opaque. Fitted against a full-height band the image sits
              flush to y=0, directly under the header, which then eats the
              ceiling and the marque wall. Starting below it is what makes the
              whole photograph actually visible. 16 matches the section's own
              pt-16. */}
          <div className="hero-shot-frame relative -mx-5 mt-10 sm:-mx-8 lg:absolute lg:inset-x-0 lg:bottom-0 lg:top-16 lg:-z-20 lg:m-0">
            <div className="hero-shot overflow-hidden">
              <Image
                src={HERO_IMAGE}
                alt=""
                fill
                priority
                sizes="100vw"
                /* The box is already the image's own ratio, so cover crops
                   nothing — it is the fill mode that guarantees no letterbox
                   if the ratio is ever a rounding hair off. */
                className="object-cover object-center"
              />
            </div>
          </div>

          <Reveal delay={320}>
            <p className="caption mt-6 max-w-lg text-faint">
              {financeDisclaimer}
            </p>
          </Reveal>

          <Reveal delay={400}>
            {/* Assurances. Stacked below `sm`, a divided row above it.

                The hairline dividers appear only from `sm` up, and that is
                correctness rather than taste: a wrapped flex row leaves a
                border-left stranded at the start of the second line, which
                reads as a rendering fault. Stacking below the breakpoint
                removes the wrap entirely, so there is no line for a divider to
                be orphaned on. */}
            <ul className="mt-12 grid gap-5 sm:grid-cols-3 sm:gap-0">
              {heroAssurances.map(({ icon: Icon, title, note }, i) => (
                <li
                  key={title}
                  className={`flex items-center gap-3 sm:px-5 ${
                    i === 0 ? "sm:pl-0" : "sm:border-l sm:border-line-soft"
                  } ${i === heroAssurances.length - 1 ? "sm:pr-0" : ""}`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-ink" />
                  <span className="min-w-0">
                    <span className="block label-uppercase-sm text-ink">
                      {title}
                    </span>
                    <span className="block label-uppercase-sm text-faint">
                      {note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
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
