import { formatMoney } from "@/lib/codeweavers/params";
import { financeDisclaimer, financeFullDisclaimer, company } from "@/lib/site";
import type { FinanceQuote } from "@/lib/codeweavers/types";

/**
 * The FCA representative example.
 *
 * LEGALLY REQUIRED, not decorative. Under CONC 3.5.3R a promotion that shows an
 * amount relating to the cost of credit — which "£194.90 per month" on a stock
 * card is — must also carry a representative example, and CONC 3.5.5R(5)
 * requires it to be no less prominent than the cost information it qualifies
 * and for its items to be given equal prominence to each other. That rules out
 * a footnote, a tooltip, an accordion, or a link to another page: it sits on
 * the listings page, open, at body size.
 *
 * Every figure comes from the API's own nominated example. Nothing here is
 * computed, rounded up or interpolated — the only arithmetic in this feature is
 * currency formatting.
 *
 * The FCA firm reference number is the one value the dealership has not
 * supplied. Rather than invent one or omit the line silently, the statement
 * renders without it and the gap is visible to whoever reviews the page.
 */
export default function RepresentativeExample({
  quote,
}: {
  quote: FinanceQuote | null;
}) {
  if (!quote) return null;

  /* Deposit is the API's TotalDeposit; the percentage is not recomputed here.
     Each row is one figure the regulation names, and they share a single
     type treatment so none reads as the headline. */
  const rows: Array<[string, string]> = [
    ["Cash price", formatMoney(quote.cashPrice)],
    ["Deposit", formatMoney(quote.deposit)],
    [
      "Monthly payments",
      `${quote.numberOfPayments} × ${formatMoney(quote.monthlyPayment)}`,
    ],
    ["Term", `${quote.term} months`],
    ...(quote.amountOfCredit !== null
      ? ([["Amount of credit", formatMoney(quote.amountOfCredit)]] as Array<
          [string, string]
        >)
      : []),
    ...(quote.finalPayment !== null
      ? ([["Final payment", formatMoney(quote.finalPayment)]] as Array<
          [string, string]
        >)
      : []),
    ["Total amount payable", formatMoney(quote.totalAmountPayable)],
    ["Rate of interest", `${quote.rateOfInterest}% fixed`],
    ["Representative APR", `${quote.apr}% APR`],
  ];

  return (
    <section
      aria-labelledby="representative-example"
      className="border border-line bg-canvas-deep p-6 sm:p-8"
    >
      <h2
        id="representative-example"
        className="label-uppercase text-ink"
      >
        Representative Example
      </h2>

      <p className="mt-4 text-sm font-light leading-relaxed text-muted">
        Based on a {quote.productName} agreement for a vehicle at{" "}
        {formatMoney(quote.cashPrice)}.
      </p>

      {/*
        A definition list, not a table. At 360px a seven-row table either
        scrolls sideways or crushes its columns to unreadable; label-above-value
        pairs reflow into a single column and stay legible, then become two
        columns where there is room. Nothing here scrolls horizontally.
      */}
      <dl className="mt-6 grid grid-cols-1 gap-px border border-line-soft bg-line-soft sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-canvas px-4 py-3">
            <dt className="label-uppercase-sm text-faint">{label}</dt>
            {/* Equal prominence: every value uses the same size and weight,
                including the APR. */}
            <dd className="mt-1 text-base font-bold tabular-nums text-ink">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {quote.fees.length > 0 && (
        <ul className="mt-5 space-y-1">
          {quote.fees.map((fee) => (
            <li key={fee.text} className="caption text-faint">
              {fee.text}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-y-2 border-t border-line-soft pt-5">
        <p className="caption leading-relaxed text-faint">
          {financeDisclaimer}
        </p>
        <p className="caption leading-relaxed text-faint">
          {financeFullDisclaimer}
        </p>
        <p className="caption leading-relaxed text-faint">
          {company.legalName} trading as {company.tradingAs} is authorised and
          regulated by the Financial Conduct Authority
          {company.fcaNumber ? `, firm reference number ${company.fcaNumber}` : ""}.
        </p>
      </div>
    </section>
  );
}
