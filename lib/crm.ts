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

import { priceLadder } from "./vehicles";
import type {
  FuelType,
  StockFilters,
  Transmission,
  Vehicle,
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

  return {
    featuredImage,
    images,
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
    motExpiry: raw.mot_expiry,
    serviceDue: raw.service_due,
  };
}

/* ---------------------------------------------------------------- */
/* Reads (no API key required)                                       */
/* ---------------------------------------------------------------- */

async function readJson<T>(
  path: string,
  search?: URLSearchParams,
): Promise<T> {
  const query = search?.toString();
  const url = `${BASE_URL}${path}${query ? `?${query}` : ""}`;

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: {
        revalidate: READ_REVALIDATE_SECONDS,
        tags: [VEHICLES_CACHE_TAG],
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
