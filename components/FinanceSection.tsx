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
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,165,36,0.10) 0%, transparent 65%)",
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
          <div className="mt-14 flex flex-col items-center gap-4">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/finance"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-canvas transition-all hover:bg-amber-bright hover:shadow-[0_0_40px_-8px_var(--color-amber)]"
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
