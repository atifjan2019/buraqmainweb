import Link from "next/link";
import { financeDisclaimer, financeSteps, whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function FinanceSection() {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to ask about finance.");

  return (
    <section
      id="finance"
      className="relative overflow-hidden border-y border-line-soft py-24 sm:py-32"
    >
      {/*
        Ambient warmth behind the heading, mixed off --color-glow rather than
        --color-amber: it carries no text, so it has no contrast requirement
        and keeps the brand's vivid amber on both themes. The light palette's
        darkened amber would turn this into a muddy tan.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 10%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="FINANCE"
          title="Car Finance"
          accent="Made Simple"
          body="Four straightforward steps between you and the keys. No jargon, no pressure."
        />

        <ol className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {financeSteps.map((step, i) => (
            <li key={step.step}>
              <Reveal delay={i * 90}>
                <div className="group glass relative h-full rounded-2xl p-6 transition-colors hover:border-amber/30">
                  {/*
                    A ghost numeral, not a label. `line` only worked here
                    because it is lighter than the card behind it; on light it
                    becomes a pale grey on near-white and all but disappears.
                    A grey that recedes on black advances on white, so this is
                    a token pair rather than one colour at a low alpha — and
                    hover has to deepen it on light where it brightened on dark.
                  */}
                  <span className="font-display text-5xl font-bold leading-none text-(--ghost-numeral) transition-colors group-hover:text-(--ghost-numeral-hover)">
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
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/finance"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow)"
              >
                Apply for Finance
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
                >
                  <WhatsApp className="h-5 w-5" />
                  WhatsApp Us
                </a>
              )}
            </div>
            <p className="text-center text-xs text-faint">
              {financeDisclaimer}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
