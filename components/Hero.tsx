import Link from "next/link";
import { financeDisclaimer, whatsappLink } from "@/lib/site";
import { ArrowRight, Check, Sparkle, WhatsApp } from "./Icons";
import Reveal from "./Reveal";

const heroStats = [
  { value: "200+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support" },
];

export default function Hero() {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  return (
    <section className="relative isolate flex min-h-[92svh] items-center overflow-hidden pt-28 pb-20">
      {/* Ambient light */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-20 bg-canvas"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-18%] -z-20 h-[70rem] w-[70rem] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(245,165,36,0.16) 0%, rgba(245,165,36,0.05) 38%, transparent 68%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-[-10%] -z-20 h-[45rem] w-[45rem] rounded-full opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(120,80,255,0.10) 0%, transparent 65%)",
        }}
      />

      {/* Perspective grid floor */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[38svh] opacity-[0.13]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "linear-gradient(to top, black 0%, transparent 92%), linear-gradient(to right, transparent, black 22%, black 78%, transparent)",
          maskComposite: "intersect",
          WebkitMaskImage:
            "linear-gradient(to top, black 0%, transparent 92%), linear-gradient(to right, transparent, black 22%, black 78%, transparent)",
          WebkitMaskComposite: "source-in",
        }}
      />

      {/* Film grain */}
      <div
        aria-hidden
        className="grain-overlay pointer-events-none absolute inset-0 -z-10 opacity-[0.16] mix-blend-overlay"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-4xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber/25 bg-amber/5 px-4 py-1.5 text-xs font-medium tracking-wide text-amber">
              <Sparkle className="h-3.5 w-3.5" />
              Trusted by 200+ Customers
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 font-display text-[clamp(2.6rem,7.4vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              <span className="block text-ink">Premium</span>
              <span className="block text-gold">Japanese Cars</span>
              <span className="block text-ink">in Manchester</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              Browse quality hybrid and imported vehicles, each one HPI checked
              and prepared to a standard we'd happily drive ourselves. Finance
              available on selected cars.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/cars"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-canvas transition-all hover:bg-amber-bright hover:shadow-[0_0_44px_-8px_var(--color-amber)]"
              >
                Browse Cars
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/finance"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-surface/40 px-8 py-4 font-semibold text-ink backdrop-blur transition-colors hover:border-amber/40 hover:text-amber"
              >
                Apply for Finance
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-muted transition-colors hover:text-ink"
                >
                  <WhatsApp className="h-5 w-5" />
                  WhatsApp Us
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-5 text-xs text-faint">{financeDisclaimer}</p>
          </Reveal>

          {/* Stat strip */}
          <Reveal delay={400}>
            <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft">
              {heroStats.map((s) => (
                <div key={s.label} className="bg-canvas/90 px-4 py-6 sm:px-6">
                  <dt className="font-display text-2xl font-bold text-amber sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-[0.7rem] leading-tight text-muted sm:text-xs">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* Corner trust list — desktop only, keeps the hero balanced */}
      <div className="pointer-events-none absolute right-8 bottom-24 hidden xl:block">
        <Reveal delay={480}>
          <ul className="flex flex-col gap-3 text-right">
            {[
              "FCA Authorised",
              "HPI Checked Vehicles",
              "Warranty Available",
              "Nationwide Delivery",
            ].map((item) => (
              <li
                key={item}
                className="flex items-center justify-end gap-2.5 text-sm text-muted"
              >
                {item}
                <span className="grid h-5 w-5 place-items-center rounded-full border border-amber/30 bg-amber/10">
                  <Check className="h-3 w-3 text-amber" />
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
