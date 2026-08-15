/**
 * Blog posts, as the CRM publishes them.
 *
 * The dealership writes articles in the CRM back office; this site reads
 * `/api/v1/posts` exactly as it reads stock and reviews. There is no MDX, no
 * content directory and no deploy in the loop — a post is a row.
 *
 * This module is deliberately free of `server-only` and of every Next import:
 * it holds the wire types and the normalisers, so all of them are directly
 * runnable under `node --test` (see `posts.test.ts`), the same split
 * `lib/reviews.ts` already makes. The fetch itself lives in `lib/crm.ts`.
 *
 * ─── WHY NOTHING HERE HAS TO SANITISE HTML ──────────────────────────────────
 *
 * The CRM never sends HTML. An article's source is Burraq Markdown — a tiny
 * line-oriented subset the owner types into a textarea — and the CRM compiles
 * it ONCE, server-side, in `App\Services\Posts\PostBody::blocks()`, into the
 * typed block tree modelled below: arrays of plain strings. No markup string is
 * produced, stored or transmitted at either end.
 *
 * That leaves exactly one value in the whole payload that is not rendered as
 * text: a link's `href`. It is allow-listed twice — by `PostBody::safeHref()`
 * at the CRM boundary, and again by `safeHref()` here, because everything
 * arriving over the wire is untrusted regardless of who we believe sent it.
 * That is the same discipline `toImage` / `toBranch` / `toDocument` already
 * apply in `lib/crm.ts`.
 *
 * Consequently `components/PostBody.tsx` needs no sanitiser and contains no
 * `dangerouslySetInnerHTML`: every string it receives lands in JSX children,
 * which React escapes. See the safety note at the top of that file.
 */

/* The `.ts` extension is load-bearing, not a slip: `posts.test.ts` runs this
   module under Node's native type-stripping, whose ESM resolver does not guess
   extensions. The import below is type-only and therefore erased outright, but
   it is written the same way so the convention holds if it ever gains a value
   import. `tsconfig.json` carries `allowImportingTsExtensions` for this. */
import type { PageMeta } from "./vehicles.ts";

/* ---------------------------------------------------------------- */
/* Wire format — the frozen contract in §6 of the design             */
/* ---------------------------------------------------------------- */

/** One inline run as `PublicPostResource` sends it. Every field untrusted. */
interface RawSpan {
  text?: unknown;
  bold?: unknown;
  italic?: unknown;
  href?: unknown;
}

/**
 * One block. The CRM emits a closed set of five shapes, but this type is
 * deliberately loose: a CRM that grows a sixth must arrive as *data we drop*,
 * not as a runtime error in a Server Component.
 */
interface RawBlock {
  type?: unknown;
  level?: unknown;
  ordered?: unknown;
  spans?: unknown;
  items?: unknown;
}

/** The hero photograph. `display` is sent by the detail endpoint only. */
interface RawPostHero {
  thumb?: string | null;
  display?: string | null;
  alt?: string | null;
}

/** One post as the listing endpoint sends it. */
export interface RawPostSummary {
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  author?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  reading_minutes?: unknown;
  hero?: RawPostHero | null;
}

/** One post as the detail endpoint sends it: the summary plus SEO and body. */
export interface RawPost extends RawPostSummary {
  meta_title?: string | null;
  meta_description?: string | null;
  blocks?: unknown;
}

/* ---------------------------------------------------------------- */
/* Site types                                                        */
/* ---------------------------------------------------------------- */

/** An inline run of text, optionally emphasised and optionally a link. */
export interface Span {
  text: string;
  bold?: boolean;
  italic?: boolean;
  /** Already allow-listed. Absent means "render the label as plain text". */
  href?: string;
}

/**
 * A block of an article. Closed union, because `components/PostBody.tsx`
 * renders each arm with its own element and a `default` that renders nothing
 * would be a silent hole rather than a compile error.
 */
export type Block =
  | { type: "heading"; level: 2 | 3; spans: Span[] }
  | { type: "paragraph"; spans: Span[] }
  | { type: "quote"; spans: Span[] }
  | { type: "list"; ordered: boolean; items: Span[][] }
  | { type: "rule" };

/** The hero photograph, normalised. */
export interface PostHero {
  /** 640×360. The only size the listing endpoint sends. */
  thumb: string;
  /** 1600×900, detail endpoint only. Null on a card. */
  display: string | null;
  /** Never empty: a hero with no alt text is dropped entirely. */
  alt: string;
}

/** A post as a card renders it. */
export interface PostSummary {
  slug: string;
  title: string;
  excerpt: string;
  /** The printed byline. May be empty — the card simply omits it. */
  author: string;
  /** Plain `YYYY-MM-DD`, matching `mot_expiry` / `reviewed_at`. */
  publishedAt: string | null;
  updatedAt: string | null;
  readingMinutes: number;
  hero: PostHero | null;
}

/** A post as the article page renders it. */
export interface Post extends PostSummary {
  /** Already fallen back to `title` by the CRM. Never empty. */
  metaTitle: string;
  /** Already fallen back to the excerpt by the CRM. May be empty. */
  metaDescription: string;
  blocks: Block[];
}

/**
 * One page of the index. `meta` is the shape `components/Pagination.tsx`
 * takes — imported rather than re-declared so the two cannot drift.
 */
export interface PostPage {
  posts: PostSummary[];
  meta: PageMeta;
}

/* ---------------------------------------------------------------- */
/* Caps                                                              */
/* ---------------------------------------------------------------- */

/*
 * The CRM's compiler already stops at these numbers. They are repeated here
 * rather than trusted, because "the other end already checked" is precisely the
 * assumption that turns one bug into two outages: a hostile or simply broken
 * payload must cost this page a truncated article, never a hung render.
 */
const MAX_BLOCKS = 400;
const MAX_SPANS = 200;
const MAX_ITEMS = 200;

/* ---------------------------------------------------------------- */
/* Normalisers                                                       */
/* ---------------------------------------------------------------- */

/** Collapses a possibly-absent string to a trimmed value, or "". */
function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Collapses a possibly-absent string to a trimmed value, or null. */
function optional(value: unknown): string | null {
  const trimmed = text(value);
  return trimmed ? trimmed : null;
}

/**
 * The href allow-list — the one attribute in the entire block tree, and the
 * only value that is not rendered as text.
 *
 * Identical in intent to `PostBody::safeHref()` in the CRM, re-run here because
 * a first-party API is still an untrusted input: if the CRM's copy is ever
 * loosened by accident, an `href` still cannot become script execution on this
 * origin.
 *
 *   1. Strip every ASCII control character — including TAB, LF, CR and NUL —
 *      from anywhere in the string, then trim. This is what kills
 *      `java\nscript:alert(1)`, which browsers have historically accepted.
 *   2. Reject anything still containing whitespace.
 *   3. Accept, case-insensitively: `https:`, `http:`, `mailto:`, `tel:`, and
 *      site-relative `/…`.
 *   4. Reject everything else.
 *
 * A rejected link is *degraded, not dropped*: `toSpan` keeps the label as
 * ordinary text. The reader still gets the sentence; the attack surface is gone.
 */
export function safeHref(value: unknown): string | null {
  if (typeof value !== "string") return null;

  // Escaped rather than literal control characters, so the class stays readable
  // and a stray raw byte cannot be pasted into it unnoticed. TAB, LF, CR and NUL
  // are inside the range on purpose — they are what scheme-splicing uses.
  const cleaned = value.replace(/[\u0000-\u001F\u007F]/g, "").trim();

  if (!cleaned || /\s/.test(cleaned)) return null;

  if (/^(https?:\/\/|mailto:|tel:)/i.test(cleaned)) return cleaned;

  /*
   * Site-relative only. `//evil.example` is protocol-relative and points at
   * another host, so a second `/` disqualifies it — and so does a backslash,
   * which several browsers normalise to `/` while parsing, making `/\evil.example`
   * exactly as dangerous as `//evil.example`. (That backslash case is a
   * hardening this side; the CRM rejects the double slash by the same rule.)
   */
  if (cleaned.startsWith("/") && !/^\/[/\\]/.test(cleaned)) return cleaned;

  return null;
}

/**
 * One inline run. Dropped when it carries no `text` at all — a span with only
 * `bold: true` renders nothing and would just add an empty element.
 *
 * Whitespace-only text is KEPT: the compiler emits the spaces between a
 * sentence and the bold word inside it as their own spans, and trimming those
 * would run the words together.
 */
function toSpan(raw: unknown): Span | null {
  if (typeof raw !== "object" || raw === null) return null;

  const candidate = raw as RawSpan;
  if (typeof candidate.text !== "string" || candidate.text === "") return null;

  const span: Span = { text: candidate.text };

  // `=== true` rather than truthy: a CRM sending `"bold": "no"` must not bold.
  if (candidate.bold === true) span.bold = true;
  if (candidate.italic === true) span.italic = true;

  const href = safeHref(candidate.href);
  if (href) span.href = href;

  return span;
}

function toSpans(raw: unknown): Span[] {
  if (!Array.isArray(raw)) return [];

  const spans: Span[] = [];
  for (const entry of raw.slice(0, MAX_SPANS)) {
    const span = toSpan(entry);
    if (span) spans.push(span);
  }
  return spans;
}

/**
 * One block, or null when it cannot be rendered honestly.
 *
 * An unknown `type`, a heading with no text, a list with no items — each is
 * dropped rather than rendered as an empty element. A CRM that grows a sixth
 * block type therefore degrades to *that block missing*, never to a crash.
 */
function toBlock(raw: unknown): Block | null {
  if (typeof raw !== "object" || raw === null) return null;

  const candidate = raw as RawBlock;

  switch (candidate.type) {
    case "heading": {
      const spans = toSpans(candidate.spans);
      if (spans.length === 0) return null;
      // Only h2 and h3 exist: the article's <h1> is the post title, and the
      // CRM's compiler already folds a lone `#` down to level 2.
      return { type: "heading", level: candidate.level === 3 ? 3 : 2, spans };
    }

    case "paragraph": {
      const spans = toSpans(candidate.spans);
      return spans.length === 0 ? null : { type: "paragraph", spans };
    }

    case "quote": {
      const spans = toSpans(candidate.spans);
      return spans.length === 0 ? null : { type: "quote", spans };
    }

    case "list": {
      if (!Array.isArray(candidate.items)) return null;

      const items: Span[][] = [];
      for (const entry of candidate.items.slice(0, MAX_ITEMS)) {
        const spans = toSpans(entry);
        if (spans.length > 0) items.push(spans);
      }

      return items.length === 0
        ? null
        : { type: "list", ordered: candidate.ordered === true, items };
    }

    case "rule":
      return { type: "rule" };

    default:
      return null;
  }
}

/** The whole block tree, capped. */
export function toBlocks(raw: unknown): Block[] {
  if (!Array.isArray(raw)) return [];

  const blocks: Block[] = [];
  for (const entry of raw.slice(0, MAX_BLOCKS)) {
    const block = toBlock(entry);
    if (block) blocks.push(block);
  }
  return blocks;
}

/**
 * A whole-minute reading time, floored at 1.
 *
 * The CRM computes it from the source text; this only refuses to print
 * "0 MIN READ" or "NaN MIN READ" if the field ever arrives unusable.
 */
export function readingMinutes(value: unknown): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.round(parsed);
}

/**
 * Rejects a hero that cannot be rendered honestly.
 *
 * No `thumb` means there is no picture to show; no `alt` means there is one
 * but nobody has said what it is, and an unlabelled editorial photograph is
 * worse than none — the card's typographic fallback at least says something
 * true. The CRM requires alt text at publish time, so this should never fire;
 * it exists because "should never" is not a rendering guarantee.
 */
function toHero(raw: RawPostHero | null | undefined): PostHero | null {
  const thumb = optional(raw?.thumb);
  const alt = optional(raw?.alt);

  if (!thumb || !alt) return null;

  return { thumb, display: optional(raw?.display), alt };
}

/**
 * One card's worth of post, or null when it has no slug (nothing to link to)
 * or no title (nothing to print) — the same "drop the half-populated record"
 * rule the vehicle normalisers already follow.
 */
export function toPostSummary(
  raw: RawPostSummary | null | undefined,
): PostSummary | null {
  const slug = text(raw?.slug);
  const title = text(raw?.title);

  if (!slug || !title) return null;

  return {
    slug,
    title,
    excerpt: text(raw?.excerpt),
    author: text(raw?.author),
    publishedAt: optional(raw?.published_at),
    updatedAt: optional(raw?.updated_at),
    readingMinutes: readingMinutes(raw?.reading_minutes),
    hero: toHero(raw?.hero),
  };
}

/** A whole article, or null when the summary half is unusable. */
export function toPost(raw: RawPost | null | undefined): Post | null {
  const summary = toPostSummary(raw);
  if (!summary) return null;

  return {
    ...summary,
    // The CRM emits these already fallen back (`meta_title ?: title`), so the
    // fallback here is only for a payload that omitted the key outright.
    metaTitle: text(raw?.meta_title) || summary.title,
    metaDescription: text(raw?.meta_description) || summary.excerpt,
    blocks: toBlocks(raw?.blocks),
  };
}

/* ---------------------------------------------------------------- */
/* Presentation helpers                                              */
/* ---------------------------------------------------------------- */

/**
 * The public URL of a post.
 *
 * `encodeURIComponent` for the same reason `getVehicle` uses it: the slug is a
 * CRM-controlled string arriving over the wire, and a crafted one must not be
 * able to escape its path segment.
 */
export function postHref(post: Pick<PostSummary, "slug">): string {
  return `/blog/${encodeURIComponent(post.slug)}`;
}

/* Published dates arrive as plain YYYY-MM-DD, so they are formatted in UTC —
 * reading them in a western timezone would otherwise roll them back a day.
 * Same reasoning and same shape as `formatDate` in `lib/vehicles.ts`,
 * duplicated rather than imported so this module stays loadable by
 * `node --test` without dragging the vehicle domain in. */
const postDateFormat = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats a post's date, or null when it is missing or unparseable. */
export function formatPostDate(iso: string | null): string | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : postDateFormat.format(parsed);
}

/**
 * The plain text of a block tree, for a meta description when the CRM sent an
 * article with no excerpt at all. Joined with spaces, capped, cut on a word
 * boundary — never mid-word, and never longer than a search engine will print.
 */
export function blocksToText(blocks: Block[], limit = 155): string {
  const parts: string[] = [];

  for (const block of blocks) {
    if (block.type === "rule") continue;

    if (block.type === "list") {
      for (const item of block.items) {
        parts.push(item.map((span) => span.text).join(""));
      }
      continue;
    }

    parts.push(block.spans.map((span) => span.text).join(""));
  }

  const joined = parts.join(" ").replace(/\s+/g, " ").trim();
  if (joined.length <= limit) return joined;

  const clipped = joined.slice(0, limit);
  const lastSpace = clipped.lastIndexOf(" ");
  return `${(lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).trimEnd()}…`;
}
