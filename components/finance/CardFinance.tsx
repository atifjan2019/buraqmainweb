import { formatMoney } from "@/lib/codeweavers/params";
import type { VehicleFinance } from "@/lib/codeweavers/types";

/**
 * The finance terms line on a stock card.
 *
 * The monthly payment itself lives on the Finance button beside it — this is
 * the line that makes showing it lawful.
 *
 * CONC 3.5.7R gives the representative APR no less prominence than any other
 * rate in a promotion, so it sits here at the same size and weight as the
 * product and the term rather than shrinking into small print. The payment on
 * the button and this line are always rendered together: the card either shows
 * both or neither.
 *
 * Renders nothing when no product quoted, which is the common case on this
 * forecourt rather than an edge one — PCP declines most of the stock on age.
 * A card showing "£0" or "N/A" for a car no lender will fund is worse than a
 * card showing no figure at all.
 */
export default function CardFinanceTerms({
  finance,
}: {
  finance: VehicleFinance | null;
}) {
  const quote = finance?.cheapest;

  if (!quote) return null;

  return (
    <p className="caption mt-3 text-faint">
      {quote.productName} · {quote.term} months · {quote.apr}% APR representative
    </p>
  );
}

/**
 * The payment, for the Finance button's own label.
 *
 * Exported as a value rather than a component because the button needs it
 * inline, and returning it from one place keeps "which quote does the card
 * show" — the cheapest — a single decision.
 */
export function cardMonthlyPayment(finance: VehicleFinance | null): string | null {
  const quote = finance?.cheapest;

  return quote ? formatMoney(quote.monthlyPayment) : null;
}
