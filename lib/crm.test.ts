/**
 * `npm test` — see `lib/posts.test.ts` for why these run on bare Node.
 *
 * Two things stand between bare Node and this module, and both are handled here
 * rather than by changing the module to suit its test:
 *
 *  · `server-only` throws under the default export condition. The test script
 *    passes `--conditions=react-server` — the same condition Next resolves
 *    Server Components under — so the marker resolves to its empty build.
 *  · `lib/crm.ts` imports its siblings without a file extension, which the
 *    bundler resolves and the native ESM loader does not. The hook below adds
 *    the extension on the way past.
 *
 * Only the paging walk is covered. Everything else in that module is one fetch
 * and a field rename, but "did we ask for every page?" is a question the type
 * checker cannot answer and the sitemap silently got wrong.
 */

import assert from "node:assert/strict";
import { afterEach, test } from "node:test";

/** One resolve hook's worth of `node:module`, which @types/node 20 predates. */
type ResolveHook = (
  specifier: string,
  context: unknown,
  next: (specifier: string, context: unknown) => unknown,
) => unknown;

const { registerHooks } = (await import("node:module")) as unknown as {
  registerHooks: (hooks: { resolve: ResolveHook }) => void;
};

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier)) {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});

const { CrmError, getAllVehicles } = await import("./crm.ts");

const realFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = realFetch;
});

/** One car, with only the fields the mapper reads. */
function rawCar(slug: string) {
  return {
    slug,
    registration: slug.toUpperCase(),
    make: "Toyota",
    model: "C-HR",
    year: 2019,
    mileage: 40000,
    price: 15995,
    fuel_type: "Hybrid",
    transmission: "Automatic",
    color: "White",
    description: null,
    status: "in_stock",
    is_featured: false,
    mot_expiry: null,
    service_due: null,
  };
}

/** Records every URL asked for and answers with the page the map holds. */
function stubPages(pages: Record<number, { slugs: string[]; lastPage: number }>) {
  const asked: URL[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    asked.push(url);

    const page = Number(url.searchParams.get("page") ?? 1);
    const body = pages[page];

    if (!body) {
      return new Response("not found", { status: 404 });
    }

    return Response.json({
      data: body.slugs.map(rawCar),
      meta: { current_page: page, last_page: body.lastPage },
    });
  }) as typeof fetch;

  return asked;
}

test("walks the paginator to its last page rather than stopping at the first", async () => {
  const asked = stubPages({
    1: { slugs: ["car-1", "car-2"], lastPage: 3 },
    2: { slugs: ["car-3", "car-4"], lastPage: 3 },
    3: { slugs: ["car-5"], lastPage: 3 },
  });

  const vehicles = await getAllVehicles();

  assert.deepEqual(
    vehicles.map((vehicle) => vehicle.slug),
    ["car-1", "car-2", "car-3", "car-4", "car-5"],
  );
  assert.equal(asked.length, 3);
  // The API's cap, so the walk is as short as the API allows.
  assert.equal(asked[0].searchParams.get("per_page"), "50");
  assert.deepEqual(
    asked.map((url) => url.searchParams.get("page")),
    ["1", "2", "3"],
  );
});

test("a single page is still a single request", async () => {
  const asked = stubPages({ 1: { slugs: ["car-1"], lastPage: 1 } });

  const vehicles = await getAllVehicles();

  assert.equal(vehicles.length, 1);
  assert.equal(asked.length, 1);
});

test("a paginator that never ends is capped rather than walked forever", async () => {
  const pages: Record<number, { slugs: string[]; lastPage: number }> = {};
  for (let page = 1; page <= 50; page += 1) {
    pages[page] = { slugs: [`car-${page}`], lastPage: 999 };
  }
  const asked = stubPages(pages);

  const vehicles = await getAllVehicles();

  assert.equal(asked.length, 20);
  assert.equal(vehicles.length, 20);
});

test("a page that fails throws rather than returning a short list", async () => {
  stubPages({ 1: { slugs: ["car-1"], lastPage: 4 } });

  await assert.rejects(getAllVehicles(), (error: unknown) => {
    assert.ok(error instanceof CrmError);
    assert.equal(error.status, 404);
    return true;
  });
});
