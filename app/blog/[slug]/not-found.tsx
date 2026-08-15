import StockNotice from "@/components/StockNotice";

/**
 * Shown when the CRM has no published article at this slug.
 *
 * That is one status for four situations the API deliberately cannot tell
 * apart: the post is still a draft, it is scheduled for a future date, it has
 * been deleted, or the address never existed. Distinguishing them here would
 * confirm to anyone guessing URLs that a draft with that name exists, so the
 * copy assumes the ordinary case — someone followed a link to a piece that
 * isn't published.
 *
 * Rendered by `notFound()` in `page.tsx`, which is what makes this a real 404
 * rather than a 200 with apologetic text.
 */
export default function PostNotFound() {
  return (
    <section className="bg-canvas pt-32 pb-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <StockNotice
          title="This article isn't published"
          body="The link you followed points at something we haven't put up, or have since taken down. Everything we have written is in the journal — and if you came here with a question, just ask us."
          action={{ label: "Back to the journal", href: "/blog" }}
        />
      </div>
    </section>
  );
}
