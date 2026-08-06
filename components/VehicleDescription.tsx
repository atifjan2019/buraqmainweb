import { splitDescription } from "@/lib/vehicles";

/**
 * The "About this car" block.
 *
 * Built on <details> rather than a state toggle for three reasons: it works
 * before hydration and with scripting off, the browser gives it correct
 * keyboard and screen-reader behaviour for free, and the folded text stays in
 * the DOM — this description is the only prose on the page that is unique to
 * the car, so hiding it from crawlers would cost the listing its search
 * ranking.
 *
 * The spec list these descriptions carry is dropped upstream in
 * `splitDescription`, because it repeats the tiles directly above this block.
 */
export default function VehicleDescription({
  description,
}: {
  description: string | null;
}) {
  const { lead, rest } = splitDescription(description);

  if (!lead) return null;

  return (
    <div className="mt-12">
      <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
        About this car
      </h2>

      {/* max-w-2xl holds the line length near 75 characters at every width —
          full-bleed body copy on a wide screen is markedly harder to read. */}
      <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-muted">
        {lead}
      </p>

      {rest && (
        <details className="group mt-1 max-w-2xl">
          {/* py-3 carries the row to the 44px minimum touch target; the text
              itself is only 20px tall. The margin above is reduced to match,
              so the padding does not also become visible spacing. */}
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 py-3 text-sm font-semibold text-amber transition-colors hover:text-amber-bright [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Read the full description</span>
            <span className="hidden group-open:inline">Show less</span>
            {/* Rotates to point up when open, so the control reads as a toggle
                rather than as two unrelated links. */}
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-3.5 w-3.5 transition-transform duration-200 group-open:-rotate-180"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">
            {rest}
          </p>
        </details>
      )}
    </div>
  );
}
