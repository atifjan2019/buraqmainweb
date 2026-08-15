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

/**
 * How a stored document can be shown.
 *
 * `image` — a re-encoded JPEG, so a thumbnail exists and the sheet can be
 * pictured. `pdf` — stored exactly as the dealership supplied it, and it can
 * never carry a thumbnail: rasterising a PDF needs Ghostscript or Imagick's PDF
 * delegate, neither of which exists on the CRM's host. A null `thumb` on a PDF
 * is therefore a permanent fact about the format, not a job that failed.
 *
 * A closed two-value union on purpose. It is the only thing the UI branches on,
 * and a closed vocabulary is what stops that branch drifting as the CRM's
 * document list grows.
 */
export type VehicleDocumentFormat = "image" | "pdf";

/**
 * One piece of paperwork the dealership has published for a car — today the
 * Japanese auction sheet and its English translation.
 *
 * Only documents the CRM has explicitly marked public ever reach this site; the
 * API's relation filters on that flag, so a private de-registration paper
 * cannot arrive here by omission.
 *
 * Both URLs point at the CRM's own serving routes and are used directly, never
 * proxied or re-hosted — the same contract `VehicleImage` carries, so replacing
 * a sheet in the CRM changes it here on the next revalidation.
 */
export interface VehicleDocument {
  /**
   * The CRM's machine key, e.g. "auction_sheet_original". An open string, not a
   * union: the CRM's list of kinds grows by a line in a PHP array with no site
   * deploy, so an unrecognised kind must render generically rather than vanish.
   */
  kind: string;
  /** The CRM's own label, printed verbatim. Renaming a kind is a CRM-only change. */
  label: string;
  format: VehicleDocumentFormat;
  /** Null for every PDF — see `VehicleDocumentFormat`. */
  thumb: string | null;
  /** Full-size document. Images open inline; PDFs download. */
  url: string;
  /** Bytes actually served, so the size can be printed beside the link. 0 = unknown. */
  byteSize: number;
}

/**
 * The showroom a car is at. Public showroom identity only — the CRM also holds
 * the branch's address, phone and opening hours, and the API deliberately does
 * not send them here because nothing on this site renders them.
 */
export interface VehicleBranch {
  name: string;
  slug: string;
  city: string;
}

/** A branch offered as a filter, with the number of cars behind it. */
export interface BranchOption extends VehicleBranch {
  count: number;
}

/**
 * A marque in live stock, with the brand logo the CRM holds for it.
 *
 * `name` is the exact `vehicles.make` string and the ONLY value that may be put
 * in a `?make=` link — `displayName` is a prettier spelling for print and must
 * never be used as a filter value. Both logo URLs are null until the dealership
 * uploads artwork, which is the ordinary state, not an error.
 *
 * The logos are absolute URLs on the CRM's own storage, served directly and
 * never proxied — the same contract `VehicleImage` carries, so a logo replaced
 * in the CRM changes here on the next revalidation rather than being pinned to
 * a stale cached copy.
 */
export interface MakerOption {
  name: string;
  slug: string;
  displayName: string;
  /** Mark for light grounds. Null until uploaded. */
  logoUrl: string | null;
  /** Mark for dark grounds. Null falls back to `logoUrl` — see SearchByMaker. */
  logoDarkUrl: string | null;
  count: number;
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
  /** Null when the dealership hasn't allocated the car to a showroom yet. */
  branch: VehicleBranch | null;
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
  /**
   * Published paperwork in the CRM's own order — original sheet first, then the
   * translation. Always an array: the listing endpoint omits the key entirely
   * (no card renders paperwork, so loading it would cost a query per page for
   * nothing), and only the detail endpoint sends it. Consumers must therefore
   * treat an absent key as `[]` rather than as an error, which is what
   * `toDocument` in lib/crm.ts guarantees.
   */
  documents: VehicleDocument[];
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
  /**
   * The same marques as `makes`, with logos and live counts. Empty when the CRM
   * predates the makers feature; `makes` is the fallback and stays authoritative
   * for the filter dropdowns, which take strings and have nowhere to put a logo.
   *
   * Not index-parallel with `makes` — the two arrays are ordered differently
   * (the CRM sorts these by the dealership's own display order first), so they
   * are joined by `name`, never by position.
   */
  makers: MakerOption[];
  /** Only branches that are active AND have stock behind them. */
  branches: BranchOption[];
  fuelTypes: FuelType[];
  transmissions: Transmission[];
  priceRange: { min: number; max: number };
  /** Budget rungs for the two price dropdowns — see `priceLadder`. */
  priceSteps: number[];
}

/** Linear-interpolated quantile of an already-ascending list. */
function quantile(ascending: number[], fraction: number): number {
  const position = (ascending.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.min(ascending.length - 1, lower + 1);

  return (
    ascending[lower] + (ascending[upper] - ascending[lower]) * (position - lower)
  );
}

/** Increments a car is worth quoting in, coarsest last. */
const LADDER_INCREMENTS = [100, 250, 500, 1000, 2000, 2500, 5000, 10000];

/** Rungs to aim for across the core range, before the tail rung. */
const LADDER_TARGET_RUNGS = 7;

/**
 * Round prices for the two budget dropdowns, derived from live stock.
 *
 * Spans the tenth to ninetieth percentile rather than the full range, because
 * min and max are precisely the two numbers a single outlier ruins. A
 * forecourt's dearest car is routinely several times its median, and one
 * £74,999 import among sixty £12k hybrids drags a min-to-max ladder so far up
 * that its lowest rung already excludes four cars in five while its top rungs
 * return one car each — leaving no way to narrow within the band where nearly
 * all the stock actually sits. Percentiles put the rungs where the cars are;
 * the dear ones stay reachable through the coarse tail rung, and through "No
 * maximum", which is the default.
 *
 * Every rung falls strictly inside the real range, so neither dropdown can
 * offer a budget with no stock behind it — the same guarantee the other three
 * filters get by only listing values the CRM reports.
 */
export function priceLadder(prices: number[]): number[] {
  const ascending = prices
    .filter((price) => Number.isFinite(price) && price > 0)
    .sort((a, b) => a - b);

  // One car, or none, cannot be divided into budgets worth offering.
  if (ascending.length < 2) return [];

  const cheapest = ascending[0];
  const dearest = ascending[ascending.length - 1];
  const coreFrom = quantile(ascending, 0.1);
  const coreTo = quantile(ascending, 0.9);

  // The coarsest increment that still divides the core finely enough: a
  // tightly clustered forecourt earns £1,000 rungs and a broad one £5,000,
  // and neither ends up with forty options in a dropdown.
  const increment =
    LADDER_INCREMENTS.find(
      (candidate) => (coreTo - coreFrom) / candidate <= LADDER_TARGET_RUNGS,
    ) ?? LADDER_INCREMENTS[LADDER_INCREMENTS.length - 1];

  const rungs: number[] = [];
  for (
    let rung = Math.ceil(coreFrom / increment) * increment;
    rung <= coreTo;
    rung += increment
  ) {
    if (rung > cheapest && rung < dearest) rungs.push(rung);
  }

  // One coarse rung above the core, so the occasional prestige car stays
  // findable from the "Price from" side without the whole ladder reaching for
  // it. Dropped when the core already runs that high.
  const tailIncrement = increment * 5;
  const tail =
    Math.floor(quantile(ascending, 0.95) / tailIncrement) * tailIncrement;

  if (tail < dearest && tail > (rungs[rungs.length - 1] ?? cheapest)) {
    rungs.push(tail);
  }

  return rungs;
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
/* Empty states                                                      */
/* ---------------------------------------------------------------- */

/** The copy a dead-end stock list shows, and the way back out of it. */
export interface StockEmptyState {
  title: string;
  body: string;
  action?: { label: string; href: string };
}

/**
 * Which dead end an empty list actually is.
 *
 * Three different things produce no cards, and they need three different
 * sentences. The one that used to be wrong is the first: `?page=99` on a
 * forecourt that has cars came back empty and was read as "no stock", so a
 * visitor who over-clicked was told new stock was on its way while thirteen
 * cars sat one page behind them. The paginator still reports the real total on
 * an out-of-range page, which is what separates the cases.
 *
 * `firstPageHref` carries the current filters, so recovering from a bad page
 * number does not silently drop the search as well.
 */
export function stockEmptyState(
  meta: PageMeta,
  hasActiveFilters: boolean,
  firstPageHref: string,
): StockEmptyState {
  if (meta.total > 0) {
    return {
      title: "That page doesn't exist",
      body:
        meta.total === 1
          ? "There's one car in this search, and it's on the first page."
          : `There are ${meta.total} cars in this search, but not that many pages of them.`,
      action: { label: "Back to the first page", href: firstPageHref },
    };
  }

  if (hasActiveFilters) {
    return {
      title: "Nothing matches that combination",
      body: "Try widening your search, or clear the filters to see everything we have in right now.",
      action: { label: "Clear filters", href: "/cars" },
    };
  }

  return {
    title: "New stock is on its way",
    body: "Our next vehicles are being prepared and checked. Get in touch and we'll let you know the moment they land.",
  };
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

/** "77,787 miles" — for running text, where the unit has to be carried. */
export function formatMileage(value: number): string {
  return `${miles.format(value)} miles`;
}

/**
 * "77,787" — the same number with the unit dropped.
 *
 * For spec cells, where the label underneath already reads MILEAGE and
 * repeating the unit in the value says the same thing twice. Kept as its own
 * export rather than a flag on `formatMileage`, so a call site reads as the
 * thing it wants instead of as a boolean.
 */
export function formatMileageValue(value: number): string {
  return miles.format(value);
}

/**
 * "471 KB", "1.1 MB" — the weight of a document, for the caption beside a link
 * that downloads it.
 *
 * Binary units, matching what the visitor's own operating system will report
 * once the file is saved: a sheet listed here as 1.1 MB and shown as 1.2 MB in
 * their downloads folder reads as a discrepancy on a page whose entire job is
 * being trustworthy about this car.
 *
 * Returns null rather than "0 KB" for a missing or nonsensical size, so the
 * caller drops the segment instead of printing a number it does not have.
 */
export function formatFileSize(bytes: number): string | null {
  if (!Number.isFinite(bytes) || bytes <= 0) return null;
  if (bytes < 1024) return `${Math.round(bytes)} B`;

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) return `${Math.round(kilobytes)} KB`;

  // One decimal from a megabyte up: "1.1 MB" is a size, "1.148 MB" is a
  // measurement, and nobody choosing whether to tap a link wants the latter.
  return `${(kilobytes / 1024).toFixed(1)} MB`;
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
