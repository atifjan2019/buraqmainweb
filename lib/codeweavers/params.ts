import type { FinanceParameters, FinanceVehicleInput } from "./types";
import type { Vehicle } from "../vehicles";

/**
 * The assumptions every quote on this site is calculated from, and the bounds
 * the customer-facing controls move between.
 *
 * These are the dealership's own defaults, confirmed against the figures they
 * verified with Codeweavers directly. They are NOT derived from the API's
 * `FinanceOptions` block, which this account returns as all zeros — using it
 * would collapse every control to a single value of nothing.
 */
export const DEFAULT_PARAMETERS: FinanceParameters = {
  deposit: 10,
  depositType: "Percentage",
  term: 60,
  annualMileage: 10000,
};

/** Terms the lender panel actually quotes. The API shortens where it must. */
export const TERM_OPTIONS = [24, 36, 48, 60] as const;

export const MILEAGE_OPTIONS = [5000, 8000, 10000, 12000, 15000, 20000] as const;

export const MIN_DEPOSIT_PERCENT = 0;
export const MAX_DEPOSIT_PERCENT = 50;

/**
 * The car the representative example is calculated from.
 *
 * A DELIBERATE, STABLE CHOICE rather than whatever a batch happens to nominate.
 * The API sets its representative example on one arbitrary result per response,
 * so deriving the listings page example from the batch would make the legally
 * required figures change as stock and pagination changed — and the FCA rule is
 * that the example is representative of the agreements the promotion generates,
 * which is a business fact, not a side effect of sort order.
 *
 * Mid-price, mid-age, and it quotes reliably. If it sells, this falls back to
 * the median of live stock rather than breaking — see representativeVehicle().
 */
export const REPRESENTATIVE_VEHICLE_PRICE = 12600;

/**
 * A full registration date for a car the CRM only records a year for.
 *
 * THE CRM HAS NO REGISTRATION DATE COLUMN — not for some stock, for any of it.
 * Codeweavers require a full date and refuse to quote without one, and vehicle
 * age directly decides both eligibility and maximum term.
 *
 * January is the conservative end of the year: it makes the car as old as the
 * year allows, so a quote that comes back is one the lender would still honour
 * against the real date. Erring the other way would surface payments on cars
 * the lender then declines, which is worse than a payment that is slightly
 * pessimistic.
 *
 * The cost is real and worth stating: a car registered in September looks eight
 * months older than it is, and on this stock that pushes about half the
 * forecourt past the lender's age cap. The fix is a registration_date column in
 * the CRM, populated from the V5C.
 */
export function registrationDate(vehicle: Pick<Vehicle, "year">): string {
  return `${vehicle.year}-01-01`;
}

/**
 * A UK plate, or nothing.
 *
 * The CRM's `registration` column is free text and does not hold what its name
 * promises: live stock includes a car whose registration is the string "2019",
 * a year typed into the plate field. Only 2 of 48 vehicles carry a real plate —
 * the rest are Japanese imports that never had one.
 *
 * Sending junk as `IdentifierType: "VRM"` asks the lender to price a car by a
 * plate that does not exist, so anything that is not plate-shaped is dropped
 * and the quote goes through on price, mileage and age alone, which the API
 * accepts.
 *
 * Deliberately permissive about spacing and case, and deliberately strict about
 * shape: current-style (AB12 CDE), prefix (A123 BCD) and suffix (ABC 123D).
 */
const UK_VRM =
  /^(?:[A-Z]{2}[0-9]{2}[A-Z]{3}|[A-Z][0-9]{1,3}[A-Z]{3}|[A-Z]{3}[0-9]{1,3}[A-Z])$/;

export function normaliseVrm(registration: string | null | undefined): string | undefined {
  if (!registration) return undefined;

  const compact = registration.replace(/\s+/g, "").toUpperCase();

  return UK_VRM.test(compact) ? compact : undefined;
}

/** A site vehicle, as the finance module wants it. */
export function toFinanceInput(vehicle: Vehicle): FinanceVehicleInput {
  return {
    id: vehicle.slug,
    price: vehicle.price,
    mileage: vehicle.mileage,
    registrationDate: registrationDate(vehicle),
    vrm: normaliseVrm(vehicle.registration),
  };
}

/** Codeweavers' product keys, in the dealership's own words. */
export function productName(key: string): string {
  switch (key) {
    case "CS":
      return "Conditional Sale";
    case "PCP":
      return "Personal Contract Purchase";
    case "HP":
      return "Hire Purchase";
    case "LP":
      return "Lease Purchase";
    default:
      return key;
  }
}

/**
 * "&#163;10.00" becomes "£10.00".
 *
 * The API returns fee text HTML-escaped. It is rendered as TEXT, never as
 * markup, so the entities have to be resolved here rather than by the browser.
 * Only the handful the API actually emits are handled — a general HTML decoder
 * would be a larger surface for no gain on a string we control the source of.
 */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16)),
    )
    .replace(/&pound;/g, "£")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Two decimal places, always. The only arithmetic this feature performs. */
export function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
