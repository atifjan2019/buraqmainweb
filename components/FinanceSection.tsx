import Link from "next/link";
import { financeDisclaimer, financeSteps, whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function FinanceSection() {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to ask about finance.");

  return (
    /* The ambient bloom behind this heading is gone: the doc rules out
       atmospheric backdrops outright, and on a white canvas it had nothing
       left to do anyway. */
    <section
      id="finance"
      className="border-y border-line-soft bg-canvas py-24"
    >
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Finance"
          title="Car Finance"
          accent="Made Simple"
          body="Four straightforward steps between you and the keys. No jargon, no pressure."
        />

        {/* Hairline gaps rather than gutters, so the four steps read as one
            numbered sequence instead of four detached cards. */}
        <ol className="mt-16 grid gap-px border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
          {financeSteps.map((step, i) => (
            <li key={step.step} className="spec-cell">
              <Reveal delay={i * 90}>
                <div className="group h-full p-8">
                  {/*
                    A ghost numeral, not a label. `line` alone doesn't work
                    here: a grey that recedes on white advances on black, so
                    this is a token pair rather than one colour at a low alpha
                    — and hover has to deepen it on white where it lightens on
                    black.
                  */}
                  <span className="display-md block leading-none text-(--ghost-numeral) transition-colors group-hover:text-(--ghost-numeral-hover)">
                    {step.step}
                  </span>
                  <h3 className="title-lg mt-6 text-ink">{step.title}</h3>
                  <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                    {step.body}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>

        <Reveal delay={140}>
          <div className="mt-16 flex flex-col items-center gap-6">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/finance" className="btn btn-solid">
                Apply for Finance
                <ArrowRight className="h-4 w-4" />
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <WhatsApp className="h-5 w-5" />
                  WhatsApp Us
                </a>
              )}
            </div>
            <p className="caption max-w-2xl text-center text-faint">
              {financeDisclaimer}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
