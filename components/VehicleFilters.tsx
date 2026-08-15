"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useTransition, type FormEvent } from "react";
import { formatPrice } from "@/lib/vehicles";
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
  /** Branch slug, matching the CRM's public key — see `BranchOption`. */
  branch?: string;
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

/*
 * `.field` carries the shape (48px, square, hairline that thickens to ink on
 * focus). `appearance-none` still has to be set here rather than in the class:
 * it is a select-only concern, and putting it on `.field` would strip the
 * spinner off number inputs that want it.
 */
const selectClass = "field appearance-none";

const labelClass = "label-uppercase block text-ink";

export default function VehicleFilters({
  filters,
  active,
  hasActiveFilters,
}: VehicleFiltersProps) {
  // Built server-side from the live spread of prices rather than from the
  // range's two ends — see `priceLadder` for why the ends are the wrong input.
  const steps = filters.priceSteps;
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
  const { branch, make, fuel_type, transmission, min_price, max_price } = active;

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const fromUrl = {
      branch,
      make,
      fuel_type,
      transmission,
      min_price,
      max_price,
    };

    for (const [name, value] of Object.entries(fromUrl)) {
      const field = form.elements.namedItem(name);
      if (field instanceof HTMLSelectElement && field.value !== (value ?? "")) {
        field.value = value ?? "";
      }
    }
  }, [branch, make, fuel_type, transmission, min_price, max_price]);

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
      className="surface-card p-6 transition-opacity sm:p-8"
      style={{ opacity: isPending ? 0.6 : 1 }}
    >
      {/* Rows of three rather than five across: the showroom control makes six,
          and five was already tight at lg. With the showroom hidden the five
          remaining controls fall as 3 + 2, which reads just as cleanly — so
          neither case needs a conditional class. */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* First, because which showroom is the coarsest cut a visitor makes —
            and only when there is a genuine choice. A single-showroom
            dealership must not be asked to pick between one option. */}
        {filters.branches.length > 1 && (
          <div>
            <label className={labelClass} htmlFor="filter-branch">
              Showroom
            </label>
            <select
              id="filter-branch"
              name="branch"
              defaultValue={active.branch ?? ""}
              className={`${selectClass} mt-3`}
            >
              <option value="">Any showroom</option>
              {filters.branches.map((branchOption) => (
                <option key={branchOption.slug} value={branchOption.slug}>
                  {branchOption.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="filter-make">
            Make
          </label>
          <select
            id="filter-make"
            name="make"
            defaultValue={active.make ?? ""}
            className={`${selectClass} mt-3`}
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
            className={`${selectClass} mt-3`}
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
            className={`${selectClass} mt-3`}
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
            className={`${selectClass} mt-3 disabled:opacity-50`}
          >
            <option value="">No minimum</option>
            {steps.map((value) => (
              <option key={value} value={value}>
                {formatPrice(value)}
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
            className={`${selectClass} mt-3 disabled:opacity-50`}
          >
            <option value="">No maximum</option>
            {steps.map((value) => (
              <option key={value} value={value}>
                {formatPrice(value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-5 empty:mt-0">
        {/* The sole control for anyone without JavaScript. With scripting on,
            changing a dropdown already applies, so it hides itself rather than
            sitting there implying the choice hasn't taken effect yet. */}
        <button
          type="submit"
          className="btn btn-solid no-js-only"
        >
          Apply filters
        </button>

        {/* Announced, not just shown — with the button gone this is the only
            confirmation that a change was registered. */}
        <p aria-live="polite" className="text-sm font-light text-muted">
          {isPending ? "Updating results…" : ""}
        </p>

        {hasActiveFilters && (
          <Link
            href="/cars"
            scroll={false}
            className="link-m"
          >
            Clear all
          </Link>
        )}
      </div>
    </form>
  );
}
