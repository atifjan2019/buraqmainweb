import { revalidateTag } from "next/cache";
import { FINANCE_CACHE_TAG } from "@/lib/codeweavers/client";

/**
 * Drops every cached finance quote, so the next render asks the lender again.
 *
 * Finance responses are cached for six hours, and on Vercel that cache outlives
 * a deployment — pushing new code does not clear it. So a spell where the lender
 * could not be reached, or the key was briefly absent, leaves an empty answer
 * sitting in the cache long after the cause is gone, and every page that renders
 * at request time keeps serving it. Redeploying does not help; nothing expires
 * it early; there is no way to clear it from the outside. Hence this.
 *
 * It matters more than it sounds because of the interlock: quoteMany refuses to
 * show any payment unless it can obtain a valid representative example, and the
 * example is calculated on one fixed synthetic vehicle — so it has ONE cache
 * key. A single poisoned entry under that key silently suppresses every monthly
 * payment on the site, and changing a car's price does not route around it.
 *
 * AUTHORISATION is the Codeweavers key itself, sent in the same header the
 * lender takes. Deliberately not a new secret to manage, and deliberately not
 * the fingerprint the health endpoint prints — that is published, and a
 * published value is not a credential. Anyone able to call this already holds
 * the key, and the worst they could do is make the site ask the lender again.
 */

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = (process.env.CODEWEAVERS_API_KEY ?? "").trim();
  const offered = (request.headers.get("x-cw-apikey") ?? "").trim();

  if (!expected) {
    return Response.json(
      { revalidated: false, reason: "no key configured in this environment" },
      { status: 503 },
    );
  }

  // Length check first so the comparison below cannot be used to probe length.
  if (offered.length !== expected.length || offered !== expected) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  /*
   * `{ expire: 0 }`, not the recommended `"max"`.
   *
   * `"max"` gives stale-while-revalidate: the tag is marked stale and the next
   * visitor is served the CACHED answer while a fresh one is fetched behind
   * them. That is the right default when the cached value is merely old. It is
   * the wrong one here, because the cached value is the thing being removed —
   * serving it to one more visitor is exactly what this call exists to stop.
   *
   * `updateTag` expires immediately and would be the natural choice, but it is
   * callable only from a Server Action; from a Route Handler the equivalent is
   * this profile.
   */
  revalidateTag(FINANCE_CACHE_TAG, { expire: 0 });

  return Response.json({
    revalidated: true,
    tag: FINANCE_CACHE_TAG,
    note: "expired immediately; the next render calls the lender again",
  });
}
