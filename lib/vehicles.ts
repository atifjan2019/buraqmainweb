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

/**
 * One photograph, in the three sizes the CRM renders. All absolute URLs on the
 * CRM's own storage — they are served directly and never proxied or re-hosted,
 * so replacing a photo in the CRM changes it on the site immediately.
 */
export interface VehicleImage {
  /** 400px — listing cards and the gallery strip. */
  thumb: string;
  /** 1200px — the detail page's main image. */
  display: string;
  /** 2000px — lightbox only. Never put this in a grid. */
  full: string;
  /** Year, make and model, as the CRM writes it. */
  alt: string;
}

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
  /**
   * The hero shot the dealership picked, or null when the car has not been
   * photographed yet. Stock is routinely listed before the photographer sees
   * it, so null is an ordinary state that must render a placeholder — never a
   * broken image, never an error.
   */
  featuredImage: VehicleImage | null;
  /** Full gallery in CRM order, featured first. Empty until photographed. */
  images: VehicleImage[];
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
 *
 * The fallback is not a second slug algorithm: the bare plate is a form the API
 * documents and accepts, and the detail page will 308 it on to the canonical
 * URL. It only exists so a slug missing from the API degrades to a working link
 * rather than putting `/cars/undefined` in the stock grid.
 */
export function vehicleHref(vehicle: Vehicle): string {
  const identifier = vehicle.slug || encodeURIComponent(vehicle.registration);
  return `/cars/${identifier}`;
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

/* ---------------------------------------------------------------- */
/* Description                                                       */
/* ---------------------------------------------------------------- */

/**
 * Labels the detail page already shows for itself — as a spec tile, in the
 * headline, or as the price. `Engine` and `Body Style` are deliberately absent:
 * they have no tile, so those lines are the only place that detail appears.
 */
const DUPLICATED_SPEC =
  /^\s*(make|model|year|mileage|fuel\s*type|fuel|transmission|gearbox|colou?r|price|registration|reg)\s*:/i;

/** A heading that introduces the list and reads as a stray line once it's cut. */
const SPEC_HEADING = /^\s*vehicle\s+details\s*:?\s*$/i;

/**
 * Strips the spec list that the imported descriptions repeat verbatim.
 *
 * Some of this stock was migrated from the previous site, where the copy was
 * written as a paragraph followed by `Make: … Model: … Year: …`. Every one of
 * those labels is already on the detail page, so reprinting them pushes the
 * genuinely useful part — the equipment list and the condition notes — further
 * down for no gain. About a fifth of the current descriptions carry the block;
 * the rest are prose plus a features list and pass through untouched.
 *
 * `Condition:` and `Engine:` deliberately survive. They read as spec lines but
 * appear nowhere else on the page, so dropping them would lose information
 * rather than repeat it.
 */
export function descriptionBody(description: string | null): string {
  if (!description) return "";

  return description
    .split("\n")
    .filter((line) => !DUPLICATED_SPEC.test(line) && !SPEC_HEADING.test(line))
    .join("\n")
    // Removing interior lines leaves runs of blanks behind.
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Enough characters to be worth reading before deciding to open the rest.
 * Most of these descriptions open with a one-line headline, so taking only the
 * first paragraph would show the car's name and hide every actual word about
 * it — paragraphs are taken until this is met instead.
 */
const LEAD_TARGET = 320;

/**
 * Not worth a toggle. Folding away two lines makes the reader click to save
 * themselves nothing, so anything this short simply stays open.
 */
const MIN_WORTH_FOLDING = 200;

/**
 * Splits the description into an opening the page always shows and a remainder
 * it can fold away. `rest` is empty when there is nothing worth hiding, in
 * which case the whole description renders as the lead.
 */
export function splitDescription(description: string | null): {
  lead: string;
  rest: string;
} {
  const body = descriptionBody(description);
  if (!body) return { lead: "", rest: "" };

  const paragraphs = body.split(/\n{2,}/);
  const lead: string[] = [];
  let taken = 0;

  while (paragraphs.length > 0 && taken < LEAD_TARGET) {
    const next = paragraphs.shift() as string;
    lead.push(next);
    taken += next.length;
  }

  const rest = paragraphs.join("\n\n").trim();

  return rest.length < MIN_WORTH_FOLDING
    ? { lead: [...lead, rest].join("\n\n").trim(), rest: "" }
    : { lead: lead.join("\n\n").trim(), rest };
}

/** e.g. "2021 BMW 3 Series 320d M Sport" — the full headline for a car. */
export function vehicleHeadline(vehicle: Vehicle): string {
  return `${vehicle.year} ${vehicleTitle(vehicle)}`;
}
