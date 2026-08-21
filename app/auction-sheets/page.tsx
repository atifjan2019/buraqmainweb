import type { Metadata } from "next";
import Link from "next/link";
import { company, contact, whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "@/components/Icons";
import AuctionGradePicker from "@/components/AuctionGradePicker";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Japanese Auction Sheets Explained",
  description:
    "What a Japanese auction sheet is, what every grade means, and how to read the inspector's damage codes — from an importer who hands you the sheet for every car.",
};

/**
 * The reference page for Japanese auction sheets.
 *
 * The grades and codes here are the auction houses' own standard — the same
 * scale USS, TAA and the rest print on every sheet — so this page is factual
 * reference rather than opinion. It is written in our own words for two
 * reasons: a page duplicated from another site does not rank, and the point of
 * publishing it is to be the dealer who explains this properly.
 */

const LETTER_GRADES: Array<[string, string, string]> = [
  ["A", "Pristine", "Like new"],
  ["B", "Small marks", "Light wear"],
  ["C", "Visible scratches or dents", "Stains, needs cleaning"],
  ["D", "Needs bodywork", "Tears or heavy wear"],
  ["E", "Very poor", "Needs restoration"],
];

const DAMAGE_CODES: Array<[string, string]> = [
  ["A1 – A4", "Scratch. The number is severity — A1 is a fingernail mark, A4 is deep and long."],
  ["U1 – U4", "Dent with the paint intact. Again 1 to 4 by size."],
  ["B", "A dent with a scratch in it, usually from a knock."],
  ["E1 – E4", "Dimples or hail damage — many small dents across a panel."],
  ["W1 – W4", "Wave, meaning previous bodywork. W1 is barely detectable, W3 is obvious."],
  ["S1 – S4", "Surface rust."],
  ["C1 – C4", "Corrosion. More serious than surface rust — it has started eating the metal."],
  ["P", "Paint mark or touch-up."],
  ["X", "Panel needs replacing, and had not been replaced when inspected."],
  ["XX", "Panel already replaced. Routine on bolt-on parts like a wing or bumper."],
  ["G", "Glass chip or crack — windscreen or a light unit."],
  ["Y", "Crack, usually in plastic such as a bumper."],
];

/**
 * The three questions the reference sites all field, answered plainly.
 *
 * Written as prose rather than as a JSON-LD FAQ block on purpose: rich-result
 * markup for FAQs was deprecated for most sites, and marking these up would add
 * schema that Google no longer surfaces while committing us to keeping it in
 * sync with the copy. If that changes, the answers are already here to wrap.
 */
const FAQS: Array<[string, string]> = [
  [
    "Is grade 4 good enough?",
    "For most buyers, yes — it is the market's sensible default. A 4 means a solid car with minor cosmetic flaws, which is what an honest ten-year-old vehicle looks like. The grade on its own is not the whole answer though: read it with the damage map, because two grade 4 cars can differ by a scuffed bumper versus a repaired wing.",
  ],
  [
    "What do R and RA actually mean?",
    "Both mean the car has accident or structural repair history. RA is generally the lighter of the two, but neither is a number on the same scale as 4 or 5 — they are a flag. Treat any R or RA car as one you do not buy until somebody has read the full sheet and told you exactly what was repaired and how well.",
  ],
  [
    "Why are there letters as well as a number?",
    "They measure different things. The number is the inspector's overall verdict on the car. The letters are two separate marks — one for the exterior, one for the interior — so a car can be a 4 overall with a B exterior and a C interior, which tells you the bodywork is tidy and the cabin needs a clean.",
  ],
];

export default function AuctionSheetsPage() {
  const wa = whatsappLink(
    "Hi Burraq Motors, could you send me the auction sheet for a car I'm interested in?",
  );

  return (
    <>
      {/* ── Masthead ───────────────────────────────────────────── */}
      <section className="border-b border-line-soft bg-canvas pt-32 pb-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <div className="max-w-3xl">
            <Reveal>
              <span className="eyebrow">Japanese Imports</span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="display-lg mt-6 text-ink">
                Auction Sheets Explained
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-6 text-base font-light leading-relaxed text-muted">
                Every car sold at a Japanese auction is inspected before it goes
                under the hammer, and the inspector writes what they find on an
                auction sheet. It grades the car, records the verified mileage,
                and maps every mark on a diagram of the bodywork. It is the most
                honest document that exists about an imported car, because it
                was written before anyone was trying to sell it to you.
              </p>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 text-base font-light leading-relaxed text-muted">
                {company.tradingAs} will give you the sheet for any car here,
                and you are welcome to have it checked by anyone you like. This
                page explains how to read one.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── What one looks like ────────────────────────────────── */}
      <section className="bg-canvas-deep py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <h2 className="display-sm text-ink">What one looks like</h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-muted">
              The layout is fixed, so once you have read one you can read them
              all. The top band carries the car and its grade, the right-hand
              column lists equipment, and the diagram at the bottom is where the
              inspector marks what they found.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:max-w-4xl">
              {[1, 2].map((n) => (
                /* eslint-disable-next-line @next/next/no-img-element --
                   static asset; next/image would re-encode a dense monochrome
                   scan and cost legibility for no gain. */
                <img
                  key={n}
                  src={`/auction-sheets/example-${n}.png`}
                  alt={`Example Japanese auction sheet ${n}: grades, verified odometer and the inspector's damage diagram`}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                  className="w-full border border-line bg-white object-contain"
                />
              ))}
            </div>
            <p className="caption mt-4 text-faint">
              Example sheets, shown so you know what to expect. The sheet for a
              car you are looking at will be that car&rsquo;s own.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Overall grade ──────────────────────────────────────── */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <h2 className="display-sm text-ink">The overall grade</h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-muted">
              The single number in the top-right corner. Pick one below to see
              what it means for condition and for buying risk.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <AuctionGradePicker />
          </Reveal>
        </div>
      </section>

      {/* ── Letter grades ──────────────────────────────────────── */}
      <section className="bg-canvas-deep py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <h2 className="display-sm text-ink">Interior and exterior grades</h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-muted">
              Two letters, separate from the headline number, in the top-right
              of the sheet. They are worth as much attention as the grade — a
              car can score 4 overall and still have an interior graded C.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <div className="mt-10 max-w-3xl overflow-x-auto border border-line bg-canvas">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-line px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.09375rem] text-ink sm:px-8">
                      Letter
                    </th>
                    <th className="border-b border-line px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.09375rem] text-ink">
                      Exterior
                    </th>
                    <th className="border-b border-line px-6 py-3 text-left text-xs font-bold uppercase tracking-[0.09375rem] text-ink">
                      Interior
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {LETTER_GRADES.map(([letter, exterior, interior]) => (
                    <tr key={letter} className="border-t border-line-soft">
                      <td className="px-6 py-4 font-mono text-sm font-bold text-ink sm:px-8">
                        {letter}
                      </td>
                      <td className="px-6 py-4 font-light text-muted">
                        {exterior}
                      </td>
                      <td className="px-6 py-4 font-light text-muted">
                        {interior}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Damage codes ───────────────────────────────────────── */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <h2 className="display-sm text-ink">The damage diagram</h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-muted">
              The car drawn from above, with a code written wherever the
              inspector found something. A letter says what it is, and where a
              number follows, it says how bad — 1 is slight, 4 is severe. This
              is the part worth reading properly.
            </p>
          </Reveal>

          <Reveal delay={100}>
            <dl className="mt-10 grid max-w-5xl gap-px border border-line bg-line sm:grid-cols-2">
              {DAMAGE_CODES.map(([code, meaning]) => (
                <div key={code} className="flex gap-5 bg-canvas px-6 py-4 sm:px-8">
                  <dt className="w-24 shrink-0 font-mono text-sm font-bold text-ink">
                    {code}
                  </dt>
                  <dd className="text-sm font-light leading-relaxed text-muted">
                    {meaning}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={160}>
            <p className="caption mt-6 max-w-2xl text-faint">
              One last thing worth knowing: XX simply means a panel has already
              been replaced, which is routine on a bolt-on part like a wing or a
              bumper and is not the same as accident history. R or RA on the
              grade is the one that means structural repair.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Common questions ───────────────────────────────────── */}
      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <h2 className="display-sm text-ink">Common questions</h2>
            <p className="mt-4 max-w-2xl text-base font-light leading-relaxed text-muted">
              The three things people ask us most once they have seen a sheet.
            </p>
          </Reveal>

          <dl className="mt-12 max-w-3xl border-t border-line-soft">
            {FAQS.map(([question, answer], i) => (
              <Reveal key={question} delay={i * 80}>
                <div className="border-b border-line-soft py-8">
                  <dt className="title-lg text-ink">{question}</dt>
                  <dd className="mt-4 text-base font-light leading-relaxed text-muted">
                    {answer}
                  </dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Ask ────────────────────────────────────────────────── */}
      <section className="border-t border-line-soft bg-canvas-deep py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <div className="max-w-2xl">
              <h2 className="display-sm text-ink">Ask us for a sheet</h2>
              <p className="mt-4 text-base font-light leading-relaxed text-muted">
                Tell us which car you are looking at and we will send you its
                auction sheet. If anything on it needs explaining, ask — we
                would rather you bought with the evidence in front of you.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/cars" className="btn btn-solid">
                  Browse our stock
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
                Or call {contact.phone}.
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
