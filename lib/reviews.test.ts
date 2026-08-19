/**
 * `node --test lib/reviews.test.ts` — no test framework, no new dependency.
 * Node v24 strips TypeScript types natively, which is why this runs directly;
 * the import below carries its `.ts` extension because the native loader does
 * not resolve extensionless specifiers (hence `allowImportingTsExtensions` in
 * tsconfig, which affects type-checking only — `noEmit` is already on).
 *
 * `lib/reviews.ts` is deliberately free of `server-only` and of every Next
 * import so it can be loaded here. `lib/crm.ts` cannot be, and is not tested:
 * its job is one fetch, and the interesting decisions all live in this module.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  clampRating,
  liveHeadingBody,
  pickTestimonials,
  reviewDate,
  sourceLabel,
  toReviewsPayload,
  type RawReviewsResponse,
} from "./reviews.ts";
import { testimonials } from "./site.ts";

/** A well-formed payload with one Google and one Trustpilot review. */
function samplePayload(): RawReviewsResponse {
  return {
    data: [
      {
        source: "google",
        source_label: "Google",
        author_name: "Aisha R.",
        rating: 5,
        title: null,
        body: "Straightforward, no pressure, and the car was exactly as described.",
        language: "en",
        reviewed_at: "2026-07-28",
        url: null,
      },
      {
        source: "trustpilot",
        source_label: "Trustpilot",
        author_name: "James W.",
        rating: 4,
        title: "Fair trade-in",
        body: "Honest about the value and clear about the paperwork.",
        language: "en-GB",
        reviewed_at: "2026-06-02",
        url: "https://uk.trustpilot.com/reviews/abc123",
      },
    ],
    summary: {
      total: 2,
      average_rating: 4.5,
      last_fetched_at: "2026-08-15T09:00:00+00:00",
      sources: {
        google: {
          label: "Google",
          count: 1,
          average_rating: 5,
          profile_url: "https://search.google.com/local/reviews?placeid=ChIJtest",
          max_per_fetch: 5,
          is_complete: false,
        },
        trustpilot: {
          label: "Trustpilot",
          count: 1,
          average_rating: 4,
          profile_url: "https://uk.trustpilot.com/review/burraqmotors.co.uk",
          max_per_fetch: null,
          is_complete: true,
        },
      },
    },
  };
}

test("falls back to the hardcoded testimonials when the CRM is unreachable", () => {
  const picked = pickTestimonials(null);

  assert.equal(picked.kind, "fallback");
  assert.equal(picked.kind === "fallback" && picked.testimonials, testimonials);
  assert.equal(testimonials.length, 6);
});

test("falls back when the CRM returns no visible reviews", () => {
  const payload = toReviewsPayload({
    data: [],
    summary: { total: 0, average_rating: 0, last_fetched_at: null, sources: {} },
  });

  assert.deepEqual(payload.reviews, []);
  assert.equal(pickTestimonials(payload).kind, "fallback");
});

test("uses live reviews when present, in the order the CRM sent them", () => {
  const picked = pickTestimonials(toReviewsPayload(samplePayload()));

  assert.equal(picked.kind, "live");
  if (picked.kind !== "live") return;

  assert.deepEqual(
    picked.reviews.map((review) => review.authorName),
    ["Aisha R.", "James W."],
  );
  assert.equal(picked.reviews[0].rating, 5);
  assert.equal(picked.reviews[1].title, "Fair trade-in");
  assert.equal(picked.reviews[1].url, "https://uk.trustpilot.com/reviews/abc123");
  assert.equal(picked.summary.total, 2);
  assert.deepEqual(
    picked.summary.sources.map((entry) => entry.key),
    ["google", "trustpilot"],
  );
});

test("clamps ratings and drops the ones that are not numbers at all", () => {
  assert.equal(clampRating(0), 1);
  assert.equal(clampRating(9), 5);
  assert.equal(clampRating("4"), 4);
  assert.equal(clampRating(4.4), 4);
  assert.equal(clampRating(NaN), null);
  assert.equal(clampRating(null), null);
  assert.equal(clampRating("lovely"), null);
});

test("drops reviews that cannot be rendered honestly", () => {
  const payload = toReviewsPayload({
    data: [
      // No author — an anonymous card is less credible than a static quote.
      { source: "google", author_name: "  ", rating: 5, body: "Great." },
      // Neither title nor body — five stars and a blank card is not a review.
      { source: "google", author_name: "Sam", rating: 5, title: null, body: "  " },
      // Unreadable rating — see clampRating's docblock.
      { source: "google", author_name: "Sam", rating: "lovely", body: "Great." },
      // No source — it could not be attributed.
      { source: null, author_name: "Sam", rating: 5, body: "Great." },
      // The one good row, with a hostile rating that clamps rather than drops.
      { source: "google", author_name: "Sam", rating: 99, body: "Great." },
    ],
    summary: undefined,
  });

  assert.equal(payload.reviews.length, 1);
  assert.equal(payload.reviews[0].rating, 5);
  // A missing summary must not throw — the section still renders the cards.
  assert.deepEqual(payload.summary.sources, []);
  assert.equal(payload.summary.total, 0);
});

test("rejects a review link that is not http(s)", () => {
  const payload = toReviewsPayload({
    data: [
      {
        source: "google",
        author_name: "Sam",
        rating: 5,
        body: "Great.",
        url: "javascript:alert(1)",
      },
    ],
  });

  assert.equal(payload.reviews[0].url, null);
});

test("a source with no visible reviews never reaches the summary", () => {
  const raw = samplePayload();
  raw.summary!.sources!.trustpilot!.count = 0;

  const payload = toReviewsPayload(raw);

  assert.deepEqual(
    payload.summary.sources.map((entry) => entry.key),
    ["google"],
  );
});

test("the source label falls back through the summary and then the row", () => {
  const payload = toReviewsPayload({
    data: [{ source: "google", author_name: "Sam", rating: 5, body: "Great." }],
    summary: { sources: { google: { label: "Google", count: 1 } } },
  });

  // The row itself carried no source_label; the summary supplies it.
  assert.equal(payload.reviews[0].sourceLabel, "google");
  assert.equal(sourceLabel(payload.reviews[0], payload.summary), "Google");
});

test("the heading hedges only while a source is structurally incomplete", () => {
  const complete = toReviewsPayload(samplePayload());
  assert.equal(
    liveHeadingBody(complete.summary),
    "A selection of what drivers say after buying from us — pulled live from Google and Trustpilot.",
  );

  const raw = samplePayload();
  raw.summary!.sources!.google!.is_complete = true;
  assert.equal(
    liveHeadingBody(toReviewsPayload(raw).summary),
    "What drivers say after buying from us — pulled live from Google and Trustpilot.",
  );

  const single = samplePayload();
  delete single.summary!.sources!.google;
  assert.equal(
    liveHeadingBody(toReviewsPayload(single).summary),
    "What drivers say after buying from us — pulled live from Trustpilot.",
  );
});

test("a date-only reviewed_at formats in UTC and never rolls back a day", () => {
  const payload = toReviewsPayload(samplePayload());

  assert.equal(reviewDate(payload.reviews[0]), "28 July 2026");
  assert.equal(reviewDate({ ...payload.reviews[0], reviewedAt: null }), null);
  assert.equal(reviewDate({ ...payload.reviews[0], reviewedAt: "not a date" }), null);
});

test("a manual-only source is flagged, and prints no reported total", () => {
  const payload = toReviewsPayload({
    data: [
      {
        source: "facebook",
        source_label: "Facebook",
        author_name: "Priya K.",
        rating: 5,
        body: "Recommended us to two of her neighbours.",
        reviewed_at: "2026-08-02",
      },
    ],
    summary: {
      total: 10,
      average_rating: 4.9,
      sources: {
        // Every row typed in by hand: no run, so no provider aggregate.
        facebook: { label: "Facebook", count: 3, manual_count: 3, average_rating: 5 },
        // Mixed: Google handed over five of fifty-seven, two more were typed in.
        google: {
          label: "Google",
          count: 7,
          manual_count: 2,
          average_rating: 4.9,
          total_reported: 57,
          rating_reported: 5,
          max_per_fetch: 5,
          is_complete: false,
        },
        // A CRM that predates hand entry sends no manual_count at all.
        trustpilot: { label: "Trustpilot", count: 4, average_rating: 4.8 },
      },
    },
  });

  const [facebook, google, trustpilot] = payload.summary.sources;

  assert.equal(facebook.manualCount, 3);
  assert.equal(facebook.isManualOnly, true);
  // No provider ever reported on this source, so the cached count is the whole
  // truth and the tally's "N shown below" line must not render.
  assert.equal(facebook.totalReported, null);
  assert.equal(facebook.ratingReported, null);
  assert.equal(
    facebook.totalReported !== null && facebook.totalReported > facebook.count,
    false,
  );
  // The tally block itself still renders — its guard is the count.
  assert.equal((facebook.totalReported ?? facebook.count) > 0, true);

  assert.equal(google.manualCount, 2);
  assert.equal(google.isManualOnly, false);
  assert.equal(google.totalReported, 57);
  // The one source where the fine print is true: 57 exist, 7 are quotable.
  assert.equal(google.totalReported! > google.count, true);

  // Absent manual_count must not make an older CRM's source look hand-entered.
  assert.equal(trustpilot.manualCount, 0);
  assert.equal(trustpilot.isManualOnly, false);
});

test("a source claiming fewer reviews than it handed over loses its total", () => {
  const payload = toReviewsPayload({
    summary: {
      sources: {
        google: { label: "Google", count: 9, manual_count: 4, total_reported: 5 },
      },
    },
  });

  // 4 of the 9 were typed in, so the profile's own 5 is now behind our count.
  // Printing it would say "5 reviews on Google" above nine of them.
  assert.equal(payload.summary.sources[0].totalReported, null);
  assert.equal(payload.summary.sources[0].isManualOnly, false);
});

test("the heading only claims 'pulled live' for a source something was fetched from", () => {
  // With no manual-only source the wording is byte-identical to before hand
  // entry existed — the three assertions above this one are the proof.
  const raw = samplePayload();
  raw.summary!.sources!.facebook = {
    label: "Facebook",
    count: 3,
    manual_count: 3,
    average_rating: 5,
  };
  raw.summary!.sources!.whatsapp = {
    label: "WhatsApp",
    count: 1,
    manual_count: 1,
    average_rating: 5,
  };

  assert.equal(
    liveHeadingBody(toReviewsPayload(raw).summary),
    "A selection of what drivers say after buying from us — pulled live from Google and Trustpilot, and shared with us on Facebook and WhatsApp.",
  );

  // Nothing fetched at all: no "pulled live" clause anywhere in the sentence.
  const manualOnly = samplePayload();
  delete manualOnly.summary!.sources!.google;
  delete manualOnly.summary!.sources!.trustpilot;
  manualOnly.summary!.sources!.facebook = {
    label: "Facebook",
    count: 3,
    manual_count: 3,
    average_rating: 5,
  };

  const sentence = liveHeadingBody(toReviewsPayload(manualOnly).summary);
  assert.equal(
    sentence,
    "What drivers say after buying from us — shared with us on Facebook.",
  );
  assert.equal(sentence.includes("pulled live"), false);

  // A source with no visible reviews is dropped before the heading sees it.
  assert.equal(
    liveHeadingBody(toReviewsPayload({ summary: { sources: {} } }).summary),
    "What drivers say after buying from us.",
  );
});
