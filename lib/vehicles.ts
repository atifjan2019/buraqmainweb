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
  /** As held in the CRM, e.g. "MA71 KGV". Unique, and this car's identity. */
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
/* Registrations and URLs                                            */
/* ---------------------------------------------------------------- */

/**
 * Turns "MA71 KGV" into "ma71kgv" for the URL. The API resolves registrations
 * ignoring case and spacing, so the slug round-trips without a lookup table.
 */
export function vehicleSlug(registration: string): string {
  return registration.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

export function vehicleHref(vehicle: Vehicle): string {
  return `/cars/${vehicleSlug(vehicle.registration)}`;
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
