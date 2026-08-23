/**
 * Client for the Burraq Motors CRM API — the source of truth for stock and the
 * destination for enquiries. The CRM is a separate Laravel app; this site only
 * reads from it and posts leads to it.
 *
 * `server-only` makes importing this from a Client Component a build error.
 * That matters: FRONTEND_API_KEY authenticates writes into the dealership's
 * sales pipeline, so it must never be bundled for the browser. Anything the UI
 * needs on both sides of the boundary lives in `lib/vehicles.ts` instead.
 */

import "server-only";

import { toPost, toPostSummary } from "./posts";
import type {
  Post,
  PostPage,
  PostSummary,
  RawPost,
  RawPostSummary,
} from "./posts";
import { toReviewsPayload } from "./reviews";
import type { RawReviewsResponse, ReviewsPayload } from "./reviews";
import { priceLadder } from "./vehicles";
import type {
  FuelType,
  StockFilters,
  Transmission,
  Vehicle,
  VehicleBranch,
  VehicleDocument,
  VehicleDocumentFormat,
  VehicleImage,
  VehiclePage,
  VehicleStatus,
} from "./vehicles";

const BASE_URL = (
  process.env.CRM_API_URL ?? "https://crm.burraqmotors.co.uk/api/v1"
).replace(/\/+$/, "");

/**
 * Stock does not change second to second, and the CRM rate-limits reads at
 * 120/min. Two minutes keeps pages fresh enough while leaving huge headroom.
 */
const READ_REVALIDATE_SECONDS = 120;

/** Cache tag for every stock read, so it can all be dropped in one call. */
export const VEHICLES_CACHE_TAG = "crm-vehicles";

/**
 * Reviews change at the pace of customers, and the CRM refreshes its own cache
 * hourly, so re-asking more often than a quarter of an hour cannot produce
 * newer data — it only spends the CRM's 120/min read budget.
 */
const REVIEWS_REVALIDATE_SECONDS = 900;

/**
 * Cache tag for review reads, separate from stock so one can be dropped
 * without dropping the other.
 */
export const REVIEWS_CACHE_TAG = "crm-reviews";

/**
 * A blog changes at the pace of someone sitting down to write, which is far
 * slower than stock turns over. Five minutes still makes a freshly published
 * article visible while the author is still looking at the tab, and leaves the
 * CRM's 120/min read budget effectively untouched.
 */
const POSTS_REVALIDATE_SECONDS = 300;

/** Cache tag for post reads, separate from stock and reviews. */
export const POSTS_CACHE_TAG = "crm-posts";

/** Thrown when the CRM answers with a non-2xx status, or can't be reached. */
export class CrmError extends Error {
  /** HTTP status, or 0 when the request never got a response. */
  readonly status: number;

  constructor(message: string, status: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "CrmError";
    this.status = status;
  }
}

/* ---------------------------------------------------------------- */
/* Wire format                                                       */
/* ---------------------------------------------------------------- */

/** One image as the API sends it. Every field is treated as untrusted. */
interface RawImage {
  thumb?: string | null;
  display?: string | null;
  full?: string | null;
  alt?: string | null;
}

/** One published document as the API sends it. Every field is untrusted. */
interface RawDocument {
  kind?: string | null;
  label?: string | null;
  format?: string | null;
  thumb?: string | null;
  url?: string | null;
  byte_size?: number | null;
}

/** A vehicle exactly as the API sends it, before camel-casing. */
interface RawVehicle {
  slug: string;
  registration: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  fuel_type: string;
  transmission: string;
  color: string;
  description: string | null;
  status: string;
  is_featured: boolean;
  mot_expiry: string | null;
  service_due: string | null;
  featured_image?: RawImage | null;
  images?: RawImage[] | null;
  /**
   * Public paperwork. Sent by the detail endpoint only — the listing endpoint
   * omits the key entirely, which is why this is optional rather than an array
   * the site can assume is there.
   */
  documents?: RawDocument[] | null;
  branch?: {
    name?: string | null;
    slug?: string | null;
    city?: string | null;
  } | null;
}

/**
 * Rejects any image missing a size, so a half-populated record renders the
 * placeholder rather than a broken `<img>`. `alt` falls back to the car's own
 * description — never "car photo", which helps neither screen readers nor
 * search engines.
 */
function toImage(
  raw: RawImage | null | undefined,
  fallbackAlt: string,
): VehicleImage | null {
  if (!raw?.thumb || !raw.display || !raw.full) return null;

  return {
    thumb: raw.thumb,
    display: raw.display,
    full: raw.full,
    alt: raw.alt?.trim() || fallbackAlt,
  };
}

/**
 * Rejects a branch missing its name or slug, so a half-populated record renders
 * no badge rather than an empty chip or a link to `/cars?branch=undefined`.
 */
function toBranch(raw: RawVehicle["branch"]): VehicleBranch | null {
  if (!raw?.name?.trim() || !raw.slug?.trim()) return null;

  return {
    name: raw.name.trim(),
    slug: raw.slug.trim(),
    city: raw.city?.trim() ?? "",
  };
}

/**
 * Rejects a document that can neither be opened nor titled, so a half-populated
 * row is dropped rather than rendered as an unlabelled dead link on the one
 * section of the page whose whole purpose is being credible.
 *
 * `format` is narrowed to "pdf" only on an exact match and defaults to "image"
 * for everything else, including a value this build has never heard of. A CRM
 * that grows a third format must degrade to a picture — which either renders or
 * shows nothing — rather than to a download affordance claiming to be a PDF.
 *
 * An image with no thumbnail falls back to the full document. That pulls a
 * 2400px JPEG into a ~400px box, which is wasteful, but a legible sheet at the
 * wrong size beats no evidence at all. It should never happen: the CRM writes a
 * thumbnail for every image it stores.
 */
function toDocument(raw: RawDocument | null | undefined): VehicleDocument | null {
  const url = raw?.url?.trim();
  const label = raw?.label?.trim();

  if (!url || !label) return null;

  const format: VehicleDocumentFormat = raw?.format === "pdf" ? "pdf" : "image";
  const size = Number(raw?.byte_size);

  return {
    kind: raw?.kind?.trim() ?? "",
    label,
    format,
    // A PDF's thumbnail is null by contract and must not fall back to `url` —
    // that would put the PDF's own bytes in an <img>, which is the broken grey
    // box the PDF affordance exists to avoid.
    thumb: format === "pdf" ? null : raw?.thumb?.trim() || url,
    url,
    // A zero simply suppresses the size caption; it never prints "0 KB".
    byteSize: Number.isFinite(size) && size > 0 ? size : 0,
  };
}

interface RawPaginator<T> {
  data: T[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
  };
}

/**
 * The documented enums are passed through as-is. If the CRM ever adds a value
 * (a "Plug-in Hybrid", say) it still renders correctly — the cast only affects
 * compile-time narrowing, never runtime behaviour.
 */
function toVehicle(raw: RawVehicle): Vehicle {
  const fallbackAlt = `${raw.year} ${raw.make} ${raw.model}`;

  const images = (raw.images ?? [])
    .map((image) => toImage(image, fallbackAlt))
    .filter((image): image is VehicleImage => image !== null);

  // The API sends the featured shot as `images[0]` too, but falling back to the
  // gallery keeps a car with photos visible even if that field is ever absent.
  const featuredImage = toImage(raw.featured_image, fallbackAlt) ?? images[0] ?? null;

  // Kept in the CRM's order — original sheet, then translation. The site never
  // re-sorts: the dealership decides which document leads, and a second
  // ordering rule here would drift from the one the CRM enforces.
  const documents = (raw.documents ?? [])
    .map(toDocument)
    .filter((document): document is VehicleDocument => document !== null);

  return {
    featuredImage,
    images,
    documents,
    slug: raw.slug,
    registration: raw.registration,
    make: raw.make,
    model: raw.model,
    year: raw.year,
    mileage: raw.mileage,
    price: raw.price,
    fuelType: raw.fuel_type as FuelType,
    transmission: raw.transmission as Transmission,
    color: raw.color,
    description: raw.description,
    status: raw.status as VehicleStatus,
    isFeatured: raw.is_featured,
    branch: toBranch(raw.branch),
    motExpiry: raw.mot_expiry,
    serviceDue: raw.service_due,
  };
}

/* ---------------------------------------------------------------- */
/* Reads (no API key required)                                       */
/* ---------------------------------------------------------------- */

/**
 * How one read is cached. `cacheComponents` is not enabled in `next.config.ts`,
 * so `next: { revalidate, tags }` on the fetch itself is the current model —
 * confirmed against
 * `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`.
 */
interface ReadCache {
  revalidate: number;
  tags: string[];
}

const STOCK_CACHE: ReadCache = {
  revalidate: READ_REVALIDATE_SECONDS,
  tags: [VEHICLES_CACHE_TAG],
};

async function readJson<T>(
  path: string,
  search?: URLSearchParams,
  cache: ReadCache = STOCK_CACHE,
): Promise<T> {
  const query = search?.toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: cache.revalidate,
        tags: cache.tags,
      },
    });
  } catch (cause) {
    throw new CrmError(`Could not reach the CRM for ${path}`, 0, { cause });
  }

  if (!response.ok) {
    throw new CrmError(
      `CRM responded ${response.status} for ${path}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

export interface VehicleQuery {
  make?: string;
  /** Branch slug, as emitted by the API. */
  branch?: string;
  fuelType?: string;
  transmission?: string;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  /** Clamped to the API's supported 1–50. */
  perPage?: number;
}

export const DEFAULT_PER_PAGE = 12;

function buildVehicleSearch(query: VehicleQuery): URLSearchParams {
  const search = new URLSearchParams();

  if (query.make) search.set("make", query.make);
  if (query.branch) search.set("branch", query.branch);
  if (query.fuelType) search.set("fuel_type", query.fuelType);
  if (query.transmission) search.set("transmission", query.transmission);
  if (query.featured) search.set("featured", "true");
  if (query.minPrice !== undefined) {
    search.set("min_price", String(query.minPrice));
  }
  if (query.maxPrice !== undefined) {
    search.set("max_price", String(query.maxPrice));
  }

  const perPage = clamp(query.perPage ?? DEFAULT_PER_PAGE, 1, 50);
  search.set("per_page", String(perPage));
  search.set("page", String(Math.max(1, query.page ?? 1)));

  return search;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Published, unsold stock. Featured cars sort first, then the CRM's own order.
 *
 * @throws {CrmError} if the CRM is unreachable or errors.
 */
export async function getVehicles(
  query: VehicleQuery = {},
): Promise<VehiclePage> {
  const payload = await readJson<RawPaginator<RawVehicle>>(
    "/vehicles",
    buildVehicleSearch(query),
  );

  const vehicles = (payload.data ?? []).map(toVehicle);
  const meta = payload.meta ?? {};

  return {
    vehicles,
    meta: {
      currentPage: meta.current_page ?? 1,
      lastPage: meta.last_page ?? 1,
      perPage: meta.per_page ?? vehicles.length,
      total: meta.total ?? vehicles.length,
    },
  };
}

/**
 * The API caps a page at 50, so anything that needs the whole forecourt has to
 * walk it. The ceiling is a guard against a paginator that never reports a last
 * page, not an expected depth — 1,000 cars is far beyond this dealership.
 */
const MAX_STOCK_PAGES = 20;

/**
 * Every published car, paginator followed to its last page.
 *
 * Asking for a single page of 50 was right while the forecourt was smaller than
 * that, and silently truncated the caller the moment it wasn't — the sitemap
 * quietly dropped every car past the fiftieth. A failed page throws rather than
 * returning a short list, because a caller cannot tell "all of them" from "the
 * first two pages" otherwise.
 *
 * @throws {CrmError} if the CRM is unreachable or errors.
 */
export async function getAllVehicles(): Promise<Vehicle[]> {
  const vehicles: Vehicle[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const payload = await readJson<RawPaginator<RawVehicle>>(
      "/vehicles",
      buildVehicleSearch({ perPage: 50, page }),
    );

    for (const raw of payload.data ?? []) vehicles.push(toVehicle(raw));

    lastPage = payload.meta?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage && page <= MAX_STOCK_PAGES);

  return vehicles;
}

/**
 * Cars flagged as featured in the CRM, for the homepage.
 *
 * Degrades to an empty list rather than throwing: a CRM outage should cost the
 * homepage one section, not the whole page.
 */
export async function getFeaturedVehicles(limit = 6): Promise<Vehicle[]> {
  try {
    const { vehicles } = await getVehicles({ featured: true, perPage: limit });
    return vehicles;
  } catch (error) {
    console.error("[crm] featured vehicles unavailable", error);
    return [];
  }
}

/**
 * A single car by canonical slug *or* bare registration — the API accepts
 * either, ignoring case and spacing, and only the trailing plate selects the
 * car. So whatever is in the URL is forwarded verbatim and the API decides.
 *
 * `encodeURIComponent` is what keeps a crafted path segment (`../`, an
 * embedded `?`) from escaping into a different upstream endpoint.
 *
 * Returns null for 404 — the car has been sold or unpublished, which is an
 * expected outcome rather than a failure. Other errors still throw.
 */
export async function getVehicle(
  slugOrRegistration: string,
): Promise<Vehicle | null> {
  try {
    const payload = await readJson<{ data: RawVehicle }>(
      `/vehicles/${encodeURIComponent(slugOrRegistration)}`,
    );
    return toVehicle(payload.data);
  } catch (error) {
    if (error instanceof CrmError && error.status === 404) return null;
    throw error;
  }
}

/**
 * A page of stock is capped at 50 by the API, so a forecourt is walked rather
 * than asked for in one go. The ceiling is a guard against a paginator that
 * never reports a last page, not an expected depth — 200 cars is already well
 * beyond this dealership.
 */
const MAX_PRICE_PAGES = 4;

/**
 * Every live price, for the budget ladder.
 *
 * The filters endpoint reports only min and max, which is exactly the pair one
 * outlier ruins, so the ladder is built from the real spread instead. These
 * reads carry the same tag and revalidation window as every other stock read,
 * so between revalidations they cost nothing.
 */
async function getStockPrices(): Promise<number[]> {
  const prices: number[] = [];
  let page = 1;
  let lastPage = 1;

  do {
    const payload = await readJson<RawPaginator<RawVehicle>>(
      "/vehicles",
      buildVehicleSearch({ perPage: 50, page }),
    );

    for (const raw of payload.data ?? []) {
      const price = Number(raw.price);
      if (Number.isFinite(price) && price > 0) prices.push(price);
    }

    lastPage = payload.meta?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage && page <= MAX_PRICE_PAGES);

  return prices;
}

/**
 * Dropdown values that currently have stock behind them.
 *
 * @throws {CrmError} if the CRM is unreachable or errors.
 */
export async function getStockFilters(): Promise<StockFilters> {
  const payload = await readJson<{
    data: {
      makes?: string[];
      /**
       * The marques again, carrying the logos the CRM's Makers page holds.
       * Optional on the wire on purpose: `makes` is the frozen compatibility
       * surface, and a CRM that predates the makers feature simply omits this.
       */
      makers?: {
        name?: string;
        slug?: string;
        display_name?: string;
        logo_url?: string | null;
        logo_dark_url?: string | null;
        count?: number;
      }[];
      branches?: {
        name?: string;
        slug?: string;
        city?: string;
        count?: number;
      }[];
      fuel_types?: string[];
      transmissions?: string[];
      price_range?: { min?: number; max?: number };
    };
  }>("/vehicles/filters");

  const data = payload.data ?? {};

  // The ladder is the one filter built from a second read, so it degrades on
  // its own: an empty ladder disables the two budget dropdowns and leaves
  // make, fuel and gearbox working, rather than costing the visitor all five.
  let priceSteps: number[] = [];
  try {
    priceSteps = priceLadder(await getStockPrices());
  } catch (error) {
    console.error("[crm] price ladder unavailable", error);
  }

  return {
    makes: data.makes ?? [],
    // Same defensive shape as `branches` below: every field is untrusted, and a
    // marque with no name can neither be printed nor linked to, so it is dropped
    // rather than rendered as a dead tile. `|| null` rather than `?? null` on the
    // logos, so an empty-string URL becomes null instead of an `<img src="">`
    // that re-requests the current page.
    makers: (data.makers ?? [])
      .map((maker) => ({
        name: maker.name?.trim() ?? "",
        slug: maker.slug?.trim() ?? "",
        displayName: maker.display_name?.trim() || maker.name?.trim() || "",
        logoUrl: maker.logo_url?.trim() || null,
        logoDarkUrl: maker.logo_dark_url?.trim() || null,
        count: Number.isFinite(maker.count) ? Number(maker.count) : 0,
      }))
      .filter((maker) => maker.name),
    // A branch with no name or no slug can neither be printed nor linked to,
    // so it is dropped rather than offered as a dead option.
    branches: (data.branches ?? [])
      .map((branch) => ({
        name: branch.name?.trim() ?? "",
        slug: branch.slug?.trim() ?? "",
        city: branch.city?.trim() ?? "",
        count: Number.isFinite(branch.count) ? Number(branch.count) : 0,
      }))
      .filter((branch) => branch.name && branch.slug),
    fuelTypes: (data.fuel_types ?? []) as FuelType[],
    transmissions: (data.transmissions ?? []) as Transmission[],
    priceRange: {
      min: data.price_range?.min ?? 0,
      max: data.price_range?.max ?? 0,
    },
    priceSteps,
  };
}

/* ---------------------------------------------------------------- */
/* Reviews (no API key required)                                     */
/* ---------------------------------------------------------------- */

/**
 * Google and Trustpilot reviews, as cached and moderated by the CRM.
 *
 * The dealership's provider credentials live in the CRM and never leave it:
 * the CRM calls Google and Trustpilot server-side, caches what comes back, and
 * publishes only the reviews staff have left visible. This site reads that
 * cache exactly as it reads stock, and has no idea a credential exists.
 *
 * Degrades to `null` rather than throwing — the same contract
 * `getFeaturedVehicles` already has, and the input `pickTestimonials` needs to
 * fall back to the hardcoded quotes. A CRM outage, a CRM too old to have the
 * endpoint (404), or a malformed body all land here and all cost the homepage
 * nothing but the live data.
 */
export async function getReviews(limit = 6): Promise<ReviewsPayload | null> {
  const search = new URLSearchParams({
    per_page: String(clamp(limit, 1, 50)),
  });

  try {
    const payload = await readJson<RawReviewsResponse>("/reviews", search, {
      revalidate: REVIEWS_REVALIDATE_SECONDS,
      tags: [REVIEWS_CACHE_TAG],
    });

    return toReviewsPayload(payload);
  } catch (error) {
    console.error("[crm] reviews unavailable", error);
    return null;
  }
}

/* ---------------------------------------------------------------- */
/* Blog posts (no API key required)                                  */
/* ---------------------------------------------------------------- */

const POSTS_CACHE: ReadCache = {
  revalidate: POSTS_REVALIDATE_SECONDS,
  tags: [POSTS_CACHE_TAG],
};

/** Matches the CRM endpoint's own default. Three rows of three. */
export const DEFAULT_POSTS_PER_PAGE = 9;

export interface PostQuery {
  page?: number;
  /** Clamped to the API's supported 1–50. */
  perPage?: number;
}

/**
 * A page of published articles, newest first.
 *
 * There is no status parameter, here or upstream: the endpoint returns
 * published posts and nothing else, so there is no string this site could send
 * that would reach a draft or a post scheduled for a future date.
 *
 * @throws {CrmError} if the CRM is unreachable or errors.
 */
export async function getPosts(query: PostQuery = {}): Promise<PostPage> {
  const search = new URLSearchParams({
    per_page: String(clamp(query.perPage ?? DEFAULT_POSTS_PER_PAGE, 1, 50)),
    page: String(Math.max(1, query.page ?? 1)),
  });

  const payload = await readJson<RawPaginator<RawPostSummary>>(
    "/posts",
    search,
    POSTS_CACHE,
  );

  const posts = (payload.data ?? [])
    .map(toPostSummary)
    .filter((post): post is PostSummary => post !== null);

  const meta = payload.meta ?? {};

  return {
    posts,
    meta: {
      currentPage: meta.current_page ?? 1,
      lastPage: meta.last_page ?? 1,
      perPage: meta.per_page ?? posts.length,
      total: meta.total ?? posts.length,
    },
  };
}

/**
 * One article by slug.
 *
 * Returns null for 404 — which is what a draft, a scheduled post, a deleted
 * one and a slug that never existed all look like from here. The API makes
 * them deliberately indistinguishable, and so does this: the page turns any of
 * them into a real 404, never into an empty shell. Other errors still throw,
 * so "the CRM is down" stays distinguishable from "there is no such article".
 *
 * `encodeURIComponent` is what keeps a crafted path segment (`../`, an embedded
 * `?`) from escaping into a different upstream endpoint — the `getVehicle` rule.
 */
export async function getPost(slug: string): Promise<Post | null> {
  try {
    const payload = await readJson<{ data: RawPost }>(
      `/posts/${encodeURIComponent(slug)}`,
      undefined,
      POSTS_CACHE,
    );
    return toPost(payload.data);
  } catch (error) {
    if (error instanceof CrmError && error.status === 404) return null;
    throw error;
  }
}

/**
 * The newest few articles, for the homepage band.
 *
 * Degrades to an empty list rather than throwing — the same contract
 * `getFeaturedVehicles` has, and the input `RecentPosts` needs to return null
 * and disappear. A CRM outage, or a CRM too old to have the endpoint at all
 * (404), costs the homepage one section rather than the whole page.
 */
export async function getRecentPosts(limit = 3): Promise<PostSummary[]> {
  try {
    const { posts } = await getPosts({ perPage: limit });
    return posts;
  } catch (error) {
    console.error("[crm] recent posts unavailable", error);
    return [];
  }
}

/* ---------------------------------------------------------------- */
/* Enquiries (API key required — server-side only)                   */
/* ---------------------------------------------------------------- */

export interface EnquiryInput {
  name: string;
  email: string;
  phone?: string;
  /** The car being enquired about, so the sales team has context. */
  registration?: string;
  message?: string;
}

/**
 * Every way posting an enquiry can end. The caller maps these onto UI without
 * needing to know about HTTP.
 */
export type EnquiryOutcome =
  | { status: "sent"; reference: string }
  /** 422 — per-field messages, keyed by the field name the form uses. */
  | { status: "invalid"; fieldErrors: Record<string, string> }
  /** 429 — the customer should simply try again shortly. */
  | { status: "rate_limited" }
  /** 401/503 — misconfiguration at one end or the other. Needs the team. */
  | { status: "unavailable" }
  /** Anything else: network trouble, a 5xx, an unreadable body. */
  | { status: "failed" };

/**
 * Creates a lead in the dealership's pipeline.
 *
 * Never called from the browser: the key is read from the server environment
 * here, and `server-only` at the top of this file enforces it.
 */
export async function submitEnquiry(
  input: EnquiryInput,
): Promise<EnquiryOutcome> {
  const apiKey = process.env.FRONTEND_API_KEY;

  if (!apiKey) {
    console.error(
      "[crm] FRONTEND_API_KEY is not set — enquiries cannot be delivered. " +
        "Copy it from the CRM under Backend → API & Documentation.",
    );
    return { status: "unavailable" };
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/enquiries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone || undefined,
        registration: input.registration || undefined,
        message: input.message || undefined,
      }),
      // A lead must never be served from cache.
      cache: "no-store",
    });
  } catch (error) {
    console.error("[crm] enquiry request failed to send", error);
    return { status: "failed" };
  }

  if (response.status === 201) {
    const payload = (await response
      .json()
      .catch(() => null)) as { data?: { reference?: string } } | null;

    const reference = payload?.data?.reference;
    if (reference) return { status: "sent", reference };

    // The lead landed; only the confirmation reference is missing.
    console.error("[crm] enquiry accepted but returned no reference");
    return { status: "sent", reference: "" };
  }

  if (response.status === 422) {
    const payload = (await response
      .json()
      .catch(() => null)) as { errors?: Record<string, string[]> } | null;

    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(payload?.errors ?? {})) {
      if (messages?.[0]) fieldErrors[field] = messages[0];
    }

    return { status: "invalid", fieldErrors };
  }

  if (response.status === 429) return { status: "rate_limited" };

  if (response.status === 401) {
    console.error(
      "[crm] enquiry rejected: FRONTEND_API_KEY is invalid or was revoked.",
    );
    return { status: "unavailable" };
  }

  if (response.status === 503) {
    console.error(
      "[crm] enquiry rejected: the CRM has no API key configured. " +
        "Enquiries are down until someone generates one in the CRM.",
    );
    return { status: "unavailable" };
  }

  console.error(`[crm] enquiry rejected with status ${response.status}`);
  return { status: "failed" };
}

/* ---------------------------------------------------------------- */
/* Bookings (API key required — server-side only)                    */
/* ---------------------------------------------------------------- */

/** The three things the showroom takes appointments for. */
export type BookingType = "test_drive" | "viewing" | "handover";

export interface BookingInput {
  name: string;
  email: string;
  /** Required, unlike an enquiry: confirming a booking means ringing back. */
  phone: string;
  type: BookingType;
  /** ISO 8601, local time. The CRM re-checks it against opening hours. */
  appointmentDate: string;
  /** The car they want to drive, so the CRM can attach the booking to it. */
  registration?: string;
  notes?: string;
}

/**
 * Every way a booking can end.
 *
 * Same shape as EnquiryOutcome and deliberately a separate type: the two
 * happen to align today, and merging them would mean a change to one silently
 * rewrites the other's contract.
 */
export type BookingOutcome =
  | { status: "sent"; reference: string; appointmentDate: string }
  /** 422 — per-field messages, keyed by the field name the form uses. */
  | { status: "invalid"; fieldErrors: Record<string, string> }
  /** 429 — the customer should simply try again shortly. */
  | { status: "rate_limited" }
  /** 401/503 — misconfiguration at one end or the other. Needs the team. */
  | { status: "unavailable" }
  /** Anything else: network trouble, a 5xx, an unreadable body. */
  | { status: "failed" };

/**
 * Requests a test drive, viewing or handover.
 *
 * REQUESTS, not books. The CRM files everything from here as `requested` for a
 * human to confirm — nothing on either side checks whether the car or a
 * salesperson is actually free. The wording in the UI has to match that, or the
 * site is promising a slot the business has not agreed to.
 *
 * Never called from the browser: the key is read from the server environment
 * here, and `server-only` at the top of this file enforces it.
 */
export async function submitBooking(
  input: BookingInput,
): Promise<BookingOutcome> {
  const apiKey = process.env.FRONTEND_API_KEY;

  if (!apiKey) {
    console.error(
      "[crm] FRONTEND_API_KEY is not set — bookings cannot be delivered. " +
        "Copy it from the CRM under Backend → API & Documentation.",
    );
    return { status: "unavailable" };
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/appointments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        name: input.name,
        email: input.email,
        phone: input.phone,
        type: input.type,
        appointment_date: input.appointmentDate,
        registration: input.registration || undefined,
        notes: input.notes || undefined,
      }),
      // A booking must never be served from cache.
      cache: "no-store",
    });
  } catch (error) {
    console.error("[crm] booking request failed to send", error);
    return { status: "failed" };
  }

  if (response.status === 201) {
    const payload = (await response.json().catch(() => null)) as {
      data?: { reference?: string; appointment_date?: string };
    } | null;

    return {
      status: "sent",
      // The booking landed either way; only the confirmation detail is missing.
      reference: payload?.data?.reference ?? "",
      appointmentDate: payload?.data?.appointment_date ?? input.appointmentDate,
    };
  }

  if (response.status === 422) {
    const payload = (await response.json().catch(() => null)) as {
      errors?: Record<string, string[]>;
    } | null;

    const fieldErrors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(payload?.errors ?? {})) {
      if (messages?.[0]) fieldErrors[field] = messages[0];
    }

    return { status: "invalid", fieldErrors };
  }

  if (response.status === 429) return { status: "rate_limited" };

  if (response.status === 401) {
    console.error(
      "[crm] booking rejected: FRONTEND_API_KEY is invalid or was revoked.",
    );
    return { status: "unavailable" };
  }

  if (response.status === 503) {
    console.error(
      "[crm] booking rejected: the CRM has no API key configured. " +
        "Bookings are down until someone generates one in the CRM.",
    );
    return { status: "unavailable" };
  }

  console.error(`[crm] booking rejected with status ${response.status}`);
  return { status: "failed" };
}
