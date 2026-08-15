/**
 * `npm test` — see `lib/posts.test.ts` for why these run on bare Node.
 *
 * `lib/vehicles.ts` is the module both sides of the server boundary share, so
 * it loads here with no ceremony at all.
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import { stockEmptyState, type PageMeta } from "./vehicles.ts";

function meta(overrides: Partial<PageMeta> = {}): PageMeta {
  return { currentPage: 1, lastPage: 1, perPage: 12, total: 0, ...overrides };
}

test("a page past the end says so instead of claiming there is no stock", () => {
  const state = stockEmptyState(
    meta({ currentPage: 99, lastPage: 2, total: 13 }),
    false,
    "/cars",
  );

  assert.equal(state.title, "That page doesn't exist");
  assert.match(state.body, /13 cars/);
  assert.deepEqual(state.action, {
    label: "Back to the first page",
    href: "/cars",
  });
});

test("recovering from a bad page number keeps the search", () => {
  const state = stockEmptyState(
    meta({ currentPage: 99, lastPage: 1, total: 1 }),
    true,
    "/cars?make=Tesla",
  );

  assert.equal(state.action?.href, "/cars?make=Tesla");
  // One car is not "1 cars", and the count is the whole point of the sentence.
  assert.match(state.body, /one car/);
});

test("filters that match nothing offer a way to clear them", () => {
  const state = stockEmptyState(meta(), true, "/cars?make=Ferrari");

  assert.equal(state.title, "Nothing matches that combination");
  assert.deepEqual(state.action, { label: "Clear filters", href: "/cars" });
});

test("an empty forecourt is the only case that promises new stock", () => {
  const state = stockEmptyState(meta(), false, "/cars");

  assert.equal(state.title, "New stock is on its way");
  // Nothing to click back to — this dead end offers the phone and WhatsApp
  // that StockNotice always carries, and no third button.
  assert.equal(state.action, undefined);
});
