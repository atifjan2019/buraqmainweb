"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import type { StockFilters } from "@/lib/vehicles";

/**
 * Stock filters.
 *
 * Every option comes from `GET /vehicles/filters`, which only ever returns
 * values that currently have stock behind them — so no single choice here can
 * land the visitor on an empty page.
 *
 * It's a plain GET form, so it works with JavaScript disabled and every
 * filtered view has its own shareable, indexable URL. With JavaScript on, the
 * form submits as soon as a control changes and drops empty fields from the
 * query string.
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

  /** Re-submits whenever a control changes, for anyone with JavaScript on. */
  function handleChange(event: FormEvent<HTMLFormElement>) {
    (event.currentTarget as HTMLFormElement).requestSubmit();
  }

  /**
   * Keeps URLs clean by omitting untouched controls. Disabled fields aren't
   * submitted; they're re-enabled immediately so the form stays usable if the
   * navigation is cancelled or the page is restored from bfcache.
   */
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget as HTMLFormElement;
    const emptied = Array.from(form.elements).filter(
      (element): element is HTMLSelectElement =>
        element instanceof HTMLSelectElement && element.value === "",
    );

    for (const element of emptied) element.disabled = true;
    setTimeout(() => {
      for (const element of emptied) element.disabled = false;
    });
  }

  return (
    <form
      method="get"
      action="/cars"
      onChange={handleChange}
      onSubmit={handleSubmit}
      className="glass rounded-2xl p-5 sm:p-6"
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

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {/* The sole control for anyone without JavaScript; harmless with it. */}
        <button
          type="submit"
          className="rounded-full bg-amber px-6 py-2.5 text-sm font-semibold text-canvas transition-colors hover:bg-amber-bright"
        >
          Apply filters
        </button>

        {hasActiveFilters && (
          <Link
            href="/cars"
            className="text-sm font-medium text-muted transition-colors hover:text-amber"
          >
            Clear all
          </Link>
        )}
      </div>
    </form>
  );
}
