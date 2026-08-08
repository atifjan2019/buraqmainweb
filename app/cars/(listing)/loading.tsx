/**
 * Streamed while the CRM read resolves. Mirrors the real layout — heading,
 * filter bar, card grid — so the page doesn't jump when stock arrives.
 */
export default function CarsLoading() {
  return (
    /* Square blocks, because the cards this stands in for are square. A
       rounded skeleton resolving into a sharp card is a visible snap. */
    <section className="bg-canvas pt-32 pb-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto h-4 w-40 animate-pulse bg-surface-2" />
          <div className="mx-auto mt-6 h-12 w-72 animate-pulse bg-surface-2" />
          <div className="mx-auto mt-6 h-4 w-full max-w-md animate-pulse bg-surface-2" />
        </div>

        <div className="mt-16 h-40 animate-pulse bg-surface-2" />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index}>
              <div className="aspect-16/10 animate-pulse bg-surface-2" />
              <div className="space-y-3 pt-5">
                <div className="h-6 w-2/3 animate-pulse bg-surface-2" />
                <div className="h-3 w-full animate-pulse bg-surface-2" />
                <div className="h-8 w-1/3 animate-pulse bg-surface-2" />
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
