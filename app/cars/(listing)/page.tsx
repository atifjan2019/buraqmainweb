import type { Metadata } from "next";
import Pagination from "@/components/Pagination";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import StockNotice from "@/components/StockNotice";
import VehicleCard from "@/components/VehicleCard";
import VehicleFilters, {
  type ActiveFilters,
} from "@/components/VehicleFilters";
import { DEFAULT_PER_PAGE, getStockFilters, getVehicles } from "@/lib/crm";
import { financeDisclaimer } from "@/lib/site";

export const metadata: Metadata = {
  title: "Our Cars",
  description:
    "Browse the current stock at Burraq Motors in Manchester. Filter by make, fuel type, gearbox and price. Every vehicle HPI checked, finance available on selected cars.",
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

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const active: ActiveFilters = {
    make: single(params.make),
    fuel_type: single(params.fuel_type),
    transmission: single(params.transmission),
    min_price: single(params.min_price),
    max_price: single(params.max_price),
  };

  const page = positiveInt(single(params.page)) ?? 1;
  const hasActiveFilters = Object.values(active).some(Boolean);

  // Both reads are independent — a filters outage shouldn't cost us the list,
  // so they're settled separately rather than with Promise.all.
  const [filtersResult, stockResult] = await Promise.allSettled([
    getStockFilters(),
    getVehicles({
      make: active.make,
      fuelType: active.fuel_type,
      transmission: active.transmission,
      minPrice: positiveInt(active.min_price),
      maxPrice: positiveInt(active.max_price),
      page,
      perPage: DEFAULT_PER_PAGE,
    }),
  ]);

  if (stockResult.status === "rejected") {
    console.error("[cars] stock listing unavailable", stockResult.reason);
  }
  if (filtersResult.status === "rejected") {
    console.error("[cars] filter options unavailable", filtersResult.reason);
  }

  const stock = stockResult.status === "fulfilled" ? stockResult.value : null;
  const filters =
    filtersResult.status === "fulfilled" ? filtersResult.value : null;

  /** Filters minus paging, so page links keep the current search. */
  const linkParams: Record<string, string> = {};
  for (const [key, value] of Object.entries(active)) {
    if (value) linkParams[key] = value;
  }

  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,165,36,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="OUR COLLECTION"
          title="Current"
          accent="Stock"
          body="Every car below is available right now and prepared to a standard we'd happily drive ourselves."
        />

        {/* With no stock at all there is nothing to filter by, and an empty
            filter bar just looks broken. */}
        {filters && filters.makes.length > 0 && (
          <Reveal delay={80}>
            <div className="mt-14">
              <VehicleFilters
                filters={filters}
                active={active}
                hasActiveFilters={hasActiveFilters}
              />
            </div>
          </Reveal>
        )}

        {stock === null ? (
          <div className="mt-16">
            <StockNotice
              title="Stock is temporarily unavailable"
              body="We're having trouble loading our latest vehicles. Please try again in a moment — or message us and we'll tell you exactly what's on the forecourt."
              action={{ label: "Try again", href: "/cars" }}
            />
          </div>
        ) : stock.vehicles.length === 0 ? (
          <div className="mt-16">
            <StockNotice
              title={
                hasActiveFilters
                  ? "Nothing matches that combination"
                  : "New stock is on its way"
              }
              body={
                hasActiveFilters
                  ? "Try widening your search, or clear the filters to see everything we have in right now."
                  : "Our next vehicles are being prepared and checked. Get in touch and we'll let you know the moment they land."
              }
              action={
                hasActiveFilters
                  ? { label: "Clear filters", href: "/cars" }
                  : undefined
              }
            />
          </div>
        ) : (
          <>
            <p className="mt-12 text-sm text-muted">
              {stock.meta.total === 1
                ? "1 car available"
                : `${stock.meta.total} cars available`}
              {stock.meta.lastPage > 1 && (
                <span className="text-faint">
                  {" "}
                  · page {stock.meta.currentPage} of {stock.meta.lastPage}
                </span>
              )}
            </p>

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stock.vehicles.map((vehicle, index) => (
                <Reveal key={vehicle.registration} delay={(index % 3) * 90}>
                  <VehicleCard vehicle={vehicle} />
                </Reveal>
              ))}
            </div>

            <Pagination meta={stock.meta} params={linkParams} />
          </>
        )}

        <p className="mt-16 text-center text-xs text-faint">
          {financeDisclaimer}
        </p>
      </div>
    </section>
  );
}
