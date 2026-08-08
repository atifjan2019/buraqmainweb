import type { Metadata } from "next";
import Link from "next/link";
import CtaBanner from "@/components/CtaBanner";
import { ArrowRight } from "@/components/Icons";
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
    title: "Imported to order",
    body: "We source directly from Japanese auctions, so if the exact trim, colour or mileage you want isn't on the forecourt, we can go and find it.",
  },
  {
    title: "HPI clear, every car",
    body: "Every vehicle is checked before it reaches us. Nothing goes on sale with outstanding finance, a write-off marker or a mileage discrepancy.",
  },
  {
    title: "MOT and warranty",
    body: "Cars are prepared with 6 or 12 months MOT, and warranty options are available on the vehicles that qualify for them.",
  },
  {
    title: "Delivered nationwide",
    body: "Buying from outside Manchester is routine. We arrange delivery to your door and handle the paperwork before the car moves.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-canvas pt-32 pb-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <SectionHeading
            eyebrow="About Us"
            title="Japanese cars,"
            accent="Manchester prices"
            body={site.description}
          />
        </div>
      </section>

      <section className="bg-canvas pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          {/* The icon-in-a-rounded-square that headed each of these is gone:
              the system has no such shape, and the tricolour rule is how it
              marks a card without adding chrome. */}
          <div className="grid gap-px border border-line-soft bg-line-soft sm:grid-cols-2">
            {commitments.map(({ title, body }, i) => (
              <article key={title} className="spec-cell">
                <Reveal delay={(i % 2) * 90}>
                  <div className="h-full p-8">
                    <span aria-hidden className="m-stripe block h-1 w-10" />
                    <h3 className="title-lg mt-6 text-ink">{title}</h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                      {body}
                    </p>
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Showroom */}
      <section className="bg-canvas pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <div className="surface-card">
            <div className="grid gap-12 p-8 sm:p-12 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="eyebrow">The Showroom</span>
                <h2 className="display-md mt-6 text-ink">
                  Come and see the car in person
                </h2>
                <p className="mt-6 text-base font-light leading-relaxed text-muted">
                  We&apos;d always rather you looked round a car before you
                  commit to it. Drop in during opening hours — no appointment
                  needed, and no pressure to buy on the day.
                </p>

                {/* Labelled rows rather than icon-led ones. A machined label
                    above the value is how this system presents a fact. */}
                <dl className="mt-8 border-t border-line-soft text-sm">
                  {contact.addressLines.length > 0 && (
                    <div className="border-b border-line-soft py-4">
                      <dt className="label-uppercase text-faint">Address</dt>
                      <dd className="mt-2">
                        <address className="not-italic font-light leading-relaxed text-muted">
                          {contact.addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </address>
                      </dd>
                    </div>
                  )}
                  <div className="border-b border-line-soft py-4">
                    <dt className="label-uppercase text-faint">Opening hours</dt>
                    <dd className="mt-2 font-light leading-relaxed text-muted">
                      {contact.openingHours}
                    </dd>
                  </div>
                </dl>

                <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/cars" className="btn btn-solid">
                    See what&apos;s in stock
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/contact" className="btn btn-outline">
                    Get in touch
                  </Link>
                </div>
              </div>

              {/*
                A checklist rather than a photograph: the only showroom imagery
                in the repo is vehicle photography, and dressing a stock car
                shot up as "our premises" would be a claim we can't support.
              */}
              <ul className="border-t border-line">
                {[
                  "Part-exchange welcome — we'll value yours on the day",
                  "Finance available on selected cars, subject to status",
                  "Vehicle sourcing if we haven't got what you want",
                  "After-sales support once the car is yours",
                ].map((item) => (
                  <li
                    key={item}
                    className="border-b border-line py-4 text-sm font-light leading-relaxed text-muted"
                  >
                    {item}
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
      <section className="bg-canvas pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <p className="caption text-center leading-relaxed text-faint">
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
