import Link from "next/link";
import { getRecentPosts } from "@/lib/crm";
import { ArrowRight } from "./Icons";
import PostCard from "./PostCard";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * "Recent from the blog" — the homepage's editorial band.
 *
 * Returns null when there is nothing to show. That covers three cases with one
 * rule: a CRM outage (`getRecentPosts` already degrades to an empty list), a
 * dealership that has not written its first article yet, and every post still
 * being a draft. In all three the homepage simply loses a band — which is
 * correct. `FeaturedVehicles` can afford an empty-state paragraph because stock
 * is the reason the site exists; a blog band apologising for having no blog is
 * just a hole with a caption.
 *
 * Placed after `<Testimonials />` and before `<CtaBanner />`: it is editorial
 * reassurance, so it belongs after the social proof and before the ask.
 */
export default async function RecentPosts() {
  const posts = await getRecentPosts(3);

  if (posts.length === 0) return null;

  return (
    <section className="bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="From the Journal"
          title="Recent from"
          accent="the blog"
          body="Buying guides, import notes and what we've learned bringing cars in from Japan."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <Reveal key={post.slug} delay={(index % 3) * 90}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <div className="mt-16 flex justify-center">
            <Link href="/blog" className="btn btn-outline">
              Read the journal
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
