import type { ReactNode } from "react";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}

/**
 * Shared shell for the long-form legal documents. Deliberately plain and
 * high-contrast — these pages are read, not admired, and regulators expect
 * them to be easy to find and easy to follow.
 *
 * Body copy stays at Light (300) even here. The doc is explicit that legal
 * text does not get an exemption from the weight pair: `cookie-consent-card`
 * is specified at body-sm / 300, and bumping the fine print to 400 to "help"
 * is the change that makes the whole page read as a different system.
 *
 * Inline links are underlined rather than tracked-uppercase. `.link-m` is a
 * navigational control; a link inside a sentence has to stay inside it.
 *
 * The tables are `table-fixed` with `break-words` on the cells. Both documents
 * use two-column label/value tables holding an address and an email, and with
 * automatic layout a cell sizes to its longest unbreakable token — a 28-char
 * email is wider than half a 360px screen, so the table pushed past the
 * viewport. Fixed layout splits the columns evenly and lets the long values
 * wrap instead. A horizontal scroller would also work, but nobody scrolls a
 * privacy notice sideways to find the bit they were looking for.
 */
export default function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: LegalPageProps) {
  return (
    <>
      <section className="border-b border-line-soft bg-canvas pt-32 pb-16">
        {/* The site container, then the reading column inside it — the pattern
            the blog article already uses. Setting the narrow width ON the
            container instead left this page's gutters narrower than every
            other band, so its heading did not line up with the header above
            it. The measure is unchanged; only the alignment is. */}
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <div className="mx-auto max-w-[42rem]">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="display-lg mt-6 text-ink">{title}</h1>
            <p className="mt-6 text-base font-light leading-relaxed text-muted">
              {intro}
            </p>
            <p className="caption mt-8 text-faint">Last updated: {updated}</p>
          </div>
        </div>
      </section>

      <section className="bg-canvas py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <div
          className="mx-auto max-w-[42rem] text-base font-light leading-relaxed text-muted
            [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:opacity-70
            [&_h2]:mt-14 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[-0.015625rem] [&_h2]:text-ink
            [&_h3]:mt-8 [&_h3]:text-base [&_h3]:font-bold [&_h3]:uppercase [&_h3]:tracking-[0.09375rem] [&_h3]:text-ink
            [&_li]:mt-2 [&_li]:pl-1
            [&_p]:mt-4
            [&_strong]:font-normal [&_strong]:text-ink
            [&_table]:mt-5 [&_table]:w-full [&_table]:table-fixed [&_table]:border-collapse [&_table]:text-sm
            [&_td]:border-t [&_td]:border-line-soft [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_td]:break-words
            [&_th]:border-b [&_th]:border-line [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_th]:text-xs [&_th]:font-bold [&_th]:uppercase [&_th]:tracking-[0.09375rem] [&_th]:break-words [&_th]:text-ink
            [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
        >
          {children}
        </div>
        </div>
      </section>
    </>
  );
}
