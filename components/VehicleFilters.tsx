"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent } from "react";
import type { StockFilters } from "@/lib/vehicles";

/**
 * Stock filters.
 *
 * Every option comes from `GET /vehicles/filters`, which only ever returns
 * values that currently have stock behind them — so no single choice here can
 * land the visitor on an empty page.
 *
 * The markup stays a plain GET form, so with JavaScript disabled it still
 * filters and every filtered view keeps its own shareable, indexable URL.
 * With JavaScript on, the native submit is intercepted and the same URL is
 * pushed through the router instead: the server re-renders the listing and
 * only that markup is swapped in, so the page never reloads and the visitor
 * stays exactly where they were scrolled to. The submit button is then
 * redundant and hides itself — see `.no-js-only` in globals.css.
 */

export interface ActiveFilters {
  make?: string;
  fuel_type?: string;
  transmission?: string;
  min_price?: string;
  max_price?: string;
}

interface VehicleFiltersProps {
  filters: StockFilters;
  active: ActiveFilters;
  /** True when any filter is applied, so we can offer a reset. */
  hasActiveFilters: boolean;
}

const selectClass =
  "w-full appearance-none rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink " +
  "transition-colors focus:border-amber/50 focus:outline-none focus:ring-2 focus:ring-amber/20";

const labelClass =
  "block text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-faint";

/**
 * Six or so round numbers spanning the live price range, so the price filters
 * stay derived from real stock rather than a hardcoded ladder.
 */
function priceSteps(min: number, max: number): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return [];

  const stepCount = 5;
  const raw = (max - min) / stepCount;
  // Round the increment to something a buyer would actually think in.
  const granularity = raw > 4000 ? 1000 : 500;
  const step = Math.max(granularity, Math.round(raw / granularity) * granularity);

  const steps: number[] = [];
  for (let value = Math.floor(min / step) * step; value < max; value += step) {
    if (value > min) steps.push(value);
  }

  return steps;
}

const money = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

export default function VehicleFilters({
  filters,
  active,
  hasActiveFilters,
}: VehicleFiltersProps) {
  const steps = priceSteps(filters.priceRange.min, filters.priceRange.max);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  /**
   * Realigns the controls with the URL. These selects are uncontrolled, and a
   * soft navigation never rebuilds the document, so Back, Forward and "Clear
   * all" would otherwise leave the old choices on display next to freshly
   * filtered results. Assigning `value` doesn't move focus, so this is safe to
   * run right after the visitor has picked something — in that case the values
   * already match and nothing is written.
   */
  const { make, fuel_type, transmission, min_price, max_price } = active;

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const fromUrl = { make, fuel_type, transmission, min_price, max_price };

    for (const [name, value] of Object.entries(fromUrl)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLSelectElement && field.value !== (value ?? "")) {
        field.value = value ?? "";
      }
    }
  }, [make, fuel_type, transmission, min_price, max_price]);

  /**
   * Rebuilds `/cars?…` from the form's own state and navigates without a
   * reload. Untouched controls submit as "" and are dropped, which is what
   * keeps a URL like `/cars?make=Audi` clean instead of carrying five empty
   * keys. Paging is deliberately not carried over: a changed filter describes
   * a different result set, so page 3 of the old one is meaningless.
   */
  function applyFilters(form: HTMLFormElement) {
    const search = new URLSearchParams();
    for (const [name, value] of new FormData(form)) {
      if (typeof value === "string" && value) search.set(name, value);
    }

    const query = search.toString();

    // `scroll: false` is the point of doing this client-side — the filter bar
    // sits well down the page and yanking the visitor back to the top on every
    // dropdown change is exactly the reload behaviour we're removing.
    startTransition(() => {
      router.push(query ? `/cars?${query}` : "/cars", { scroll: false });
    });
  }

  /** Applies as soon as a control changes, for anyone with JavaScript on. */
  function handleChange(event: FormEvent<HTMLFormElement>) {
    applyFilters(event.currentTarget);
  }

  /**
   * Only reachable with scripting on — without it the browser performs the
   * native GET and this never runs, which is the whole no-JS fallback.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    applyFilters(event.currentTarget);
  }

  return (
    <form
      ref={formRef}
      method="get"
      action="/cars"
      onChange={handleChange}
      onSubmit={handleSubmit}
      aria-busy={isPending}
      className="glass rounded-2xl p-5 transition-opacity sm:p-6"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className={labelClass} htmlFor="filter-make">
            Make
          </label>
          <select
            id="filter-make"
            name="make"
            defaultValue={active.make ?? ""}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">Any make</option>
            {filters.makes.map((make) => (
              <option key={make} value={make}>
                {make}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="filter-fuel">
            Fuel
          </label>
          <select
            id="filter-fuel"
            name="fuel_type"
            defaultValue={active.fuel_type ?? ""}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">Any fuel</option>
            {filters.fuelTypes.map((fuel) => (
              <option key={fuel} value={fuel}>
                {fuel}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="filter-transmission">
            Gearbox
          </label>
          <select
            id="filter-transmission"
            name="transmission"
            defaultValue={active.transmission ?? ""}
            className={`mt-2 ${selectClass}`}
          >
            <option value="">Any gearbox</option>
            {filters.transmissions.map((transmission) => (
              <option key={transmission} value={transmission}>
                {transmission}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="filter-min-price">
            Price from
          </label>
          <select
            id="filter-min-price"
            name="min_price"
            defaultValue={active.min_price ?? ""}
            disabled={steps.length === 0}
            className={`mt-2 ${selectClass} disabled:opacity-50`}
          >
            <option value="">No minimum</option>
            {steps.map((value) => (
              <option key={value} value={value}>
                {money.format(value)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="filter-max-price">
            Price up to
          </label>
          <select
            id="filter-max-price"
            name="max_price"
            defaultValue={active.max_price ?? ""}
            disabled={steps.length === 0}
            className={`mt-2 ${selectClass} disabled:opacity-50`}
          >
            <option value="">No maximum</option>
            {steps.map((value) => (
              <option key={value} value={value}>
                {money.format(value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 empty:mt-0">
        {/* The sole control for anyone without JavaScript. With scripting on,
            changing a dropdown already applies, so it hides itself rather than
            sitting there implying the choice hasn't taken effect yet. */}
        <button
          type="submit"
          className="no-js-only rounded-full bg-amber px-6 py-2.5 text-sm font-semibold text-on-amber transition-colors hover:bg-amber-bright"
        >
          Apply filters
        </button>

        {/* Announced, not just shown — with the button gone this is the only
            confirmation that a change was registered. */}
        <p aria-live="polite" className="text-sm text-muted">
          {isPending ? "Updating results…" : ""}
        </p>

        {hasActiveFilters && (
          <Link
            href="/cars"
            scroll={false}
            className="text-sm font-medium text-muted transition-colors hover:text-amber"
          >
            Clear all
          </Link>
        )}
      </div>
    </form>
  );
}
