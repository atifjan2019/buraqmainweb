/**
 * Vehicle domain types and presentation helpers.
 *
 * Stock is owned by the Burraq Motors CRM and read through `lib/crm.ts`. This
 * module deliberately holds only the shape that data arrives in plus the
 * formatting the UI needs, so Client Components can import it without pulling
 * the server-only CRM client — and the enquiry API key — into the browser
 * bundle.
 *
 * The CRM also stores purchase price, prep cost and margin. Those are internal
 * commercial figures, are not exposed by the API, and must never gain fields
 * here. `price` is the only money the public site is allowed to know about.
 */

export type FuelType = "Petrol" | "Diesel" | "Hybrid" | "Electric";
export type Transmission = "Manual" | "Automatic";

/**
 * Sold vehicles are filtered out by the API, so they can never reach the site.
 * Reserved cars still show — they're worth an enquiry — but carry a badge.
 */
export type VehicleStatus = "in_stock" | "reserved";

export interface Vehicle {
  /**
   * Canonical SEO slug, owned by the CRM — e.g.
   * "2021-tesla-model-3-standard-range-plus-lt21vhx". This is the URL.
   *
   * Never derive it here. Only the trailing plate identifies the car; the words
   * before it are cosmetic, so the CRM can restyle a slug when staff correct a
   * model name and old links keep resolving. A second implementation on this
   * side would drift the moment either algorithm changed, breaking every
   * indexed and shared link.
   */
  slug: string;
  /**
   * As held in the CRM, e.g. "MA71 KGV". Still the human-facing identifier —
   * plate badge, spec table, and the enquiry payload — but no longer the URL.
   */
  registration: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  /** Price in GBP. */
  price: number;
  fuelType: FuelType;
  transmission: Transmission;
  color: string;
  description: string | null;
  status: VehicleStatus;
  isFeatured: boolean;
  /** ISO date (YYYY-MM-DD), or null when the CRM has nothing recorded. */
  motExpiry: string | null;
  serviceDue: string | null;
}

/** The subset of Laravel's paginator `meta` block the UI actually uses. */
export interface PageMeta {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
}

export interface VehiclePage {
  vehicles: Vehicle[];
  meta: PageMeta;
}

/**
 * Values that currently have stock behind them. Every filter control is built
 * from this, which is what guarantees no filter can produce an empty page.
 */
export interface StockFilters {
  makes: string[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  priceRange: { min: number; max: number };
}

/* ---------------------------------------------------------------- */
/* URLs                                                              */
/* ---------------------------------------------------------------- */

/**
 * The canonical detail URL, straight from the API's slug.
 *
 * There is deliberately no slug-building helper here — see `Vehicle.slug`.
 */
export function vehicleHref(vehicle: Vehicle): string {
  return `/cars/${vehicle.slug}`;
}

/* ---------------------------------------------------------------- */
/* Formatting helpers                                               */
/* ---------------------------------------------------------------- */

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return gbp.format(value);
}

const miles = new Intl.NumberFormat("en-GB");

export function formatMileage(value: number): string {
  return `${miles.format(value)} miles`;
}

/* Dates arrive as plain YYYY-MM-DD, so they're formatted in UTC — reading them
 * in a western timezone would otherwise roll them back a day. */
const fullDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats an ISO date, or returns null for missing and unparseable values. */
export function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : fullDate.format(parsed);
}

export function vehicleTitle(vehicle: Vehicle): string {
  return `${vehicle.make} ${vehicle.model}`;
}

/** e.g. "2021 BMW 3 Series 320d M Sport" — the full headline for a car. */
export function vehicleHeadline(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicleTitle(vehicle)}`;
}
