"use client";

import { useRef, useState } from "react";

/**
 * The auction grade scale, as a pickable set rather than a list.
 *
 * Every grade carries four things, because that is what somebody standing in
 * front of a car actually needs: what the inspector meant, what it means for
 * them as a buyer, and how much risk it carries. A table of grade-to-sentence
 * gives them the first and leaves them to work out the rest.
 *
 * `risk` is deliberately not a number. Auction grading is a judgement made in
 * minutes by a human with a torch, and putting a percentage on it would imply a
 * precision the sheet does not have.
 */
const GRADES = [
  {
    id: "S",
    heading: "Effectively new",
    body: "Delivery mileage and nothing to note. These are cars that went to auction almost straight from the dealer, and they are rare enough that you will not build a search around them.",
    take: "Priced accordingly — you are paying new-car money",
    risk: "low",
  },
  {
    id: "6",
    heading: "Excellent, barely used",
    body: "Very low mileage with no meaningful faults. Usually a car that has been someone's second vehicle, or has spent most of its life garaged.",
    take: "Excellent buy if the mileage story holds up",
    risk: "low",
  },
  {
    id: "5",
    heading: "Very good throughout",
    body: "Light use and clearly well looked after. Expect a tidy interior and paint that has not been corrected.",
    take: "Strong condition without the grade-6 premium",
    risk: "low",
  },
  {
    id: "4.5",
    heading: "Good to very good",
    body: "Small cosmetic marks only — the kind you find on any car that has been parked in public. Mechanically you should expect no surprises.",
    take: "Often the sweet spot on price against condition",
    risk: "low",
  },
  {
    id: "4",
    heading: "Good used — minor flaws",
    body: "Where most sound imports sit, and the sensible default to search on. Solid car, minor cosmetic issues, nothing structural. Read the letters too — a 4 can still have a tired interior.",
    take: "Safe baseline for most imports",
    risk: "low",
  },
  {
    id: "3.5",
    heading: "Fair — wear, or tidy repairs",
    body: "Visible wear, or repairs that have been done properly. Not a warning on its own, but this is the grade where the damage map stops being optional reading.",
    take: "Fine if you have seen the sheet and priced the work",
    risk: "medium",
  },
  {
    id: "3",
    heading: "Poor — significant wear",
    body: "Significant wear or damage, and priced to match. Cars at this grade are bought to be worked on, not driven home and forgotten about.",
    take: "Budget for paint or panel work before you bid",
    risk: "medium",
  },
  {
    id: "2",
    heading: "Very poor",
    body: "Heavy wear, corrosion or damage. Corrosion is the one to take seriously — it is the fault that keeps costing money after the cosmetic work is done.",
    take: "Project territory. Inspect before committing",
    risk: "high",
  },
  {
    id: "1",
    heading: "Restoration, or heavily modified",
    body: "Either a car that needs rebuilding, or one that has been modified far enough from standard that the inspector would not grade it normally. Grade 1 does not always mean bad — a tastefully modified car lands here too.",
    take: "Read the sheet closely — 1 covers two very different cars",
    risk: "high",
  },
  {
    id: "RA",
    heading: "Light accident repair",
    body: "Accident history where the repair was minor — commonly a bolt-on panel replaced rather than structural work. Generally the lighter of the two repair flags.",
    take: "Ask exactly what was repaired, and see the evidence",
    risk: "high",
  },
  {
    id: "R",
    heading: "Accident repaired — structural",
    body: "Repaired accident damage, and the flag that matters most on the whole sheet. R is not a point on the same scale as 4 or 5 — it is a separate statement about the car's history.",
    take: "Do not buy on the grade alone. Get the full sheet read",
    risk: "high",
  },
] as const;

/**
 * Risk is coloured with the palette's SEMANTIC tokens, never the tricolour —
 * DESIGN-bmw-m.md keeps the M colours for identity and forbids them as status.
 *
 * There is no danger token in the system, and inventing a red would break that
 * rule, so "high" resolves to ink instead. On this palette ink IS the emphasis
 * colour, so the highest risk band reads as the heaviest thing in the panel —
 * which is the job the red would have done.
 */
const RISK_CLASS: Record<string, string> = {
  low: "text-success",
  medium: "text-warning",
  high: "text-ink",
};

export default function AuctionGradePicker() {
  // Grade 4 is the landing state because it is where most sound imports sit,
  // so the first thing a visitor reads is the one they are most likely to meet.
  const [active, setActive] = useState(4);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const grade = GRADES[active];

  /**
   * Arrow keys move between grades, Home/End jump to the ends.
   *
   * This is a tablist, and a tablist that only responds to clicks is a set of
   * buttons wearing the wrong role. Focus moves with the selection, so the
   * panel a keyboard user is reading is always the one their focus is on.
   */
  const onKeyDown = (event: React.KeyboardEvent) => {
    const last = GRADES.length - 1;
    let next: number | null = null;

    if (event.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (event.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="mt-10 max-w-3xl">
      {/* The scale. It wraps rather than scrolling: eleven grades in a
          horizontal scroller on a phone hides the ends, and the ends are R and
          RA — the two a buyer most needs to see exist. */}
      <div
        role="tablist"
        aria-label="Auction grades"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-px border border-line bg-line"
      >
        {GRADES.map((g, i) => {
          const selected = i === active;
          return (
            <button
              key={g.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`grade-tab-${g.id}`}
              aria-selected={selected}
              aria-controls="grade-panel"
              /* Roving tabindex: one stop for the whole set, then arrows.
                 Eleven tab stops to get past a widget is a keyboard trap in
                 everything but name. */
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className={`min-h-11 flex-1 px-4 py-3 label-uppercase-sm transition-colors ${
                selected
                  ? "bg-ink text-on-ink"
                  : "bg-canvas text-muted hover:text-ink"
              }`}
            >
              {g.id}
            </button>
          );
        })}
      </div>

      {/* The panel. aria-live is deliberately absent: focus follows selection,
          so a screen reader already lands here — announcing it again would
          double up. */}
      <div
        role="tabpanel"
        id="grade-panel"
        aria-labelledby={`grade-tab-${grade.id}`}
        tabIndex={-1}
        className="border border-t-0 border-line bg-canvas p-6 sm:p-8"
      >
        <span className="label-uppercase-sm text-faint">Grade {grade.id}</span>

        <h3 className="title-lg mt-3 text-ink">{grade.heading}</h3>

        <p className="mt-4 text-base font-light leading-relaxed text-muted">
          {grade.body}
        </p>

        <dl className="mt-8 grid gap-px border-t border-line-soft pt-6 sm:grid-cols-2 sm:gap-8 sm:border-t-0 sm:pt-0">
          <div>
            <dt className="label-uppercase-sm text-faint">Buyer take</dt>
            <dd className="mt-2 text-sm font-light leading-relaxed text-ink">
              {grade.take}
            </dd>
          </div>
          <div className="mt-5 sm:mt-0">
            <dt className="label-uppercase-sm text-faint">Risk band</dt>
            <dd
              className={`mt-2 text-sm font-bold uppercase tracking-[0.09375rem] ${
                RISK_CLASS[grade.risk]
              }`}
            >
              {grade.risk}
            </dd>
          </div>
        </dl>
      </div>

      <p className="caption mt-4 text-faint">
        The grade is a summary. Always read it with the damage diagram below —
        two grade 4 cars can differ by a scuffed bumper or a repaired wing.
      </p>
    </div>
  );
}
