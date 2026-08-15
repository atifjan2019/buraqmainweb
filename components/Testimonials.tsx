import { getReviews } from "@/lib/crm";
import {
  liveHeadingBody,
  pickTestimonials,
  reviewDate,
  sourceLabel,
  type ReviewSummary,
  type ReviewSummarySource,
  type SiteReview,
} from "@/lib/reviews";
import { Star } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * What customers say, read from the CRM's cache of Google and Trustpilot
 * reviews. The CRM holds the provider credentials and does the fetching; this
 * section only reads the result, exactly as the stock sections do.
 *
 * When the CRM is unreachable or has nothing visible, it renders the hardcoded
 * quotes in `lib/site.ts` instead — an empty band is worse than six
 * true-but-static quotes. Fallback mode is byte-for-byte the section that
 * shipped before this feature.
 */
export default async function Testimonials() {
  const source = pickTestimonials(await getReviews(6));

  return (
    <section className="border-t border-line-soft bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our"
          accent="Customers Say"
          body={
            source.kind === "live"
              ? liveHeadingBody(source.summary)
              : "Don't just take our word for it — here's what drivers say after buying from us."
          }
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {source.kind === "live"
            ? source.reviews.map((review, i) => (
                <Reveal key={`${review.source}-${i}`} delay={(i % 3) * 90}>
                  <ReviewCard review={review} summary={source.summary} />
                </Reveal>
              ))
            : source.testimonials.map((t, i) => (
                <Reveal key={t.name} delay={(i % 3) * 90}>
                  <figure className="surface-card flex h-full flex-col p-8 transition-colors hover:border-ink">
                    {/* Stars in ink, not in a hue. The doc forbids introducing a
                        brand colour outside the tricolour, and the tricolour is
                        identity-only — it never lands on a rating. */}
                    <div
                      className="flex gap-1 text-ink"
                      aria-label="Rated 5 out of 5"
                    >
                      {Array.from({ length: 5 }).map((_, n) => (
                        <Star key={n} className="h-3.5 w-3.5" />
                      ))}
                    </div>

                    {/* The oversized quote glyph is gone with the rest of the
                        ornament; the rule and the tracking carry the structure. */}
                    <blockquote className="mt-6 flex-1 text-sm font-light leading-relaxed text-muted">
                      {t.quote}
                    </blockquote>

                    <figcaption className="mt-8 border-t border-line-soft pt-5">
                      <span className="label-uppercase block text-ink">
                        {t.name}
                      </span>
                      <span className="caption mt-2 block text-faint">
                        Verified Customer · {t.car}
                      </span>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
        </div>

        {source.kind === "live" && <ProfileLinks summary={source.summary} />}
      </div>
    </section>
  );
}

/**
 * One real review in the existing card idiom — same surface, same rule, same
 * type ramp. The three differences from the static card are all honesty
 * repairs: the stars reflect the actual rating, the attribution names the
 * provider instead of asserting "Verified Customer", and the provider word
 * links out where a permalink exists.
 */
function ReviewCard({
  review,
  summary,
}: {
  review: SiteReview;
  summary: ReviewSummary;
}) {
  const label = sourceLabel(review, summary);
  const date = reviewDate(review);

  // A review with no body but a title is quotable — the title IS the review.
  // `lib/reviews.ts` guarantees at least one of the two is present.
  const quote = review.body ?? review.title;
  const heading = review.body ? review.title : null;

  return (
    <figure className="surface-card flex h-full flex-col p-8 transition-colors hover:border-ink">
      {/* Stars in ink, not in a hue — same rule as the static card. The unfilled
          remainder drops to `text-faint` rather than disappearing, so a 3-star
          review reads as three out of five instead of as a short row. */}
      <div
        className="flex gap-1 text-ink"
        aria-label={`Rated ${review.rating} out of 5`}
      >
        {Array.from({ length: 5 }).map((_, n) => (
          <Star
            key={n}
            className={`h-3.5 w-3.5 ${n < review.rating ? "" : "text-faint"}`}
          />
        ))}
      </div>

      {heading && (
        <p className="label-uppercase mt-6 text-ink">{heading}</p>
      )}

      {/* A Trustpilot review can run to 2000 characters, so the body is clamped
          to keep the cards on a common height — the same reason the static
          quotes were written short. `lang` is set when the provider told us,
          so a screen reader does not read a German review in English. */}
      <blockquote
        className={`${heading ? "mt-4" : "mt-6"} flex-1 text-sm font-light leading-relaxed text-muted line-clamp-6`}
        lang={review.language ?? undefined}
      >
        {quote}
      </blockquote>

      <figcaption className="mt-8 border-t border-line-soft pt-5">
        <span className="label-uppercase block text-ink">
          {review.authorName}
        </span>
        <span className="caption mt-2 block text-faint">
          {review.url ? (
            <a
              href={review.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 transition-colors hover:text-ink"
            >
              {label}
            </a>
          ) : (
            label
          )}
          {date ? ` · ${date}` : ""}
        </span>
      </figcaption>
    </figure>
  );
}

/**
 * "Read our reviews on X", once per provider that published a profile link.
 *
 * DEVIATION from the design's *"Read all N reviews on Google"*: the count is
 * only printed for a source the CRM reports as complete. For Google it never
 * is — the Places API returns at most five reviews and cannot page through the
 * rest — so "Read all 5 reviews on Google" would advertise a cap as if it were
 * the dealership's whole reputation. The link still goes to the full profile,
 * which is where the real total lives.
 */
function ProfileLinks({ summary }: { summary: ReviewSummary }) {
  const linkable = summary.sources.filter(
    (entry): entry is ReviewSummarySource & { profileUrl: string } =>
      entry.profileUrl !== null,
  );
  if (linkable.length === 0) return null;

  return (
    <Reveal delay={120}>
      <div className="mt-16 flex flex-wrap justify-center gap-4">
        {linkable.map((entry) => (
          <a
            key={entry.key}
            href={entry.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            {profileLinkLabel(entry)}
          </a>
        ))}
      </div>
    </Reveal>
  );
}

function profileLinkLabel(entry: ReviewSummarySource): string {
  return entry.isComplete
    ? `Read all ${entry.count} reviews on ${entry.label}`
    : `Read our reviews on ${entry.label}`;
}
