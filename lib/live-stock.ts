import type { Vehicle } from "./vehicles";

/** How many cars the homepage rail shows before "View All Cars" takes over. */
export const LIVE_STOCK_LIMIT = 12;

/**
 * Decides which cars appear in the homepage Live Stock rail, and in what order.
 *
 * `getVehicles` already returns only published, unsold stock, with featured
 * cars sorted first and the CRM's own order after that. This function is where
 * the showroom's own judgement goes on top of that: the rail is prime homepage
 * space, so what leads it is a commercial decision, not a technical one.
 *
 * Whatever this returns is rendered in order, left to right. The first card is
 * the page's LCP element, so it should be a car worth loading first.
 *
 * @param vehicles Up to 50 live cars, as the CRM ordered them.
 * @returns The cars to show, in display order. Return at most LIVE_STOCK_LIMIT.
 */
export function selectLiveStock(vehicles: Vehicle[]): Vehicle[] {
  // Featured cars already lead the section above this one, so repeating them
  // here would make the rail read as more of the same. They stay eligible —
  // dropping them could empty the rail on a small forecourt — but they sort
  // last, so the rail leads with stock the visitor has not just scrolled past.
  //
  // Within each group the CRM's own order is preserved: staff order stock
  // deliberately, and second-guessing that here would put this file in a
  // tug-of-war with the showroom screen.
  const ordered = [
    ...vehicles.filter((v) => !v.isFeatured),
    ...vehicles.filter((v) => v.isFeatured),
  ];

  return ordered.slice(0, LIVE_STOCK_LIMIT);
}
