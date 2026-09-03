"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import {
  DEFAULT_PARAMETERS,
  MAX_DEPOSIT_PERCENT,
  MILEAGE_OPTIONS,
  TERM_OPTIONS,
  formatMoney,
} from "@/lib/codeweavers/params";
import { financeDisclaimer, financeFullDisclaimer } from "@/lib/site";
import type { FinanceQuote } from "@/lib/codeweavers/types";

interface FinancePanelProps {
  /** Fixed on a car's own page; entered by the visitor on /finance. */
  price: number;
  mileage: number;
  registrationDate: string;
  registration?: string;
  /** Rendered immediately so the panel is never blank on first paint. */
  initialQuotes: FinanceQuote[];
  /** Lets the visitor change the price. Only on the standalone calculator. */
  priceEditable?: boolean;
  heading?: string;
}

/**
 * The finance calculator.
 *
 * Serves both the vehicle page and the standalone /finance calculator; the only
 * difference is whether the price is fixed or typed, which is one prop.
 *
 * WHAT IT NEVER DOES: compute a payment. Every figure shown came back from the
 * lender through our own server route. There is no interpolation while a
 * request is in flight and no estimate on failure, because a monthly payment
 * this site invented would be a false financial promotion.
 *
 * The first render uses quotes fetched on the server, so the panel arrives with
 * real figures rather than a spinner, and only recalculates once a control
 * moves.
 */
export default function FinancePanel({
  price: initialPrice,
  mileage,
  registrationDate,
  registration,
  initialQuotes,
  priceEditable = false,
  heading = "Finance this car",
}: FinancePanelProps) {
  const ids = useId();
  const fieldId = (name: string) => `${ids}-${name}`;

  const [price, setPrice] = useState(initialPrice);
  const [deposit, setDeposit] = useState(DEFAULT_PARAMETERS.deposit);
  const [term, setTerm] = useState<number>(DEFAULT_PARAMETERS.term);
  const [annualMileage, setAnnualMileage] = useState<number>(
    DEFAULT_PARAMETERS.annualMileage,
  );

  const [quotes, setQuotes] = useState<FinanceQuote[]>(initialQuotes);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  /** Skips the fetch on mount — the server already provided those figures. */
  const mounted = useRef(false);
  /** Lets a superseded request's response be discarded rather than shown. */
  const requestId = useRef(0);

  const recalculate = useCallback(async () => {
    const id = ++requestId.current;
    setPending(true);
    setFailed(false);

    try {
      const response = await fetch("/api/finance/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          price,
          mileage,
          registrationDate,
          registration,
          deposit,
          depositType: "Percentage",
          term,
          annualMileage,
        }),
      });

      // A slow first request landing after a faster second one would show the
      // wrong figures against the current controls.
      if (id !== requestId.current) return;

      if (!response.ok) {
        setQuotes([]);
        setFailed(true);
        return;
      }

      const payload = (await response.json()) as { quotes: FinanceQuote[] };
      setQuotes(payload.quotes);
    } catch {
      if (id !== requestId.current) return;
      setQuotes([]);
      setFailed(true);
    } finally {
      if (id === requestId.current) setPending(false);
    }
  }, [price, mileage, registrationDate, registration, deposit, term, annualMileage]);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    // Debounced because the deposit control is a slider: without it, dragging
    // from 0 to 30 fires thirty requests at a rate-limited lender.
    const timer = setTimeout(recalculate, 400);
    return () => clearTimeout(timer);
  }, [recalculate]);

  const depositAmount = Math.round((price * deposit) / 100);

  return (
    <div className="surface-card p-6 sm:p-8">
      <h2 className="title-lg text-ink">{heading}</h2>

      {/* Controls. Stacked on a phone and side by side from sm — a slider and
          two selects in a row at 360px leaves each too narrow to use. */}
      <div className="mt-6 space-y-5">
        {priceEditable && (
          <div>
            <label className="label-uppercase block text-ink" htmlFor={fieldId("price")}>
              Vehicle price
            </label>
            <input
              id={fieldId("price")}
              type="number"
              inputMode="numeric"
              min={500}
              max={250000}
              step={100}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value) || 0)}
              className="field mt-3"
            />
          </div>
        )}

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label className="label-uppercase text-ink" htmlFor={fieldId("deposit")}>
              Deposit
            </label>
            <span className="text-sm font-bold tabular-nums text-ink">
              {formatMoney(depositAmount)}
              <span className="font-light text-muted"> · {deposit}%</span>
            </span>
          </div>
          {/* min-h-11 keeps the thumb target at the 44px touch minimum. */}
          <input
            id={fieldId("deposit")}
            type="range"
            min={0}
            max={MAX_DEPOSIT_PERCENT}
            step={1}
            value={deposit}
            onChange={(e) => setDeposit(Number(e.target.value))}
            className="mt-3 min-h-11 w-full accent-[var(--color-ink)]"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-uppercase block text-ink" htmlFor={fieldId("term")}>
              Term
            </label>
            <select
              id={fieldId("term")}
              value={term}
              onChange={(e) => setTerm(Number(e.target.value))}
              className="field mt-3"
            >
              {TERM_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} months
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-uppercase block text-ink" htmlFor={fieldId("mileage")}>
              Annual mileage
            </label>
            <select
              id={fieldId("mileage")}
              value={annualMileage}
              onChange={(e) => setAnnualMileage(Number(e.target.value))}
              className="field mt-3"
            >
              {MILEAGE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.toLocaleString("en-GB")} miles
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Figures. `aria-busy` rather than replacing them with a spinner: the
          previous quote stays readable while the next is fetched, which is
          calmer than a panel that empties every time a slider moves. */}
      <div
        aria-busy={pending}
        className={`mt-8 border-t border-line-soft pt-6 transition-opacity ${
          pending ? "opacity-50" : "opacity-100"
        }`}
      >
        {quotes.length === 0 ? (
          <div>
            <p className="text-sm font-light leading-relaxed text-muted">
              {failed
                ? "We couldn't get finance figures just now. Please try again, or ask us and we'll quote you directly."
                : "No lender on our panel will quote on this car at these terms. Try a different deposit or term — or ask us and we'll look at it for you."}
            </p>
            <Link href="/contact" className="btn btn-outline mt-5">
              Ask about finance
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {quotes.map((quote) => (
              <article key={quote.product} className="border border-line p-5">
                <p className="label-uppercase-sm text-faint">{quote.productName}</p>

                <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                  <span className="display-sm text-ink">
                    {formatMoney(quote.monthlyPayment)}
                  </span>
                  <span className="text-sm font-light text-muted">per month</span>
                </p>

                {/*
                  A definition list rather than a table: at 360px a six-column
                  table of figures either scrolls sideways or crushes itself.
                  These reflow to one column and stay readable.
                */}
                <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3">
                  {(
                    [
                      ["Term", `${quote.term} months`],
                      ["Deposit", formatMoney(quote.deposit)],
                      ["Total payable", formatMoney(quote.totalAmountPayable)],
                      ["Rate of interest", `${quote.rateOfInterest}% fixed`],
                      ...(quote.finalPayment !== null
                        ? ([["Final payment", formatMoney(quote.finalPayment)]] as Array<[string, string]>)
                        : []),
                      ...(quote.contractMileage !== null
                        ? ([["Contract mileage", `${quote.contractMileage.toLocaleString("en-GB")} miles`]] as Array<[string, string]>)
                        : []),
                      ...(quote.excessMileageRate !== null
                        ? ([["Excess mileage", `${quote.excessMileageRate}p per mile`]] as Array<[string, string]>)
                        : []),
                      // Last in the list, first in prominence — see below.
                      ["Representative APR", `${quote.apr}% APR`],
                    ] as Array<[string, string]>
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt className="label-uppercase-sm text-faint">{label}</dt>
                      {/* Every value at the same size and weight, the APR
                          included: CONC 3.5.7R gives it no less prominence
                          than any other rate on the promotion. */}
                      <dd className="mt-1 text-sm font-bold tabular-nums text-ink">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* The lender's own words about this quote — an adjusted term,
                    typically. Meaningful, and never paraphrased. */}
                {quote.notices.length > 0 && (
                  <ul className="mt-5 space-y-1 border-t border-line-soft pt-4">
                    {quote.notices.map((notice) => (
                      <li key={notice} className="caption text-muted">
                        {notice}
                      </li>
                    ))}
                  </ul>
                )}

                {quote.fees.length > 0 && (
                  <ul className="mt-4 space-y-1">
                    {quote.fees.map((fee) => (
                      <li key={fee.text} className="caption text-faint">
                        {fee.text}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Through our own redirect, which attaches the API key
                    server-side — see app/api/finance/apply. The customer's
                    exact figures travel on the documented quoteReference. */}
                {quote.quoteReference && (
                  <a
                    href={`/api/finance/apply?quote=${encodeURIComponent(quote.quoteReference)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-solid mt-6 w-full"
                  >
                    Apply for this quote
                  </a>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-2 border-t border-line-soft pt-5">
        <p className="caption leading-relaxed text-faint">{financeDisclaimer}</p>
        <p className="caption leading-relaxed text-faint">{financeFullDisclaimer}</p>
      </div>
    </div>
  );
}
