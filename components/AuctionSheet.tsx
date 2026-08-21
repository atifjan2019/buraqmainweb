import Link from "next/link";
import { contact, whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "./Icons";
import Reveal from "./Reveal";

/**
 * The auction sheet, explained.
 *
 * Every car imported from a Japanese auction carries the inspector's own
 * grading of it. For a UK buyer that sheet is the single strongest piece of
 * evidence about a car's condition, and most people have never seen one — so
 * the section's job is to say the sheet exists, that we hand it over, and that
 * they are free to check it themselves.
 *
 * What it deliberately does NOT claim is a translation service. The dealership
 * asked for the offer to be "you can have the sheet and verify it with us",
 * and promising to translate documents is a commitment to work nobody has
 * agreed to do.
 *
 * The illustration is a pair of specimen sheets, captioned as examples. They
 * show what the paperwork looks like; the sheet for any given car is that
 * car's own, and the caption says so — an auction sheet is evidence about one
 * specific vehicle, and a visitor must never take a sample for the record of
 * the car they are considering.
 */
export default async function AuctionSheet() {
  const wa = whatsappLink(
    "Hi Burraq Motors, could you send me the auction sheet for a car I'm interested in?",
  );

  return (
    <section className="border-t border-line-soft bg-canvas-deep py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <span className="eyebrow">Japanese Imports</span>

              <h2 className="display-lg mt-6 text-ink">Ask For The Auction Sheet</h2>

              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted">
                Every car sold at a Japanese auction is inspected first, and the
                inspector records what they find on an auction sheet — a grade
                for the car overall, separate grades for the interior and
                bodywork, the verified odometer reading, and a diagram marking
                every scratch, dent and repair they could see.
              </p>

              <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted">
                It is the most honest document that exists about an imported
                car, because it was written before anyone was trying to sell it
                to you. Ask us for the sheet on any car here and we will send
                it — and you are welcome to have it checked by anyone you like.
                We would rather you bought with the evidence in front of you.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/contact" className="btn btn-solid">
                  Request a sheet
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <WhatsApp className="h-4 w-4" />
                    Ask on WhatsApp
                  </a>
                )}
              </div>

              <p className="caption mt-6 text-faint">
                Or call {contact.phone} — we can read one over the phone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div>
              {/* Two sheets rather than one: side by side you can see that the
                  layout is fixed and only the entries change, which is the
                  thing that makes a first sheet readable.

                  Captioned as EXAMPLES on purpose. These are specimen
                  documents showing what the paperwork looks like, not the
                  record for any car in our stock — and an auction sheet is
                  evidence about one specific vehicle, so a visitor must never
                  be left thinking otherwise. */}
              <div className="grid grid-cols-2 gap-4">
                {[1, 2].map((n) => (
                  /* eslint-disable-next-line @next/next/no-img-element --
                     static assets in /public; next/image would re-encode a
                     dense monochrome scan and cost legibility for no gain. */
                  <img
                    key={n}
                    src={`/auction-sheets/example-${n}.png`}
                    alt={`Example Japanese auction sheet ${n}: grades, odometer reading and the inspector's damage diagram`}
                    width={800}
                    height={800}
                    loading="lazy"
                    decoding="async"
                    className="w-full border border-line bg-white object-contain"
                  />
                ))}
              </div>

              <p className="caption mt-4 text-faint">
                Example sheets, shown so you know what to expect. The sheet for
                a car you are looking at will be that car&rsquo;s own.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
