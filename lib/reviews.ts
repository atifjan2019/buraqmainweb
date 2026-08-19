/**
 * Customer reviews, as the CRM publishes them.
 *
 * The dealership's Google and Trustpilot credentials live in the CRM, and the
 * CRM does the fetching, caching and moderating. This site reads the cached
 * result from `/api/v1/reviews` exactly as it reads stock — it never talks to
 * Google or Trustpilot, and never sees a credential.
 *
 * This module is deliberately free of `server-only` and of any Next import:
 * it holds the wire types, the normalisers and the fallback decision, so all
 * three are directly runnable under `node --test` (see `reviews.test.ts`).
 * The fetch itself lives in `lib/crm.ts`, which is the server-only half.
 *
 * Everything arriving over the wire is treated as untrusted, in the same shape
 * `toImage` / `toBranch` / `toDocument` already use in `lib/crm.ts`: a record
 * that cannot be rendered honestly is dropped rather than half-printed.
 */

/* The `.ts` extension is load-bearing, not a slip: `reviews.test.ts` runs this
   module under Node's native type-stripping, whose ESM resolver does not guess
   extensions. Webpack and Turbopack both resolve an explicit one, so the site
   build is unaffected. `tsconfig.json` carries `allowImportingTsExtensions`
   for the same reason. */
import { testimonials } from "./site.ts";

/* ---------------------------------------------------------------- */
/* Wire format — the frozen contract in §7 of the design             */
/* ---------------------------------------------------------------- */

/** One review exactly as `PublicReviewResource` sends it. All fields untrusted. */
interface RawReview {
  source?: string | null;
  source_label?: string | null;
  author_name?: string | null;
  rating?: unknown;
  title?: string | null;
  body?: string | null;
  language?: string | null;
  reviewed_at?: string | null;
  url?: string | null;
}

/** One entry of `summary.sources`, keyed by provider in the payload. */
interface RawSummarySource {
  label?: string | null;
  count?: unknown;
  /** How many of `count` were typed into the CRM by hand. Absent on a CRM
      that predates manual entry, which normalises to 0 — see `toSummary`. */
  manual_count?: unknown;
  total_reported?: unknown;
  rating_reported?: unknown;
  average_rating?: unknown;
  profile_url?: string | null;
  max_per_fetch?: unknown;
  is_complete?: unknown;
}

interface RawSummary {
  total?: unknown;
  average_rating?: unknown;
  last_fetched_at?: string | null;
  sources?: Record<string, RawSummarySource | null> | null;
}

/** The whole `/reviews` response: the repo's `data` + `meta` paginator plus `summary`. */
export interface RawReviewsResponse {
  data?: RawReview[] | null;
  summary?: RawSummary | null;
}

/* ---------------------------------------------------------------- */
/* Site types                                                        */
/* ---------------------------------------------------------------- */

/** A star count. Closed union because the card renders exactly five glyphs. */
export type Rating = 1 | 2 | 3 | 4 | 5;

/** One review, normalised and safe to render. */
export interface SiteReview {
  /** Provider key, e.g. "google". Used for grouping and as part of the React key. */
  source: string;
  /** Human label for the provider, as the CRM names it. */
  sourceLabel: string;
  authorName: string;
  rating: Rating;
  /** Trustpilot gives titles; Google does not. */
  title: string | null;
  /**
   * The review text. Null only when the provider gave a title and no body —
   * a review with neither is dropped, because there is nothing to quote.
   */
  body: string | null;
  /** BCP-47 tag when the provider gave one, for `lang` on the blockquote. */
  language: string | null;
  /** Plain `YYYY-MM-DD`, matching `mot_expiry` / `service_due`. */
  reviewedAt: string | null;
  /** Permalink to this specific review, when the provider has one. */
  url: string | null;
}

/** Aggregates for one provider, over visible reviews only. */
export interface ReviewSummarySource {
  /** Provider key — the object key in the payload. */
  key: string;
  label: string;
  /** How many this site holds and can quote. */
  count: number;
  averageRating: number;
  /**
   * How many the provider says the profile ACTUALLY has, which is not what it
   * hands over: Google reports 57 and returns 5. Null when the provider
   * publishes no aggregate, in which case `count` is the only honest figure.
   */
  totalReported: number | null;
  /** The provider's average across that full set, not just the cached sample. */
  ratingReported: number | null;
  /** Where "read all our reviews" points. Null means no such link is rendered. */
  profileUrl: string | null;
  /** How many the provider returns per fetch, when it is capped. Google: 5. */
  maxPerFetch: number | null;
  /**
   * How many of `count` were entered in the CRM by hand rather than fetched
   * from the platform's API. The dealership collects praise on Facebook, on
   * WhatsApp and across the desk, and Google hands over five of fifty-seven,
   * so the rest are typed in. 0 when the CRM did not say.
   */
  manualCount: number;
  /**
   * True when NOTHING from this source was fetched — every row was typed in.
   *
   * The heading must not claim such a source was "pulled live": the review is
   * genuinely from that platform, but we read it there with our eyes rather
   * than through an API, and saying otherwise would overstate it. A CRM that
   * sends no `manual_count` yields false, which keeps the old wording.
   */
  isManualOnly: boolean;
  /**
   * False when the CRM's cache is structurally a sample rather than a mirror —
   * Google's Places API returns at most five reviews and cannot paginate. The
   * heading wording is driven off this rather than hardcoding a fact about a
   * provider that could change without this site being redeployed.
   */
  isComplete: boolean;
}

export interface ReviewSummary {
  total: number;
  averageRating: number;
  lastFetchedAt: string | null;
  /**
   * An array rather than the payload's object, so the order the CRM declared
   * its providers in survives and the UI can map over it without re-sorting.
   * A provider with nothing visible is absent entirely — the CRM omits it, and
   * the normaliser drops any that arrives with a zero count anyway.
   */
  sources: ReviewSummarySource[];
}

export interface ReviewsPayload {
  reviews: SiteReview[];
  summary: ReviewSummary;
}

/* ---------------------------------------------------------------- */
/* Normalisers                                                       */
/* ---------------------------------------------------------------- */

/**
 * Rounds and clamps a rating into 1–5, or returns null when the value is not a
 * number at all.
 *
 * DEVIATION from the design's frozen `clampRating(n): 1|2|3|4|5`: this returns
 * `Rating | null`. A total of `NaN`, `null` or `"lovely"` is not a rating that
 * can be clamped — turning it into one star libels the reviewer and turning it
 * into five flatters the dealership. Both are lies, so the review is dropped
 * instead, which is the same "reject the half-populated record" rule `toImage`
 * and `toBranch` already apply. Values that ARE numeric are clamped as
 * specified: 0 becomes 1, 9 becomes 5, "4" becomes 4.
 */
export function clampRating(value: unknown): Rating | null {
  // Only a number, or a string that is entirely a number, counts. `Number()`
  // alone would turn `null`, `""`, `[]` and `false` into 0 and therefore into
  // a one-star review — a missing rating silently becoming the worst possible
  // one is exactly the failure this guard exists to prevent.
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value.trim())
        : NaN;

  if (!Number.isFinite(parsed)) return null;

  const rounded = Math.round(parsed);
  if (rounded < 1) return 1;
  if (rounded > 5) return 5;
  return rounded as Rating;
}

/**
 * Accepts only absolute http(s) URLs.
 *
 * These strings originate at Google and Trustpilot, pass through the CRM, and
 * end up in an `href`. A `javascript:` or `data:` URL in that position is
 * script execution on our own origin, so the scheme is checked here rather
 * than trusted because it came from a first-party API.
 */
function toHttpUrl(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  try {
    const url = new URL(raw);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

/** Collapses a possibly-absent string to a trimmed value or null. */
function text(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

/**
 * Rejects a review that cannot be rendered honestly:
 *
 * - no source key — it could not be attributed, and attribution is the whole
 *   reason a real review beats a hardcoded one;
 * - no author name — an anonymous card in a section headed "what our customers
 *   say" is less credible than the static quote it replaced;
 * - no readable rating — see `clampRating`;
 * - neither title nor body — five stars and a blank card is not a testimonial.
 */
function toReview(raw: RawReview | null | undefined): SiteReview | null {
  if (!raw) return null;

  const source = text(raw.source);
  const authorName = text(raw.author_name);
  const rating = clampRating(raw.rating);
  const title = text(raw.title);
  const body = text(raw.body);

  if (!source || !authorName || rating === null) return null;
  if (!title && !body) return null;

  return {
    source,
    // A source the CRM forgot to label still prints its key rather than an
    // empty caption — the reader needs to know where the quote came from.
    sourceLabel: text(raw.source_label) ?? source,
    authorName,
    rating,
    title,
    body,
    language: text(raw.language),
    reviewedAt: text(raw.reviewed_at),
    url: toHttpUrl(raw.url),
  };
}

/** Non-negative integer, or 0. */
function count(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 0;
}

/** A 1-decimal average, or 0 when the CRM sent something unusable. */
function average(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.round(Math.min(5, parsed) * 10) / 10;
}

function toSummary(raw: RawSummary | null | undefined): ReviewSummary {
  const sources: ReviewSummarySource[] = [];

  for (const [key, entry] of Object.entries(raw?.sources ?? {})) {
    const total = count(entry?.count);
    // A provider with nothing visible must never render an empty column or a
    // "0 reviews on Trustpilot" badge. The CRM already omits it; this is the
    // second half of the same guarantee.
    if (!key.trim() || total === 0) continue;

    const manualCount = count(entry?.manual_count);
    const cap = Number(entry?.max_per_fetch);
    const reported = Number(entry?.total_reported);
    const reportedRating = Number(entry?.rating_reported);

    sources.push({
      key: key.trim(),
      label: text(entry?.label) ?? key.trim(),
      count: total,
      averageRating: average(entry?.average_rating),
      // Only trust a reported total that is at least what we hold — a provider
      // claiming fewer reviews than it just handed over is a payload to ignore,
      // not to print.
      totalReported:
        Number.isFinite(reported) && reported >= total ? Math.floor(reported) : null,
      ratingReported:
        Number.isFinite(reportedRating) && reportedRating > 0 ? reportedRating : null,
      manualCount,
      // `>=` rather than `===`: a payload claiming more hand-entered rows than
      // it holds in total is still a source nothing was fetched for, and the
      // heading's claim is the thing being decided here.
      isManualOnly: manualCount >= total,
      profileUrl: toHttpUrl(entry?.profile_url),
      maxPerFetch: Number.isFinite(cap) && cap > 0 ? Math.floor(cap) : null,
      // Defaults to complete: only an explicit `false` makes the heading hedge,
      // so a CRM that predates the flag does not have the site apologising for
      // a limitation it has not been told about.
      isComplete: entry?.is_complete !== false,
    });
  }

  return {
    total: count(raw?.total),
    averageRating: average(raw?.average_rating),
    lastFetchedAt: text(raw?.last_fetched_at),
    sources,
  };
}

/** Turns the raw `/reviews` response into something the section can render. */
export function toReviewsPayload(raw: RawReviewsResponse | null | undefined): ReviewsPayload {
  const reviews = (raw?.data ?? [])
    .map(toReview)
    .filter((review): review is SiteReview => review !== null);

  return { reviews, summary: toSummary(raw?.summary) };
}

/* ---------------------------------------------------------------- */
/* The fallback decision                                             */
/* ---------------------------------------------------------------- */

export type TestimonialSource =
  | { kind: "live"; reviews: SiteReview[]; summary: ReviewSummary }
  | { kind: "fallback"; testimonials: typeof testimonials };

/**
 * Chooses between the CRM's real reviews and the hardcoded set in `lib/site.ts`.
 *
 * Falls back when the CRM is unreachable (`null`) OR has nothing visible to
 * show. An empty band on the homepage is worse than six true-but-static
 * quotes, and this is the one decision the section makes that is worth a test
 * of its own.
 */
export function pickTestimonials(payload: ReviewsPayload | null): TestimonialSource {
  if (!payload || payload.reviews.length === 0) {
    return { kind: "fallback", testimonials };
  }

  return { kind: "live", reviews: payload.reviews, summary: payload.summary };
}

/* ---------------------------------------------------------------- */
/* Presentation helpers                                              */
/* ---------------------------------------------------------------- */

/* Reviewed dates arrive as plain YYYY-MM-DD, so they are formatted in UTC —
 * reading them in a western timezone would otherwise roll them back a day.
 * Same reasoning, and the same formatter shape, as `formatDate` in
 * `lib/vehicles.ts`; duplicated rather than imported so this module stays
 * loadable by `node --test` without dragging the vehicle domain in. */
const reviewDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a review's date, or null when it is missing or unparseable. */
export function reviewDate(review: SiteReview): string | null {
  if (!review.reviewedAt) return null;
  const parsed = new Date(review.reviewedAt);
  return Number.isNaN(parsed.getTime()) ? null : reviewDateFormat.format(parsed);
}

/**
 * The provider name to print under a quote.
 *
 * DEVIATION from the design's `sourceCaption(review, summary)`, which returned
 * the whole "Google · 28 July 2026" line: where a review has a permalink, only
 * the source WORD is the link, so the component has to compose the two halves
 * itself. A helper returning the joined string would then have to be duplicated
 * inline for the linked case, and the two copies would drift. The summary is
 * still consulted, because it carries the label the CRM would use even for a
 * review row whose own `source_label` is missing.
 */
export function sourceLabel(review: SiteReview, summary: ReviewSummary): string {
  const declared = summary.sources.find((entry) => entry.key === review.source);
  return declared?.label ?? review.sourceLabel;
}

/** "Google", "Google and Trustpilot", "Google, Trustpilot and Facebook". */
function listNames(names: string[]): string {
  return names.length <= 1
    ? (names[0] ?? "")
    : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * The lead paragraph under the heading, in live mode.
 *
 * Names the providers actually being shown rather than hardcoding "Google and
 * Trustpilot", and says "A selection of" whenever any of them is structurally
 * incomplete — Google's Places API returns at most five reviews and cannot page
 * through the rest, so claiming to show what drivers say would overstate it.
 *
 * The two halves of the sentence are the two ways a review reaches this page,
 * and they are worded apart because only one of them was verified by machine.
 * "Pulled live from" is a claim about an API call, so it is made only for a
 * source something was actually fetched from. A source whose every row was
 * typed into the CRM by hand gets "shared with us on", which is the precise
 * truth: the customer did leave it on Facebook, and we did not read it through
 * an API. Nothing here fetches, parses or scrapes a third-party page, and the
 * heading must not imply otherwise.
 *
 * With no manual-only source the output is byte-identical to what it was
 * before hand entry existed — a guarantee, not an aspiration, and the reason
 * the pre-existing heading assertions in `reviews.test.ts` stand unedited.
 */
export function liveHeadingBody(summary: ReviewSummary): string {
  const fetched = summary.sources.filter((entry) => !entry.isManualOnly);
  const shared = summary.sources.filter((entry) => entry.isManualOnly);

  const live = listNames(fetched.map((entry) => entry.label));
  const byHand = listNames(shared.map((entry) => entry.label));

  const providers =
    live && byHand
      ? ` — pulled live from ${live}, and shared with us on ${byHand}`
      : live
        ? ` — pulled live from ${live}`
        : byHand
          ? ` — shared with us on ${byHand}`
          : "";

  const hedged = summary.sources.some((entry) => !entry.isComplete);

  return hedged
    ? `A selection of what drivers say after buying from us${providers}.`
    : `What drivers say after buying from us${providers}.`;
}
