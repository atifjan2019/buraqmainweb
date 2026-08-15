import Link from "next/link";
import { formatPostDate, postHref, type PostSummary } from "@/lib/posts";
import { ArrowRight } from "./Icons";

interface PostCardProps {
  post: PostSummary;
  /**
   * Set on the first card of the grid only. That card is the index page's LCP
   * element, and lazy-loading an LCP image delays it measurably.
   */
  priority?: boolean;
}

/**
 * Article card — the `magazine-article-card` of DESIGN-bmw-m.md, built the same
 * way `VehicleCard` is: a photograph on plain canvas with no card surface, no
 * shadow and no radius. The photograph is the card.
 *
 * 16:9 rather than the stock grid's 16:10, because the CRM stores every hero at
 * 1600×900 and re-cropping it here would letterbox a picture that was already
 * cropped once. Hover moves the image, never the frame.
 *
 * Heroes are served straight from the CRM's own URLs — never proxied or
 * re-hosted, so a photograph swapped in the CRM appears here on the next
 * revalidation rather than being pinned to a stale cached copy. That rules out
 * `next/image`, whose default loader re-fetches through `/_next/image`, for the
 * same reason `VehicleCard` avoids it.
 */
export default function PostCard({ post, priority }: PostCardProps) {
  const href = postHref(post);
  const date = formatPostDate(post.publishedAt);

  // Joined rather than interpolated with literal separators: an article with no
  // date recorded would otherwise render a stranded "· 6 min read".
  const meta = [date, `${post.readingMinutes} min read`].filter(Boolean);

  return (
    <article className="group flex h-full flex-col">
      <Link href={href} tabIndex={-1} aria-hidden className="block">
        <div className="photo-frame relative aspect-16/9 overflow-hidden bg-surface-2">
          {post.hero ? (
            /* eslint-disable-next-line @next/next/no-img-element --
               next/image would proxy these through /_next/image; the CRM
               already serves a correctly-sized, cached 640×360 JPEG. */
            <img
              src={post.hero.thumb}
              alt={post.hero.alt}
              width={640}
              height={360}
              loading={priority ? "eager" : "lazy"}
              fetchPriority={priority ? "high" : "auto"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            /* A typographic stand-in, never a broken <img>. Decorative: the
               title sits directly beneath it as real text. */
            <div
              aria-hidden
              className="flex h-full w-full flex-col items-center justify-center gap-4 bg-surface-2"
            >
              <span className="m-stripe h-1 w-12" />
              <p className="label-uppercase-sm px-4 text-center text-ink">
                Burraq Journal
              </p>
            </div>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-5">
        {meta.length > 0 && (
          <p className="label-uppercase-sm text-faint">{meta.join(" · ")}</p>
        )}

        {/* Two lines, then an ellipsis: a long headline must not be allowed to
            push the excerpt out of alignment across a three-up grid. */}
        <h3 className="title-lg mt-3 line-clamp-2 text-ink">
          <Link href={href}>{post.title}</Link>
        </h3>

        {post.excerpt && (
          <p className="mt-3 line-clamp-3 text-sm font-light leading-relaxed text-muted">
            {post.excerpt}
          </p>
        )}

        {/* min-h from `link-m` carries this to the 44px touch minimum. */}
        <div className="mt-auto flex items-center border-t border-line-soft pt-5">
          <Link href={href} className="link-m" tabIndex={-1} aria-hidden>
            Read the article
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
