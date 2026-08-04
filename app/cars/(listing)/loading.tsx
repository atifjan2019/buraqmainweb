/**
 * Streamed while the CRM read resolves. Mirrors the real layout — heading,
 * filter bar, card grid — so the page doesn't jump when stock arrives.
 */
export default function CarsLoading() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto h-3 w-32 animate-pulse rounded-full bg-surface-2" />
          <div className="mx-auto mt-6 h-10 w-72 animate-pulse rounded-lg bg-surface-2" />
          <div className="mx-auto mt-5 h-4 w-full max-w-md animate-pulse rounded-full bg-surface-2" />
        </div>

        <div className="mt-14 h-32 animate-pulse rounded-2xl bg-surface-2/60" />

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-line-soft"
            >
              <div className="aspect-16/10 animate-pulse bg-surface-2" />
              <div className="space-y-3 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded-full bg-surface-2" />
                <div className="h-3 w-full animate-pulse rounded-full bg-surface-2" />
                <div className="h-3 w-4/5 animate-pulse rounded-full bg-surface-2" />
                <div className="h-10 w-full animate-pulse rounded-full bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading stock…
      </span>
    </section>
  );
}
