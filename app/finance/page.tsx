import type { Metadata } from "next";
import Image from "next/image";
import FinanceCalculator from "@/components/FinanceCalculator";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { financeDisclaimer, financeSteps, financeVideos } from "@/lib/site";

export const metadata: Metadata = {
  title: "Car Finance",
  description:
    "Calculate illustrative monthly payments on any vehicle price. Finance available on selected cars at Burraq Motors Manchester, subject to status.",
};

const HERO_IMAGE = "/cars/107-toyota-prius/01.jpeg";

export default function FinancePage() {
  return (
    <>
      {/* Header band */}
      <section className="relative isolate overflow-hidden pt-36 pb-16">
        <div aria-hidden className="absolute inset-0 -z-30">
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-35"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 -z-20 bg-linear-to-b from-canvas/95 via-canvas/85 to-canvas"
        />
        <div
          aria-hidden
          className="grain-overlay pointer-events-none absolute inset-0 -z-10 opacity-[0.14] mix-blend-overlay"
        />

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="max-w-2xl">
            <Reveal>
              <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber">
                <span className="h-px w-6 bg-amber/50" />
                FINANCE
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 font-display text-[clamp(2.2rem,5.6vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em] text-ink">
                Car finance,
                <span className="text-gold"> made simple</span>
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted">
                Put in a vehicle price and see illustrative monthly payments
                across the finance products available. Figures are for
                illustration only and carry no obligation.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="relative pb-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <FinanceCalculator initialPrice={12900} />
          </Reveal>
        </div>
      </section>

      {/* Process */}
      <section className="relative border-y border-line-soft py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="HOW IT WORKS"
            title="Four steps to"
            accent="your next car"
          />
          <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {financeSteps.map((step, i) => (
              <li key={step.step}>
                <Reveal delay={i * 90}>
                  <div className="group glass h-full rounded-2xl p-6 transition-colors hover:border-amber/30">
                    <span className="font-display text-5xl font-bold leading-none text-line transition-colors group-hover:text-amber/30">
                      {step.step}
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal delay={140}>
            <p className="mt-12 text-center text-xs text-faint">
              {financeDisclaimer}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Explainer films */}
      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="UNDERSTAND YOUR OPTIONS"
            title="Finance explained,"
            accent="in plain English"
            body="Short films covering each type of agreement, so you know exactly what you're signing."
          />

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {financeVideos.map((video, i) => (
              <Reveal key={video.id} delay={(i % 3) * 90}>
                <figure className="glass overflow-hidden rounded-2xl transition-colors hover:border-amber/30">
                  <div className="aspect-video w-full bg-surface-2">
                    <iframe
                      src={`https://player.vimeo.com/video/${video.id}`}
                      title={video.title}
                      loading="lazy"
                      allow="fullscreen; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                  <figcaption className="p-5 font-display text-base font-semibold text-ink">
                    {video.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
