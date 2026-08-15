import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CtaBanner from "@/components/CtaBanner";
import { ArrowRight } from "@/components/Icons";
import PostBody from "@/components/PostBody";
import StockNotice from "@/components/StockNotice";
import { CrmError, getPost } from "@/lib/crm";
import {
  blocksToText,
  formatPostDate,
  postHref,
  type Post,
} from "@/lib/posts";
import { site } from "@/lib/site";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * No `generateStaticParams`: posts appear, change and are unpublished from the
 * CRM without a deploy, so this route stays dynamic-with-revalidation exactly
 * like `/cars/[slug]`. `cacheComponents` is off, so the `next: { revalidate,
 * tags }` options on the fetch in `lib/crm.ts` are the current caching model —
 * confirmed against
 * `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`.
 *
 * Mirrors `loadVehicle`: "we can't tell" and "there is no such article" are
 * different answers, and only the second one is a 404. Both this and
 * `generateMetadata` call it with the same argument, and identical fetches are
 * memoised within a render, so the page costs one request.
 */
async function loadPost(slug: string) {
  try {
    return { post: await getPost(slug), reachable: true };
  } catch (error) {
    if (error instanceof CrmError) {
      console.error(`[blog] could not load ${slug}`, error);
      return { post: null, reachable: false };
    }
    throw error;
  }
}

/** Never empty: falls back through the excerpt to the body's own opening. */
function description(post: Post): string {
  return post.metaDescription || blocksToText(post.blocks);
}

/**
 * The `<title>`.
 *
 * The root layout appends `| Burraq Motors` through its title template, and the
 * SEO title is a free-text field a dealership owner types — so it routinely
 * already ends in the dealership's name. Returning it verbatim in that case
 * would ship "… | Burraq Motors | Burraq Motors" to Google, so a title that
 * already names the business opts out of the template instead.
 */
function documentTitle(post: Post): Metadata["title"] {
  const title = post.metaTitle;

  return title.toLowerCase().includes(site.name.toLowerCase())
    ? { absolute: title }
    : title;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await loadPost(slug);

  // Covers a draft, a post scheduled for a future date, a deleted one, a slug
  // that never existed, and a CRM we couldn't reach. None of them should be
  // indexed under this URL.
  if (!post) {
    return { title: "Article not found", robots: { index: false } };
  }

  const summary = description(post);
  const canonical = postHref(post);

  return {
    title: documentTitle(post),
    description: summary || undefined,
    alternates: { canonical },
    openGraph: {
      title: `${post.title} | ${site.name}`,
      description: summary || undefined,
      url: canonical,
      type: "article",
      // Plain `YYYY-MM-DD` from the CRM, which is valid ISO 8601 and what
      // `article:published_time` wants. Deliberately not widened to a datetime
      // here: the CRM publishes a date, and inventing a time would invite the
      // timezone drift the date-only contract exists to avoid.
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      ...(post.author ? { authors: [post.author] } : {}),
      // Absolute already — the CRM is a different origin, and OG images must
      // be absolute. Omitted entirely rather than sent as an empty array.
      ...(post.hero?.display ? { images: [post.hero.display] } : {}),
    },
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const { post, reachable } = await loadPost(slug);

  // The CRM is down: we can't tell whether this article exists, so we mustn't
  // claim it's gone.
  if (!reachable) {
    return (
      <section className="bg-canvas pt-32 pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <StockNotice
            title="We can't load this article right now"
            body="Something went wrong reaching our content system. Please try again in a moment — or message us and we'll answer the question directly."
            action={{ label: "Back to the journal", href: "/blog" }}
          />
        </div>
      </section>
    );
  }

  // A draft, a scheduled post, a deleted one and a slug that never existed are
  // all a bare 404 from the API and all land here — a real 404 status with real
  // copy, never an empty shell.
  if (!post) notFound();

  const published = formatPostDate(post.publishedAt);
  const updated = formatPostDate(post.updatedAt);
  const hero = post.hero;
  /* The detail endpoint always sends `display` (1600×900); the thumbnail is a
     fallback for a payload that somehow omitted it. That pulls a 640px JPEG
     into a 992px box, which is soft — but a soft photograph beats an article
     whose masthead is a grey rectangle. It should never happen. */
  const heroSrc = hero?.display ?? hero?.thumb ?? null;

  // Joined rather than interpolated: an article with no date recorded would
  // otherwise render a stranded "· Burraq Motors · 6 min read".
  const byline = [published, post.author, `${post.readingMinutes} min read`]
    .filter((part) => part?.trim())
    .join(" · ");

  return (
    <>
      <article className="bg-canvas pt-32 pb-24">
        {/* Starts the LCP image downloading before the figure is parsed.
            React hoists this into <head>. */}
        {heroSrc && (
          <link rel="preload" as="image" href={heroSrc} fetchPriority="high" />
        )}

        <script
          type="application/ld+json"
          /*
            Built server-side from a JS object — never from author markup, of
            which there is none in this system. `JSON.stringify` escapes quotes
            but not `<`, so a `</script>` inside a title would otherwise close
            this element early; the replace below is what makes that impossible.
            This is the only `dangerouslySetInnerHTML` the blog touches, and it
            touches no author input as markup.
          */
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(postJsonLd(post)).replace(
              /</g,
              "\\u003c",
            ),
          }}
        />

        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Link href="/blog" className="link-m">
            <ArrowRight className="h-3.5 w-3.5 rotate-180" />
            The journal
          </Link>

          {/*
            Nothing on this page is wrapped in `Reveal`, and that is deliberate.
            `[data-reveal]` is hidden until an IntersectionObserver runs after
            hydration, and gating six minutes of reading — and the page's entire
            SEO payload — on a bundle loading is not a trade this page gets to
            make. Do not "tidy this up" by wrapping it, for the same reason
            `app/not-found.tsx` records for its hero.
          */}
          <header className="mx-auto mt-10 max-w-[42rem]">
            {byline && <span className="eyebrow">{byline}</span>}

            <h1 className="display-md mt-6 break-words text-ink">
              {post.title}
            </h1>
          </header>

          {hero && heroSrc && (
            /* The picture breaks out past the text column so the measure below
               reads as a deliberate choice rather than as a narrow page. */
            <figure className="mx-auto mt-10 max-w-[62rem]">
              <div className="photo-frame aspect-16/9 overflow-hidden bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element --
                    next/image would proxy this through /_next/image and pin a
                    replaced photograph to a stale copy; the CRM already serves
                    a correctly-sized 1600×900 JPEG. */}
                <img
                  src={heroSrc}
                  alt={hero.alt}
                  width={1600}
                  height={900}
                  fetchPriority="high"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </div>
            </figure>
          )}

          {/*
            42rem — about 66–75 characters at the body size below, which is the
            whole reason this page is one centred column rather than the site's
            usual full-width grid.
          */}
          <div className="mx-auto mt-14 max-w-[42rem]">
            {post.blocks.length > 0 ? (
              <PostBody blocks={post.blocks} />
            ) : (
              /* The CRM's publish gate requires at least one block, so this is
                 a payload we should never see. It still prints the excerpt
                 rather than an empty column, because an article page with
                 nothing under the headline reads as a broken site. */
              post.excerpt && (
                <p className="text-lg font-light leading-[1.7] text-lead">
                  {post.excerpt}
                </p>
              )
            )}

            <footer className="mt-16 border-t border-line-soft pt-8">
              {(post.author || updated) && (
                <p className="label-uppercase-sm text-faint">
                  {[
                    post.author ? `Written by ${post.author}` : "",
                    updated ? `Updated ${updated}` : "",
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              <div className="mt-6">
                <Link href="/blog" className="link-m">
                  <ArrowRight className="h-3.5 w-3.5 rotate-180" />
                  Back to the journal
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>

      <CtaBanner />
    </>
  );
}

/**
 * schema.org `BlogPosting`, so the article is eligible for rich results.
 *
 * `author` is the Organization rather than the printed byline: the byline is a
 * free-text field the dealership types, and asserting a `Person` from it would
 * publish a claim about a named individual that nothing verifies.
 */
function postJsonLd(post: Post) {
  const url = `${site.url}${postHref(post)}`;
  const summary = description(post);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    ...(summary ? { description: summary } : {}),
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.updatedAt || post.publishedAt
      ? { dateModified: post.updatedAt ?? post.publishedAt }
      : {}),
    author: { "@type": "Organization", name: site.name },
    publisher: { "@type": "Organization", name: site.name },
    ...(post.hero?.display ? { image: [post.hero.display] } : {}),
  };
}
