/**
 * `node --test lib/posts.test.ts` — no test framework, no new dependency.
 * Node v24 strips TypeScript types natively, which is why this runs directly;
 * the import below carries its `.ts` extension because the native loader does
 * not resolve extensionless specifiers (hence `allowImportingTsExtensions` in
 * tsconfig, which affects type-checking only — `noEmit` is already on).
 *
 * `lib/posts.ts` is deliberately free of `server-only` and of every Next import
 * so it can be loaded here. `lib/crm.ts` cannot be, and is not tested: its job
 * is one fetch, and every interesting decision lives in this module.
 *
 * What these tests are really pinning is the second half of the XSS argument.
 * The CRM proves no HTML is ever produced; this proves the site drops anything
 * it cannot render honestly and, in particular, that a hostile `href` loses its
 * attribute while the reader keeps the sentence.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  blocksToText,
  formatPostDate,
  postHref,
  readingMinutes,
  safeHref,
  toBlocks,
  toPost,
  toPostSummary,
  type RawPost,
  type RawPostSummary,
} from "./posts.ts";

/** A well-formed listing record. */
function sampleSummary(): RawPostSummary {
  return {
    slug: "importing-a-toyota-alphard-what-to-expect",
    title: "Importing a Toyota Alphard: what to expect",
    excerpt: "Every import follows the same six steps.",
    author: "Burraq Motors",
    published_at: "2026-08-14",
    updated_at: "2026-08-15",
    reading_minutes: 6,
    hero: {
      thumb: "https://crm.example/storage/posts/7/ab12_thumb.jpg",
      alt: "A silver Alphard on the forecourt",
    },
  };
}

/* ---------------------------------------------------------------- */
/* Test 21 — the block tree                                          */
/* ---------------------------------------------------------------- */

test("toBlocks keeps the five known shapes and drops everything else", () => {
  const blocks = toBlocks([
    { type: "heading", level: 2, spans: [{ text: "What the grade means" }] },
    { type: "heading", level: 9, spans: [{ text: "Folded to h2" }] },
    { type: "heading", level: 3, spans: [{ text: "A sub-head" }] },
    { type: "paragraph", spans: [{ text: "We buy at auction." }] },
    { type: "quote", spans: [{ text: "The sheet is the best evidence." }] },
    { type: "list", ordered: true, items: [[{ text: "Grade 4 and above" }]] },
    { type: "rule" },
    // Everything below this line must vanish.
    { type: "video", src: "https://evil.example/x.mp4" },
    { type: "paragraph", spans: "not-an-array" },
    { type: "paragraph", spans: [] },
    { type: "heading", spans: [] },
    { type: "list", items: "not-an-array" },
    { type: "list", ordered: false, items: [[]] },
    null,
    "a string block",
  ]);

  assert.deepEqual(
    blocks.map((block) => block.type),
    ["heading", "heading", "heading", "paragraph", "quote", "list", "rule"],
  );

  // An out-of-range level folds to h2 rather than emitting an <h9>.
  assert.deepEqual(
    blocks
      .filter((block) => block.type === "heading")
      .map((block) => block.level),
    [2, 2, 3],
  );

  const list = blocks.find((block) => block.type === "list");
  assert.equal(list?.ordered, true);
  assert.equal(list?.items.length, 1);
});

test("toBlocks drops spans with no text and refuses non-boolean emphasis", () => {
  const blocks = toBlocks([
    {
      type: "paragraph",
      spans: [
        { text: "Kept." },
        { text: "" },
        { bold: true },
        { text: null },
        "not an object",
        { text: " and this space", bold: "yes", italic: 1 },
      ],
    },
  ]);

  assert.equal(blocks.length, 1);
  const paragraph = blocks[0];
  assert.equal(paragraph.type, "paragraph");
  if (paragraph.type !== "paragraph") return;

  assert.deepEqual(
    paragraph.spans.map((span) => span.text),
    ["Kept.", " and this space"],
  );

  // Whitespace-only text survives — it is the gap between a sentence and the
  // bold word inside it — while a truthy-but-not-true flag is ignored.
  assert.equal(paragraph.spans[1].bold, undefined);
  assert.equal(paragraph.spans[1].italic, undefined);
});

test("a disallowed href is stripped and the label survives as plain text", () => {
  const hostile = [
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "  javascript:alert(1)  ",
    "java\nscript:alert(1)",
    "java\tscript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "//evil.example",
    "/\\evil.example",
    "https://evil example.com",
    42,
    null,
  ];

  const blocks = toBlocks([
    {
      type: "paragraph",
      spans: hostile.map((href) => ({ text: "click", href })),
    },
  ]);

  const paragraph = blocks[0];
  assert.equal(paragraph.type, "paragraph");
  if (paragraph.type !== "paragraph") return;

  assert.equal(paragraph.spans.length, hostile.length);
  for (const span of paragraph.spans) {
    assert.equal(span.href, undefined, `${span.text} kept an href`);
    assert.equal(span.text, "click");
  }
});

test("the href allow-list passes exactly the four schemes and site-relative paths", () => {
  assert.equal(safeHref("https://burraqmotors.co.uk"), "https://burraqmotors.co.uk");
  assert.equal(safeHref("HTTP://example.com/x"), "HTTP://example.com/x");
  assert.equal(safeHref("mailto:sales@example.com"), "mailto:sales@example.com");
  assert.equal(safeHref("tel:+441610000000"), "tel:+441610000000");
  assert.equal(safeHref("/cars"), "/cars");
  assert.equal(safeHref("/cars/toyota-alphard-ab12cde"), "/cars/toyota-alphard-ab12cde");

  assert.equal(safeHref("//evil.example"), null);
  assert.equal(safeHref("/\\evil.example"), null);
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("cars"), null, "a bare relative path has no leading slash");
  assert.equal(safeHref(""), null);
  assert.equal(safeHref(undefined), null);
});

test("toBlocks caps the block count so an adversarial payload cannot hang a render", () => {
  const flood = Array.from({ length: 900 }, () => ({
    type: "paragraph",
    spans: [{ text: "x" }],
  }));

  assert.equal(toBlocks(flood).length, 400);
  assert.deepEqual(toBlocks("not an array"), []);
  assert.deepEqual(toBlocks(undefined), []);
});

/* ---------------------------------------------------------------- */
/* Test 22 — the records                                             */
/* ---------------------------------------------------------------- */

test("toPostSummary drops a record with no slug or no title", () => {
  assert.notEqual(toPostSummary(sampleSummary()), null);
  assert.equal(toPostSummary({ ...sampleSummary(), slug: "  " }), null);
  assert.equal(toPostSummary({ ...sampleSummary(), title: null }), null);
  assert.equal(toPostSummary(null), null);
});

test("a hero missing its thumbnail or its alt text is nulled, not half-rendered", () => {
  const withHero = toPostSummary(sampleSummary());
  assert.equal(withHero?.hero?.thumb, "https://crm.example/storage/posts/7/ab12_thumb.jpg");
  // The listing endpoint sends no `display`; a card must not invent one.
  assert.equal(withHero?.hero?.display, null);

  assert.equal(
    toPostSummary({ ...sampleSummary(), hero: { alt: "Only alt" } })?.hero,
    null,
  );
  assert.equal(
    toPostSummary({ ...sampleSummary(), hero: { thumb: "https://x/y.jpg" } })?.hero,
    null,
  );
  assert.equal(
    toPostSummary({ ...sampleSummary(), hero: { thumb: "https://x/y.jpg", alt: "   " } })
      ?.hero,
    null,
  );
  assert.equal(toPostSummary({ ...sampleSummary(), hero: null })?.hero, null);
});

test("reading time floors at one whole minute", () => {
  assert.equal(readingMinutes(6), 6);
  assert.equal(readingMinutes("4"), 4);
  assert.equal(readingMinutes(0), 1);
  assert.equal(readingMinutes(-3), 1);
  assert.equal(readingMinutes("lovely"), 1);
  assert.equal(readingMinutes(undefined), 1);
});

test("toPost falls back to the title and excerpt when the SEO fields are absent", () => {
  const raw: RawPost = {
    ...sampleSummary(),
    blocks: [{ type: "paragraph", spans: [{ text: "Body." }] }],
  };

  const post = toPost(raw);
  assert.equal(post?.metaTitle, "Importing a Toyota Alphard: what to expect");
  assert.equal(post?.metaDescription, "Every import follows the same six steps.");
  assert.equal(post?.blocks.length, 1);

  const withMeta = toPost({
    ...raw,
    meta_title: "Importing an Alphard",
    meta_description: "What the grade means.",
  });
  assert.equal(withMeta?.metaTitle, "Importing an Alphard");
  assert.equal(withMeta?.metaDescription, "What the grade means.");

  assert.equal(toPost({ ...raw, slug: null }), null);
});

/* ---------------------------------------------------------------- */
/* Presentation helpers                                              */
/* ---------------------------------------------------------------- */

test("postHref escapes the slug rather than trusting it", () => {
  assert.equal(postHref({ slug: "a-normal-slug" }), "/blog/a-normal-slug");
  assert.equal(postHref({ slug: "../cars" }), "/blog/..%2Fcars");
});

test("dates are formatted in UTC and unparseable ones are dropped", () => {
  assert.equal(formatPostDate("2026-08-14"), "14 August 2026");
  assert.equal(formatPostDate("not a date"), null);
  assert.equal(formatPostDate(null), null);
});

/* ---------------------------------------------------------------- */
/* The frozen wire contract (§6.1 / §6.2 of the design)              */
/* ---------------------------------------------------------------- */

/*
 * The two payloads below are the design document's own examples, pasted
 * literally. They are the contract between this repo and the CRM, and this test
 * is the only thing on this side that would notice the CRM quietly renaming a
 * key — every other test here feeds the normalisers hand-written objects, which
 * would keep passing while the real site rendered nothing.
 */

test("the listing payload from the contract normalises to a card", () => {
  const item = {
    slug: "importing-a-toyota-alphard-what-to-expect",
    title: "Importing a Toyota Alphard: what to expect",
    excerpt: "Every import follows the same six steps…",
    author: "Burraq Motors",
    published_at: "2026-08-14",
    updated_at: "2026-08-15",
    reading_minutes: 6,
    hero: {
      thumb: "https://crm.example/storage/posts/7/ab12_thumb.jpg",
      alt: "A silver Alphard on the forecourt",
    },
  };

  assert.deepEqual(toPostSummary(item), {
    slug: "importing-a-toyota-alphard-what-to-expect",
    title: "Importing a Toyota Alphard: what to expect",
    excerpt: "Every import follows the same six steps…",
    author: "Burraq Motors",
    publishedAt: "2026-08-14",
    updatedAt: "2026-08-15",
    readingMinutes: 6,
    hero: {
      thumb: "https://crm.example/storage/posts/7/ab12_thumb.jpg",
      display: null,
      alt: "A silver Alphard on the forecourt",
    },
  });
});

test("the detail payload from the contract normalises to an article", () => {
  const post = toPost({
    slug: "importing-a-toyota-alphard-what-to-expect",
    title: "Importing a Toyota Alphard: what to expect",
    excerpt: "Every import follows the same six steps…",
    author: "Burraq Motors",
    published_at: "2026-08-14",
    updated_at: "2026-08-15",
    reading_minutes: 6,
    hero: {
      thumb: "https://crm.example/storage/posts/7/ab12_thumb.jpg",
      display: "https://crm.example/storage/posts/7/ab12.jpg",
      alt: "A silver Alphard on the forecourt",
    },
    meta_title: "Importing a Toyota Alphard | Burraq Motors",
    meta_description: "Every import follows the same six steps…",
    blocks: [
      {
        type: "paragraph",
        spans: [
          { text: "We buy at auction in Japan, and " },
          { text: "every car", bold: true },
          { text: " is graded before we bid." },
        ],
      },
      { type: "heading", level: 2, spans: [{ text: "What the grade means" }] },
      {
        type: "list",
        ordered: false,
        items: [
          [{ text: "Grade 4 and above — " }, { text: "see our current stock", href: "/cars" }],
        ],
      },
      {
        type: "quote",
        spans: [{ text: "The sheet is the single best evidence of condition." }],
      },
      { type: "rule" },
    ],
  });

  assert.equal(post?.metaTitle, "Importing a Toyota Alphard | Burraq Motors");
  assert.equal(post?.hero?.display, "https://crm.example/storage/posts/7/ab12.jpg");

  assert.deepEqual(
    post?.blocks.map((block) => block.type),
    ["paragraph", "heading", "list", "quote", "rule"],
  );

  // The site-relative link into stock survives the allow-list intact — the
  // single most likely link in a dealership article.
  const list = post?.blocks.find((block) => block.type === "list");
  assert.equal(list?.items[0][1].href, "/cars");
  assert.equal(list?.items[0][1].text, "see our current stock");
});

test("blocksToText joins the prose and cuts on a word boundary", () => {
  const blocks = toBlocks([
    { type: "paragraph", spans: [{ text: "We buy at auction in Japan, and " }, { text: "every car", bold: true }, { text: " is graded." }] },
    { type: "rule" },
    { type: "list", ordered: false, items: [[{ text: "Grade 4 and above" }]] },
  ]);

  assert.equal(
    blocksToText(blocks),
    "We buy at auction in Japan, and every car is graded. Grade 4 and above",
  );

  const long = toBlocks([
    { type: "paragraph", spans: [{ text: "word ".repeat(80) }] },
  ]);
  const clipped = blocksToText(long);
  assert.ok(clipped.length <= 156, "stays inside the meta-description budget");
  assert.ok(clipped.endsWith("…"));
});
