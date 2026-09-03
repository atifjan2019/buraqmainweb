import { NextResponse } from "next/server";
import { quoteOne } from "@/lib/codeweavers/client";
import {
  MAX_DEPOSIT_PERCENT,
  MIN_DEPOSIT_PERCENT,
  MILEAGE_OPTIONS,
  TERM_OPTIONS,
  normaliseVrm,
} from "@/lib/codeweavers/params";
import type { DepositType, FinanceParameters } from "@/lib/codeweavers/types";

/**
 * Recalculation for the interactive panels.
 *
 * Exists so the browser never talks to Codeweavers directly. Their CORS would
 * allow it and the key is designated public, but a key in the page is a key
 * anyone can spend our rate limit with — and the whole point of the server
 * module is that there is exactly one place finance logic lives.
 *
 * Everything the client sends is treated as hostile. The vehicle price and
 * mileage arrive from the page rather than from a trusted store, so they are
 * bounded here: without that, this endpoint is a free quote generator for any
 * price a caller likes, against the dealership's rate limit.
 */

/** Nothing on this forecourt is worth less than a grand or more than this. */
const MIN_PRICE = 500;
const MAX_PRICE = 250_000;
const MAX_MILEAGE = 500_000;

interface QuoteRequestBody {
  price?: unknown;
  mileage?: unknown;
  registrationDate?: unknown;
  registration?: unknown;
  deposit?: unknown;
  depositType?: unknown;
  term?: unknown;
  annualMileage?: unknown;
}

function asFiniteNumber(value: unknown): number | null {
  const n = typeof value === "string" ? Number(value) : value;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** YYYY-MM-DD and a real calendar date, not merely the right shape. */
function validRegistrationDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;

  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;

  const year = Number(value.slice(0, 4));
  const thisYear = new Date().getUTCFullYear();

  // A car from 1890 or from next decade is a caller playing, not a customer.
  return year >= 1950 && year <= thisYear + 1 ? value : null;
}

function parseParameters(body: QuoteRequestBody): FinanceParameters | null {
  const depositType: DepositType =
    body.depositType === "Amount" ? "Amount" : "Percentage";

  const deposit = asFiniteNumber(body.deposit);
  const term = asFiniteNumber(body.term);
  const annualMileage = asFiniteNumber(body.annualMileage);

  if (deposit === null || term === null || annualMileage === null) return null;

  // Terms and mileages are allowlisted rather than clamped: the lender quotes a
  // fixed set, and an arbitrary value is a request nobody could have made
  // through the UI.
  if (!TERM_OPTIONS.includes(term as (typeof TERM_OPTIONS)[number])) return null;
  if (!MILEAGE_OPTIONS.includes(annualMileage as (typeof MILEAGE_OPTIONS)[number])) {
    return null;
  }

  return {
    depositType,
    deposit:
      depositType === "Percentage"
        ? clamp(deposit, MIN_DEPOSIT_PERCENT, MAX_DEPOSIT_PERCENT)
        : clamp(deposit, 0, MAX_PRICE),
    term,
    annualMileage,
  };
}

export async function POST(request: Request) {
  let body: QuoteRequestBody;

  try {
    body = (await request.json()) as QuoteRequestBody;
  } catch {
    return NextResponse.json({ error: "Malformed request." }, { status: 400 });
  }

  const price = asFiniteNumber(body.price);
  const mileage = asFiniteNumber(body.mileage);
  const registrationDate = validRegistrationDate(body.registrationDate);
  const parameters = parseParameters(body);

  if (
    price === null ||
    price < MIN_PRICE ||
    price > MAX_PRICE ||
    mileage === null ||
    mileage < 0 ||
    mileage > MAX_MILEAGE ||
    !registrationDate ||
    !parameters
  ) {
    return NextResponse.json(
      { error: "Those figures could not be used." },
      { status: 422 },
    );
  }

  const finance = await quoteOne(
    {
      // The id is only echoed back for mapping and never reaches a lender as
      // an identifier, so a fixed value is safe and keeps the cache key on the
      // figures that actually determine the quote.
      id: "interactive",
      price,
      mileage,
      registrationDate,
      vrm: normaliseVrm(typeof body.registration === "string" ? body.registration : null),
    },
    parameters,
  );

  // quoteOne never throws; a null here means the lender declined everything or
  // the service was unreachable, and the panel renders its own empty state.
  return NextResponse.json({ quotes: finance?.quotes ?? [] });
}
