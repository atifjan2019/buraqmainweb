import type { MetadataRoute } from "next";
import { getVehicles } from "@/lib/crm";
import { site } from "@/lib/site";
import { vehicleHref } from "@/lib/vehicles";

/**
 * Sitemap for search engines.
 *
 * Stock is included because a car detail page is the thing people actually
 * search for — "2021 Tesla Model 3 Manchester" lands on `/cars/[slug]`, not on
 * the listing. Those URLs turn over as cars sell, which is exactly what a
 * sitemap is for.
 *
 * A CRM outage must not take the sitemap down with it: the static routes are
 * the part search engines rely on most, so a failed stock read degrades to
 * those rather than throwing and returning a 500 to the crawler.
 */

const STATIC_ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "daily", priority: 1 },
  { path: "/cars", changeFrequency: "daily", priority: 0.9 },
  { path: "/finance", changeFrequency: "monthly", priority: 0.7 },
  { path: "/about", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.2 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.2 },
];

/** Matches the CRM read cache, so the sitemap can't be fresher than the data. */
export const revalidate = 120;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries = STATIC_ROUTES.map((route) => ({
    url: `${site.url}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  let vehicleEntries: MetadataRoute.Sitemap = [];

  try {
    // The API caps per_page at 50; one page is comfortably more than the
    // forecourt holds, and over-fetching a sitemap helps nobody.
    const { vehicles } = await getVehicles({ perPage: 50 });

    vehicleEntries = vehicles.map((vehicle) => ({
      url: `${site.url}${vehicleHref(vehicle)}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("[sitemap] stock unavailable, listing static routes only", error);
  }

  return [...staticEntries, ...vehicleEntries];
}
