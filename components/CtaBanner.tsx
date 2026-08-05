import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "./Icons";
import Reveal from "./Reveal";

export default function CtaBanner() {
  const wa = whatsappLink("Hi Burraq Motors, I'm looking for a car.");

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[40rem] w-[70rem] -translate-x-1/2 -translate-y-1/2 opacity-70 blur-3xl"
        style={{
          /* --color-glow, not --color-amber: this wash carries no text, so it
             has no contrast requirement and keeps the brand's vivid amber on
             both themes. The light palette's darkened amber would settle into
             a muddy tan here rather than the warm blush this is meant to be. */
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 14%, transparent) 0%, transparent 62%)",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <h2 className="font-display text-[clamp(2rem,5.2vw,3.6rem)] font-bold leading-[1.03] tracking-[-0.03em] text-ink">
            Ready to find your <span className="text-gold">dream car?</span>
          </h2>
        </Reveal>

        <Reveal delay={90}>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
            Browse our collection of premium Japanese imports and find the
            vehicle that fits you. Nationwide delivery available.
          </p>
        </Reveal>

        <Reveal delay={170}>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/cars"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow)"
            >
              Browse All Cars
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            {wa ? (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
              >
                <WhatsApp className="h-5 w-5" />
                WhatsApp Us
              </a>
            ) : (
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
              >
                Contact Us
              </Link>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
