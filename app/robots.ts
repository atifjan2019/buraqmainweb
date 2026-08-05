import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/**
 * `/thank-you` is disallowed because it only renders from a cookie set by a
 * successful enquiry. To a crawler it is a thin, empty page, and indexing it
 * would put a dead confirmation screen in the search results for the brand.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/thank-you",
    },
    sitemap: `${site.url}/sitemap.xml`,
  };
}
