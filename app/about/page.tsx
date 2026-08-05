import type { Metadata } from "next";
import Link from "next/link";
import CtaBanner from "@/components/CtaBanner";
import { ArrowRight, Calendar, Check, Pin, Shield } from "@/components/Icons";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import WhyUs from "@/components/WhyUs";
import { company, contact, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Burraq Motors is a Manchester dealership specialising in Japanese imports and hybrids. Every car HPI checked, warranty options available, nationwide delivery from our Bury showroom.",
};

/**
 * Everything on this page is either a claim the site already makes elsewhere
 * (the homepage showcase and trust bar) or a value out of `lib/site.ts`. There
 * is deliberately no founding date, headcount or staff biography: none of that
 * has been supplied, and inventing it on an FCA-facing trading site is not a
 * cosmetic problem. See the TODO in `lib/site.ts` for what is still missing.
 */
const commitments = [
  {
    icon: Pin,
    title: "Imported to order",
    body: "We source directly from Japanese auctions, so if the exact trim, colour or mileage you want isn't on the forecourt, we can go and find it.",
  },
  {
    icon: Shield,
    title: "HPI clear, every car",
    body: "Every vehicle is checked before it reaches us. Nothing goes on sale with outstanding finance, a write-off marker or a mileage discrepancy.",
  },
  {
    icon: Calendar,
    title: "MOT and warranty",
    body: "Cars are prepared with 6 or 12 months MOT, and warranty options are available on the vehicles that qualify for them.",
  },
  {
    icon: ArrowRight,
    title: "Delivered nationwide",
    body: "Buying from outside Manchester is routine. We arrange delivery to your door and handle the paperwork before the car moves.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
        {/* Ambient warmth behind the masthead, mixed off --color-glow rather
            than --color-amber: it carries no text, so it has no contrast
            requirement and keeps the brand's vivid amber on both themes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[38rem] w-[58rem] -translate-x-1/2 opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 12%, transparent) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="ABOUT US"
            title="Japanese cars,"
            accent="Manchester prices"
            body={site.description}
          />
        </div>
      </section>

      <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-6 sm:grid-cols-2">
            {commitments.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={(i % 2) * 90}>
                <article className="glass h-full rounded-2xl p-6 sm:p-7">
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber/30 bg-amber/10 text-amber">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">
                    {body}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom */}
      <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="glass overflow-hidden rounded-3xl">
            <div className="grid gap-10 p-7 sm:p-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber">
                  <span className="h-px w-6 bg-amber/50" />
                  THE SHOWROOM
                </span>
                <h2 className="mt-5 font-display text-[clamp(1.7rem,3.6vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.025em] text-ink">
                  Come and see the car in person
                </h2>
                <p className="mt-5 text-base leading-relaxed text-muted">
                  We&apos;d always rather you looked round a car before you
                  commit to it. Drop in during opening hours — no appointment
                  needed, and no pressure to buy on the day.
                </p>

                <ul className="mt-7 flex flex-col gap-4 text-sm">
                  {contact.addressLines.length > 0 && (
                    <li className="flex items-start gap-3">
                      <Pin className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                      <address className="not-italic leading-relaxed text-muted">
                        {contact.addressLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))}
                      </address>
                    </li>
                  )}
                  <li className="flex items-start gap-3">
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                    <span className="leading-relaxed text-muted">
                      {contact.openingHours}
                    </span>
                  </li>
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/cars"
                    className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-7 py-3.5 font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow)"
                  >
                    See what&apos;s in stock
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-7 py-3.5 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
                  >
                    Get in touch
                  </Link>
                </div>
              </div>

              {/*
                A checklist rather than a photograph: the only showroom imagery
                in the repo is vehicle photography, and dressing a stock car
                shot up as "our premises" would be a claim we can't support.
              */}
              <ul className="flex flex-col gap-3 rounded-2xl border border-line-soft bg-surface-2/60 p-6 sm:p-7">
                {[
                  "Part-exchange welcome — we'll value yours on the day",
                  "Finance available on selected cars, subject to status",
                  "Vehicle sourcing if we haven't got what you want",
                  "After-sales support once the car is yours",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                    <span className="text-sm leading-relaxed text-muted">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Marquee />
      <WhyUs />

      {/*
        The trading entity behind the name. Required on a UK trading site, and
        the registration numbers are still outstanding — see `lib/site.ts`.
      */}
      <section className="pb-20 sm:pb-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-center text-xs leading-relaxed text-faint">
            {site.name} is a trading name of {company.legalName}.
            {company.companyNumber &&
              ` Registered in England and Wales, company number ${company.companyNumber}.`}
          </p>
        </div>
      </section>

      <CtaBanner />
    </>
  );
}
