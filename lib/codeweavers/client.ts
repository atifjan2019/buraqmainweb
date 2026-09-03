import "server-only";

import { createHash } from "node:crypto";

import {
  DEFAULT_PARAMETERS,
  REPRESENTATIVE_VEHICLE_PRICE,
  decodeEntities,
  productName,
} from "./params";
import type {
  CodeweaversProductResult,
  CodeweaversRequest,
  CodeweaversResponse,
  CodeweaversVehicleRequest,
  FinanceParameters,
  FinanceQuote,
  FinanceVehicleInput,
  VehicleFinance,
} from "./types";

/**
 * Every Codeweavers call this site makes.
 *
 * `server-only` at the top is load-bearing: the API key must never reach the
 * browser bundle. Codeweavers designate this key public and their CORS does
 * allow our origin, so a client-side call would work — and would put a
 * credential in the page and hand anyone the ability to spend our rate limit.
 *
 * WHAT THIS MODULE GUARANTEES TO ITS CALLERS:
 *
 *  1. It never throws. Finance is an enhancement on pages whose real job is
 *     selling cars, so a lender outage costs a monthly figure and nothing else.
 *     Every failure path returns an empty result and logs server-side.
 *  2. Nothing it returns was calculated here. Every figure is the API's own.
 *     A displayed payment the lender did not produce is a false financial
 *     promotion, so there is deliberately no arithmetic in this file.
 *  3. Products that errored never appear. A card showing "£0" or "N/A" for a
 *     car no lender will fund is worse than a card showing no figure at all.
 */

const ENDPOINT = "https://services.codeweavers.net/public/v3/jsonfinance/calculate";

/**
 * Long enough for a 12-vehicle batch — measured at about 800ms — and short
 * enough that a hanging lender never holds a page render open.
 */
const TIMEOUT_MS = 5000;

/**
 * Six hours.
 *
 * A quote for a given car and parameter set does not move during a working day;
 * rates change on a lender's schedule, not a visitor's. The ceiling is a day,
 * beyond which a displayed figure stops being one the lender would honour.
 */
const REVALIDATE_SECONDS = 6 * 60 * 60;

export const FINANCE_CACHE_TAG = "codeweavers-quotes";

function apiKey(): string | null {
  return process.env.CODEWEAVERS_API_KEY ?? null;
}

/** False when nobody has set the key. Callers degrade; they never crash. */
export function isFinanceConfigured(): boolean {
  return Boolean(apiKey());
}

/* ------------------------------------------------------------------ */
/* Request building                                                     */
/* ------------------------------------------------------------------ */

function toVehicleRequest(input: FinanceVehicleInput): CodeweaversVehicleRequest {
  return {
    Id: input.id,
    Vehicle: {
      CashPrice: input.price,
      Type: "Car",
      VehicleStatus: "Preowned",
      CurrentMileage: input.mileage,
      CurrentMileageUnit: "Miles",
      // Mandatory. Omitting it returns 200 with an empty product list and no
      // error — a silent failure indistinguishable from "no lender quoted".
      RegistrationDate: input.registrationDate,
      RegistrationCountryCode: "GB",
      // Sent as a group or not at all, and only when it is a real plate.
      ...(input.vrm
        ? {
            IdentifierType: "VRM" as const,
            Identifier: input.vrm,
            RegistrationNumber: input.vrm,
          }
        : {}),
    },
  };
}

function buildRequest(
  vehicles: FinanceVehicleInput[],
  parameters: FinanceParameters,
): CodeweaversRequest {
  return {
    Parameters: {
      Term: parameters.term,
      Deposit: parameters.deposit,
      DepositType: parameters.depositType,
      AnnualMileage: parameters.annualMileage,
      AnnualMileageUnit: "Miles",
    },
    VehicleRequests: vehicles.map(toVehicleRequest),
  };
}

/* ------------------------------------------------------------------ */
/* Normalisation                                                        */
/* ------------------------------------------------------------------ */

/** One product result becomes a quote, or nothing if it errored. */
function toQuote(result: CodeweaversProductResult): FinanceQuote | null {
  if (result.HasError || !result.Quote) {
    return null;
  }

  const q = result.Quote;

  return {
    product: result.Key,
    productName: productName(result.Key),
    monthlyPayment: q.RegularPayment,
    term: q.Term,
    apr: q.Apr,
    rateOfInterest: q.RateOfInterest,
    cashPrice: q.CashPrice,
    deposit: q.TotalDeposit ?? q.Deposit,
    totalAmountPayable: q.TotalAmountPayable,
    amountOfCredit: q.AmountOfCredit ?? null,
    totalChargeForCredit: q.TotalChargeForCredit ?? null,
    // FinalPayment is the LAST INSTALMENT — bigger than the others because the
    // option-to-purchase fee rides with it. Residual is the PCP balloon and is
    // a different thing entirely. Reading the balloon as the final payment is
    // how a fee note about "the final payment" ended up on a card that showed
    // no final payment at all.
    finalPayment: q.FinalPayment && q.FinalPayment > 0 ? q.FinalPayment : null,
    balloon: q.Residual && q.Residual > 0 ? q.Residual : null,
    // Kept for completeness. NOT used to describe the schedule — see below.
    numberOfPayments: q.NumberOfRegularPayments,
    /*
     * The authoritative schedule.
     *
     * NumberOfRegularPayments does not mean what it says: on a 60-month
     * agreement it returns 58, while Payments[] returns 59 × £253.26 plus a
     * final £263.26. Rendering the former produced a representative example
     * that understated the total by £516.52 and did not reconcile against
     * TotalAmountPayable — an example whose arithmetic does not add up is
     * exactly what an FCA audit is looking for.
     */
    schedule: (q.Payments ?? []).map((p) => ({
      amount: p.Amount,
      count: p.NumberOfPayments,
    })),
    fees: (q.Fees ?? []).map((fee) => ({
      amount: fee.Amount,
      text: decodeEntities(fee.DisplayText),
      profile: fee.Profile,
    })),
    notices: (result.Notifications?.Public ?? [])
      .map((n) => n.Message)
      .filter((m): m is string => Boolean(m)),
    applyUrl: q.QuoteActions?.Apply ?? null,
    termsUrl: q.QuoteActions?.TermsAndConditions ?? null,
    quoteReference: q.QuoteReference ?? null,
    contractMileage: q.ContractMileage && q.ContractMileage > 0 ? q.ContractMileage : null,
    excessMileageRate:
      q.ExcessMileageRate && q.ExcessMileageRate > 0 ? q.ExcessMileageRate : null,
  };
}

/**
 * Does the schedule add up to the total the lender stated?
 *
 * sum(payments) + deposit must equal TotalAmountPayable to the penny. This is
 * not defensive programming for its own sake: the figures in a representative
 * example are a regulated statement, and one that does not reconcile is both a
 * compliance failure and a sign we have misread the contract — which is exactly
 * what happened when the schedule was derived from NumberOfRegularPayments.
 *
 * Compared in pence to avoid a float comparison deciding a compliance question.
 */
function reconciles(quote: FinanceQuote): boolean {
  if (quote.schedule.length === 0) return false;

  const pence = (n: number) => Math.round(n * 100);

  const scheduled = quote.schedule.reduce(
    (total, line) => total + pence(line.amount) * line.count,
    0,
  );

  return scheduled + pence(quote.deposit) === pence(quote.totalAmountPayable);
}

/**
 * Logs why a product did not quote.
 *
 * TechnicalMessage is the useful half and is never returned to a caller — the
 * customer-facing DealerMessage is deliberately vague ("Please contact us
 * directly"), which is right for a shopper and useless for diagnosis.
 */
function logProductError(vehicleId: string, result: CodeweaversProductResult): void {
  if (!result.HasError) return;

  console.error(
    `[codeweavers] ${result.Key} declined for ${vehicleId}: ` +
      `${result.Error?.TechnicalMessage ?? "no technical message"} ` +
      `(code ${result.Error?.Code ?? "none"})`,
  );
}

function toVehicleFinance(
  vehicleId: string,
  products: CodeweaversProductResult[],
  requestedTerm: number,
): VehicleFinance {
  const quotes: FinanceQuote[] = [];

  for (const product of products) {
    logProductError(vehicleId, product);

    const quote = toQuote(product);
    if (quote) quotes.push(quote);
  }

  // Cheapest first, so a list of products reads from most to least affordable.
  quotes.sort((a, b) => a.monthlyPayment - b.monthlyPayment);

  /*
   * The card shows the quote at the term we ASKED for, falling back to the
   * cheapest when no product could hold it.
   *
   * The lender shortens a term it cannot meet — a PCP on an older car comes
   * back at 48 months against a 60-month request — and returns a genuinely
   * lower monthly figure for the shorter agreement. Picking purely on price
   * therefore made a grid of cards advertise a mixture of terms, which reads as
   * inconsistent and buries the comparison the customer is actually making.
   *
   * This changes WHICH real quote is featured. It never changes a quote: a card
   * showing 48 months is a car where nothing would run to 60, and its payment
   * is the one the lender gave for 48.
   */
  const atRequestedTerm = quotes.find((q) => q.term === requestedTerm);

  return {
    vehicleId,
    quotes,
    cheapest: atRequestedTerm ?? quotes[0] ?? null,
  };
}

/* ------------------------------------------------------------------ */
/* Transport                                                            */
/* ------------------------------------------------------------------ */

/**
 * One call. Returns null on every failure, having logged it.
 *
 * `cacheKey` participates in Next's data cache. It is built from the vehicles
 * AND the parameters, because a quote is only reusable for the exact terms it
 * was calculated on.
 */
async function call(
  request: CodeweaversRequest,
  cacheKey: string,
): Promise<CodeweaversResponse | null> {
  const key = apiKey();

  if (!key) {
    console.error(
      "[codeweavers] CODEWEAVERS_API_KEY is not set — no finance figures will " +
        "be shown. Add it to the deployment environment.",
    );
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CW-ApiKey": key,
      },
      body: JSON.stringify(request),
      signal: controller.signal,
      next: { revalidate: REVALIDATE_SECONDS, tags: [FINANCE_CACHE_TAG, cacheKey] },
    });

    if (!response.ok) {
      console.error(
        `[codeweavers] quote request rejected with ${response.status} ` +
          `for ${request.VehicleRequests.length} vehicle(s)`,
      );
      return null;
    }

    return (await response.json()) as CodeweaversResponse;
  } catch (error) {
    // AbortError included: a lender that is slow must cost a monthly figure,
    // never the page.
    console.error("[codeweavers] quote request failed", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * A stable, SHORT cache tag for a batch.
 *
 * Hashed rather than spelled out. The obvious version — every slug and price
 * joined together — reads better in a log and is silently useless: Next caps a
 * cache tag at 256 characters and DISCARDS anything longer with only a warning,
 * so a twelve-car listing page was tagging nothing at all and revalidateTag
 * could never have reached it.
 *
 * The identity of a quote is the parameters plus the exact set of cars and
 * their prices, so all of that goes into the digest; a price change produces a
 * different tag, which is the point.
 */
function cacheKeyFor(vehicles: FinanceVehicleInput[], p: FinanceParameters): string {
  const identity = [
    p.deposit,
    p.depositType,
    p.term,
    p.annualMileage,
    ...vehicles.map((v) => `${v.id}@${v.price}@${v.mileage}@${v.registrationDate}`),
  ].join("|");

  return `cw-${createHash("sha1").update(identity).digest("hex").slice(0, 16)}`;
}

/* ------------------------------------------------------------------ */
/* Public API                                                           */
/* ------------------------------------------------------------------ */

/**
 * Quotes for many vehicles in ONE request.
 *
 * The listings page calls this once with every card on the page. Looping would
 * turn a page render into forty-eight round trips against a rate-limited
 * lender service.
 *
 * Results are keyed by our own Id and never by array position: the API echoes
 * the Id back precisely so that ordering cannot be relied on.
 */
export async function quoteMany(
  vehicles: FinanceVehicleInput[],
  parameters: FinanceParameters = DEFAULT_PARAMETERS,
): Promise<Map<string, VehicleFinance>> {
  const results = new Map<string, VehicleFinance>();

  if (vehicles.length === 0) return results;

  /*
   * NO PAYMENTS WITHOUT A REPRESENTATIVE EXAMPLE.
   *
   * Showing a monthly figure triggers CONC 3.5.3R, and the example that
   * satisfies it is fetched separately — so anything that stops the example
   * arriving (a rate change, a lender leaving the panel, a quote that fails the
   * reconciliation guard) previously left the payments on screen with nothing
   * qualifying them. Verified: with the example unavailable, the homepage
   * rendered 58 unqualified payments.
   *
   * Coupling them in the component that renders each is the version that rots —
   * it works until someone adds a third surface. Coupling them HERE means a
   * payment cannot physically be obtained without an example to sit beside it.
   *
   * Both calls are cached for the same six hours, so this costs one cached
   * fetch, not one per page view.
   */
  if (!(await representativeExample(REPRESENTATIVE_VEHICLE, parameters))) {
    console.error(
      "[codeweavers] no valid representative example — suppressing all " +
        "finance figures rather than showing them unqualified.",
    );
    return results;
  }

  const response = await call(
    buildRequest(vehicles, parameters),
    cacheKeyFor(vehicles, parameters),
  );

  if (!response?.VehicleResults) return results;

  for (const result of response.VehicleResults) {
    results.set(
      result.Id,
      toVehicleFinance(
        result.Id,
        result.FinanceProductResults ?? [],
        parameters.term,
      ),
    );
  }

  return results;
}

/**
 * The profile the representative example is calculated from.
 *
 * SYNTHETIC ON PURPOSE, not a car in the feed. An example pinned to a real
 * vehicle disappears the day that vehicle sells, taking the site's compliance
 * with it — and the FCA's test is that the example represents the agreements
 * the promotion generates, which is a fact about the business rather than about
 * whichever car is still in stock. Mid-price and mid-age for this forecourt;
 * the age is held relative to now so it does not drift into a quote for a
 * fifteen-year-old car.
 */
const REPRESENTATIVE_VEHICLE: FinanceVehicleInput = {
  id: "representative-example",
  price: REPRESENTATIVE_VEHICLE_PRICE,
  mileage: 50000,
  registrationDate: `${new Date().getFullYear() - 5}-01-01`,
};

/** One vehicle. Same path, so failure behaves identically. */
export async function quoteOne(
  vehicle: FinanceVehicleInput,
  parameters: FinanceParameters = DEFAULT_PARAMETERS,
): Promise<VehicleFinance | null> {
  const results = await quoteMany([vehicle], parameters);

  return results.get(vehicle.id) ?? null;
}

/**
 * The representative example for the listings page.
 *
 * A DEDICATED single-vehicle call, deliberately not read off a batch. The API
 * nominates its representative example once per response, so taking it from the
 * listings batch would let a legally required figure change with stock and
 * pagination — and the FCA's test is that the example represents the agreements
 * the promotion generates, which is a fact about the business rather than about
 * whichever car sorted first.
 *
 * The figures are the API's own `RepresentativeExample` object, not assembled
 * from a product result: Codeweavers nominate it, and hand-picking one here
 * would be this site deciding what "representative" means.
 */
export async function representativeExample(
  vehicle: FinanceVehicleInput = REPRESENTATIVE_VEHICLE,
  parameters: FinanceParameters = DEFAULT_PARAMETERS,
): Promise<FinanceQuote | null> {
  const response = await call(
    buildRequest([vehicle], parameters),
    `cw-repex-${cacheKeyFor([vehicle], parameters).slice(3)}`,
  );

  const nominated = response?.RepresentativeExample;

  if (!nominated) {
    console.error("[codeweavers] no representative example returned");
    return null;
  }

  if (nominated.HasError) {
    logProductError("representative-example", nominated);
    return null;
  }

  const quote = toQuote(nominated);

  if (quote && !reconciles(quote)) {
    // Suppressed rather than rendered. A representative example is a regulated
    // statement of figures; publishing one whose arithmetic does not add up is
    // worse than publishing none, and the listings page degrades to showing no
    // payments at all rather than unqualified ones.
    console.error(
      "[codeweavers] representative example does not reconcile — " +
        `schedule ${JSON.stringify(quote.schedule)} plus deposit ${quote.deposit} ` +
        `does not equal total ${quote.totalAmountPayable}. Suppressed.`,
    );
    return null;
  }

  return quote;
}
