import Link from "next/link";
import type { PageMeta } from "@/lib/vehicles";
import { ArrowRight } from "./Icons";

interface PaginationProps {
  meta: PageMeta;
  /** Current filter query, carried onto every page link. */
  params: Record<string, string>;
  basePath?: string;
}

/** Page numbers around the current one, with the first and last always shown. */
function pageWindow(current: number, last: number): (number | "gap")[] {
  if (last <= 7) {
    return Array.from({ length: last }, (_, i) => i + 1);
  }

  const pages = new Set([1, last, current]);
  if (current - 1 > 1) pages.add(current - 1);
  if (current + 1 < last) pages.add(current + 1);

  const ordered = [...pages].sort((a, b) => a - b);
  const withGaps: (number | "gap")[] = [];

  ordered.forEach((page, index) => {
    if (index > 0 && page - ordered[index - 1] > 1) withGaps.push("gap");
    withGaps.push(page);
  });

  return withGaps;
}

export default function Pagination({
  meta,
  params,
  basePath = "/cars",
}: PaginationProps) {
  if (meta.lastPage <= 1) return null;

  const href = (page: number) => {
    const search = new URLSearchParams(params);
    // Page 1 is the canonical, unparameterised URL.
    if (page > 1) search.set("page", String(page));
    else search.delete("page");

    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  };

  const { currentPage, lastPage } = meta;

  /* Square, 44px, machined label — the same button silhouette as everything
     else in the system. The doc's radius rule is binary: 0 by default, and
     `full` only on circular icon controls, which these are not. */
  const stepClass =
    "inline-flex h-11 items-center gap-2 border border-line px-5 text-xs font-bold uppercase tracking-[1.5px] text-muted transition-colors hover:border-ink hover:text-ink";

  return (
    <nav
      aria-label="Stock pages"
      className="mt-16 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 ? (
        <Link href={href(currentPage - 1)} rel="prev" className={stepClass}>
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Previous
        </Link>
      ) : (
        <span className={`${stepClass} pointer-events-none opacity-40`}>
          <ArrowRight className="h-3.5 w-3.5 rotate-180" />
          Previous
        </span>
      )}

      <ul className="flex items-center gap-1.5">
        {pageWindow(currentPage, lastPage).map((page, index) =>
          page === "gap" ? (
            <li
              key={`gap-${index}`}
              aria-hidden
              className="px-1 text-sm font-light text-faint"
            >
              …
            </li>
          ) : (
            <li key={page}>
              <Link
                href={href(page)}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Page ${page}`}
                className={
                  page === currentPage
                    ? "grid h-11 w-11 place-items-center bg-ink text-sm font-bold text-on-ink"
                    : "grid h-11 w-11 place-items-center border border-line text-sm font-light text-muted transition-colors hover:border-ink hover:text-ink"
                }
              >
                {page}
              </Link>
            </li>
          ),
        )}
      </ul>

      {currentPage < lastPage ? (
        <Link href={href(currentPage + 1)} rel="next" className={stepClass}>
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        <span className={`${stepClass} pointer-events-none opacity-40`}>
          Next
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      )}
    </nav>
  );
}
