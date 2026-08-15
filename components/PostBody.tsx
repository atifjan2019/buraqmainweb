import Link from "next/link";
import type { ReactNode } from "react";
import type { Block, Span } from "@/lib/posts";

/**
 * The body of an article, rendered from the CRM's block tree.
 *
 * ─── WHERE THE SANITISING HAPPENED, AND WHY THIS IS SAFE ────────────────────
 *
 * Nothing on this page is HTML that an author typed, because no HTML is ever
 * produced from author input anywhere in the system. The dealership writes
 * Burraq Markdown — a tiny line-oriented subset — into a textarea in the CRM.
 * The CRM compiles it ONCE, server-side, in
 * `App\Services\Posts\PostBody::blocks()`, into the typed tree of plain strings
 * that `lib/posts.ts` models. That compiler emits arrays, never markup; there
 * is no code path in either repo that concatenates author text into a tag.
 *
 * So the safety here rests on three independent facts, any one of which would
 * be sufficient on its own:
 *
 *   1. Every string below lands in JSX children, and React escapes JSX
 *      children. An author who types `<script>alert(1)</script>` gets those
 *      seventeen characters painted on the page as text. `<img src=x
 *      onerror=alert(1)>` is likewise a sentence, not an element.
 *   2. The only value in the whole tree that is NOT rendered as text is a
 *      link's `href`, and it is allow-listed twice: by `PostBody::safeHref()`
 *      in the CRM on the way in, and again by `safeHref()` in `lib/posts.ts`
 *      on the way here. `javascript:`, `data:`, `vbscript:` and
 *      protocol-relative `//host` are all dropped, and a dropped href degrades
 *      the link to its own label rather than losing the sentence.
 *   3. This file contains no `dangerouslySetInnerHTML`, and must not grow one.
 *      The single such call on the whole site is the JSON-LD script on the car
 *      and article pages, which is built from a JS object and `<`-escaped
 *      before serialisation — it never touches author input as markup.
 *
 * If someone ever "improves" the CRM to send an `html` field, this component is
 * where that lands, and it is the wrong place to render it. Delete the field,
 * not this comment.
 *
 * ─── THE TYPE ───────────────────────────────────────────────────────────────
 *
 * This is the only long-form reading on the site, so the scale is set here
 * rather than borrowed from card type: a 42rem measure (66–75 characters at the
 * body size), 1.75 leading, and `text-lead` rather than `text-muted` — muted is
 * the site's supporting voice, and six minutes of it is a tiring read. Section
 * headings carry a hairline above them, which is the BMW-M chapter device and
 * gives the page its vertical structure without one decorative element.
 */

interface PostBodyProps {
  blocks: Block[];
}

/** Bold and italic, applied to the text of one run. */
function emphasise(span: Span, key: number): ReactNode {
  let node: ReactNode = span.text;

  if (span.italic) node = <em>{node}</em>;
  // Explicit 700 rather than the UA's `bolder`: body copy is Light 300 here,
  // and `bolder` from 300 computes to a barely-visible 400. The 300/700 pair
  // is the editorial signature of this system, so bold means bold.
  if (span.bold) node = <strong className="font-bold">{node}</strong>;

  return <span key={key}>{node}</span>;
}

/**
 * One inline run. A run with an `href` has already cleared the allow-list in
 * `lib/posts.ts` — that is the only reason it is safe to put it in an
 * attribute here.
 */
function renderSpan(span: Span, key: number): ReactNode {
  const content = emphasise(span, key);

  if (!span.href) return content;

  const linkClass =
    "text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink";

  // Site-relative: client-side navigation, and no `target`/`rel` needed.
  if (span.href.startsWith("/")) {
    return (
      <Link key={key} href={span.href} className={linkClass}>
        {content}
      </Link>
    );
  }

  const isExternalPage = /^https?:/i.test(span.href);

  return (
    <a
      key={key}
      href={span.href}
      className={linkClass}
      // These URLs are typed by the dealership, not vetted by us. A new tab
      // keeps the reader's place; `noopener` denies the target a handle on this
      // window; `nofollow` is the prudent default for an author-typed outbound
      // link. mailto: and tel: get none of it — a new tab for a mail client is
      // just an orphaned blank window.
      {...(isExternalPage
        ? { target: "_blank", rel: "noopener noreferrer nofollow" }
        : {})}
    >
      {content}
    </a>
  );
}

function renderSpans(spans: Span[]): ReactNode[] {
  return spans.map((span, index) => renderSpan(span, index));
}

/** Running text, shared by paragraphs and list items. */
const PROSE = "text-base font-light leading-[1.75] text-lead";

export default function PostBody({ blocks }: PostBodyProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return block.level === 2 ? (
              /* The hairline above each section is the whole structure of this
                 page. h2 also loses its top rule when it opens the article,
                 which it never should — the lede does. */
              <h2
                key={index}
                className="display-sm mt-16 border-t border-line-soft pt-8 text-ink"
              >
                {renderSpans(block.spans)}
              </h2>
            ) : (
              <h3 key={index} className="title-lg mt-10 text-ink">
                {renderSpans(block.spans)}
              </h3>
            );

          case "paragraph":
            /* The opening paragraph is the lede: one step up in size and a
               touch more open, so the article has a way in. Every paragraph
               after it is body copy. */
            return index === 0 ? (
              <p
                key={index}
                className="text-lg font-light leading-[1.7] text-lead"
              >
                {renderSpans(block.spans)}
              </p>
            ) : (
              <p key={index} className={`mt-6 ${PROSE}`}>
                {renderSpans(block.spans)}
              </p>
            );

          case "quote":
            /* No italics, no quotation glyph, no tint — a 2px ink rule and a
               size step is the entire device. */
            return (
              <blockquote
                key={index}
                className="my-10 border-l-2 border-ink pl-6 text-lg font-light leading-[1.6] text-ink"
              >
                {renderSpans(block.spans)}
              </blockquote>
            );

          case "list": {
            const Tag = block.ordered ? "ol" : "ul";

            return (
              /* `list-none` with our own markers: this system has no round
                 shapes below `full`, and `full` is icon-buttons only, so the
                 bullet is a 4px square. Both flavours hang in a fixed 2rem
                 gutter, which is what keeps a wrapped item's second line
                 aligned with its first rather than under the marker. */
              <Tag key={index} className="mt-6 list-none space-y-3">
                {block.items.map((item, itemIndex) => (
                  <li
                    key={itemIndex}
                    className={`grid grid-cols-[2rem_1fr] ${PROSE}`}
                  >
                    {block.ordered ? (
                      <span
                        aria-hidden
                        className="label-uppercase-sm pt-[0.5em] text-faint"
                      >
                        {itemIndex + 1}.
                      </span>
                    ) : (
                      <span
                        aria-hidden
                        className="mt-[0.75em] block h-1 w-1 bg-line"
                      />
                    )}
                    <span>{renderSpans(item)}</span>
                  </li>
                ))}
              </Tag>
            );
          }

          case "rule":
            return (
              <hr key={index} className="my-14 h-px border-0 bg-line-soft" />
            );
        }
      })}
    </>
  );
}
