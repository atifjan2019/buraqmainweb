import type { Metadata } from "next";
import Pagination from "@/components/Pagination";
import PostCard from "@/components/PostCard";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import StockNotice from "@/components/StockNotice";
import { DEFAULT_POSTS_PER_PAGE, getPosts } from "@/lib/crm";
import type { PostPage } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Journal",
  description:
    "Buying guides, import notes and dealership news from Burraq Motors in Manchester — how Japanese auction grades work, what an import actually costs, and what to check before you buy.",
};

type SearchParams = Record<string, string | string[] | undefined>;

/** Query strings can repeat a key; the first value wins. */
function single(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() ? first.trim() : undefined;
}

function positiveInt(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : undefined;
}

/**
 * The index degrades exactly as the stock listing does: a CRM outage becomes a
 * notice with a way to reach a human, never a bare empty grid that reads as
 * "this dealership has nothing to say".
 */
async function loadPosts(page: number): Promise<PostPage | null> {
  try {
    return await getPosts({ page, perPage: DEFAULT_POSTS_PER_PAGE });
  } catch (error) {
    console.error("[blog] index unavailable", error);
    return null;
  }
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = positiveInt(single(params.page)) ?? 1;

  const result = await loadPosts(page);

  return (
    <section className="bg-canvas pt-32 pb-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="From the Showroom"
          title="Burraq"
          accent="Journal"
          body="What we've learned buying, importing and preparing cars — written by the people who do it."
        />

        {result === null ? (
          <div className="mt-16">
            <StockNotice
              title="The journal is temporarily unavailable"
              body="We're having trouble loading our articles right now. Please try again in a moment — or message us and we'll answer the question directly."
              action={{ label: "Try again", href: "/blog" }}
            />
          </div>
        ) : result.posts.length === 0 ? (
          <div className="mt-16">
            <StockNotice
              title={
                page > 1
                  ? "There's nothing on this page"
                  : "The first article is on its way"
              }
              body={
                page > 1
                  ? "You've gone past the end of the journal. Head back to the first page to read what we have published."
                  : "We're writing up what we've learned importing and preparing cars. In the meantime, ask us anything — we answer the same questions on the phone every week."
              }
              action={
                page > 1
                  ? { label: "Back to the journal", href: "/blog" }
                  : { label: "Ask us a question", href: "/contact" }
              }
            />
          </div>
        ) : (
          <>
            {/* Chrome, so it takes the machined label voice rather than
                reading as another line of body copy. */}
            <p className="label-uppercase mt-16 border-b border-line-soft pb-4 text-ink">
              {result.meta.total === 1
                ? "1 article"
                : `${result.meta.total} articles`}
              {result.meta.lastPage > 1 && (
                <span className="text-faint">
                  {" "}
                  · page {result.meta.currentPage} of {result.meta.lastPage}
                </span>
              )}
            </p>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {result.posts.map((post, index) => (
                <Reveal key={post.slug} delay={(index % 3) * 90}>
                  {/* The first card is this page's LCP element — it must not
                      be lazy-loaded. */}
                  <PostCard post={post} priority={index === 0} />
                </Reveal>
              ))}
            </div>

            {/* No filters on this page, so no query to carry onto the page
                links — `Pagination` still needs the parameter. */}
            <Pagination meta={result.meta} params={{}} basePath="/blog" />
          </>
        )}
      </div>
    </section>
  );
}
