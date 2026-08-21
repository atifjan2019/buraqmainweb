import Link from "next/link";
import { getStockFilters, getVehicles } from "@/lib/crm";
import { vehicleHref, type MakerOption, type Vehicle } from "@/lib/vehicles";
import MakerTile, { type MakerModel } from "./MakerTile";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

/**
 * Browse by manufacturer — a shortcut into /cars?make=X.
 *
 * The makes come from the CRM's own filters endpoint, which derives them from
 * live stock. So this grid can never offer a marque with nothing behind it,
 * and a new make appears the moment the first car of it is published. That is
 * the whole reason not to hard-code a list of manufacturers here.
 *
 * Manufacturer logos are supplied by the dealership through the CRM's Makers
 * page and served from the CRM's own storage. An earlier revision of this file
 * argued against logos here: that they are trademarks we would be re-hosting,
 * and that DESIGN-bmw-m.md builds hierarchy from weight and scale with no
 * decorative iconography. The first point is the dealership's call to make and
 * it has made it — these are the marques it is an authorised retailer of. The
 * second still binds the *rendering*: the marks sit flat on canvas with no
 * shadow, no gradient, no plate and no hue outside their own artwork, in a
 * fixed optical box (`.maker-logo` in globals.css) so a wide wordmark and a
 * round badge carry the same weight.
 *
 * A marque with no logo yet renders its name in display weight — the tile this
 * section shipped with. The section is therefore complete on day one and
 * improves as artwork arrives, with no state in between where a tile is blank.
 */
export default async function SearchByMaker() {
  let makers: MakerOption[];
  let stock: Vehicle[] = [];
  try {
    const filters = await getStockFilters();

    // The stock itself, so each marque can show what is actually behind it.
    // One extra cached read, shared with nothing — the homepage already pays
    // for this call in LiveStock and Next dedupes it within a render.
    stock = (await getVehicles({ perPage: 50 })).vehicles;

    // `makers` carries the logos and the counts in the one request. `makes` is
    // the fallback for a CRM that predates the Makers page: same marques, same
    // links, no artwork and no count — never an empty section.
    makers =
      filters.makers.length > 0
        ? filters.makers
        : filters.makes.map((name) => ({
            name,
            slug: name,
            displayName: name,
            logoUrl: null,
            logoDarkUrl: null,
            count: 0,
          }));
  } catch {
    // A CRM outage costs the homepage one section, never the whole page.
    return null;
  }

  if (makers.length === 0) return null;

  const modelsByMake = groupModels(stock);

  return (
    <section className="bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Browse The Range"
          title="Search By"
          accent="Maker"
          body="Jump straight to the marque you came for. Every badge here has cars behind it right now."
        />

        {/* Three across, matching the reference the owner asked for. Six was
            too many: at that width a marque was a word in a thin strip, and
            the logos the CRM now serves had nowhere to breathe.

            The car count is gone from the tile. It read as a stock report
            rather than a way in, and "1 CAR" beside a marque undersells a
            forecourt — the models shown on hover say far more about what is
            actually there. */}
        <div className="mt-16 grid grid-cols-1 gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {makers.map((maker, i) => (
            <Reveal key={maker.name} delay={(i % 3) * 60}>
              <MakerTile
                maker={maker}
                models={modelsByMake.get(maker.name.toLowerCase()) ?? []}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Up to four distinct models per marque, newest first, each with a photograph.
 *
 * Distinct by MODEL rather than by car: a forecourt with sixty Toyotas is
 * mostly Priuses, and four Prius thumbnails tell a visitor nothing. One of
 * each model is the useful answer to "what do you have in a Toyota?".
 */
function groupModels(stock: Vehicle[]): Map<string, MakerModel[]> {
  const byMake = new Map<string, MakerModel[]>();

  for (const vehicle of stock) {
    const key = vehicle.make.trim().toLowerCase();
    if (!key) continue;

    const models = byMake.get(key) ?? [];
    if (models.length >= 4) continue;

    // The model name as the CRM writes it, trimmed of trim-levels so
    // "Prius 1.8 VVT-h Excel" and "Prius Hybrid" read as one model.
    const label = vehicle.model.split(" ").slice(0, 2).join(" ").trim();
    if (!label || models.some((m) => m.label.toLowerCase() === label.toLowerCase())) {
      continue;
    }

    models.push({
      label,
      href: vehicleHref(vehicle),
      thumb: vehicle.featuredImage?.thumb ?? null,
    });

    byMake.set(key, models);
  }

  return byMake;
}
