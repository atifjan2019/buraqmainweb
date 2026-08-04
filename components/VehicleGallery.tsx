"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { VehicleImage } from "@/lib/vehicles";
import { ArrowRight, Close } from "./Icons";
import VehiclePlaceholder from "./VehiclePlaceholder";

interface VehicleGalleryProps {
  images: VehicleImage[];
  make: string;
  model: string;
}

/**
 * Detail-page gallery: one large `display` image, a `thumb` strip beneath, and
 * a `full`-resolution lightbox.
 *
 * `full` is 2000px and is requested *only* once the lightbox opens — it is
 * never part of the initial page weight.
 *
 * Images come straight from the CRM's URLs rather than through `next/image`,
 * which would re-fetch and re-encode them via `/_next/image` and pin the site
 * to a stale copy after a photo is swapped in the CRM.
 */
export default function VehicleGallery({
  images,
  make,
  model,
}: VehicleGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const count = images.length;

  const next = useCallback(
    () => setActive((i) => (count ? (i + 1) % count : 0)),
    [count],
  );
  const previous = useCallback(
    () => setActive((i) => (count ? (i - 1 + count) % count : 0)),
    [count],
  );

  /* Arrow keys and Escape while the lightbox is open. Bound to the document so
     it works wherever focus happens to sit inside the dialog. */
  useEffect(() => {
    if (!lightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setLightboxOpen(false);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        previous();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [lightboxOpen, next, previous]);

  /* Stop the page scrolling behind the overlay, and move focus into it so the
     keyboard handler and screen readers land in the right place. */
  useEffect(() => {
    if (!lightboxOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxOpen]);

  /* Returning focus to the trigger keeps keyboard users where they left off. */
  function closeLightbox() {
    setLightboxOpen(false);
    openerRef.current?.focus();
  }

  if (count === 0) {
    return (
      <div className="aspect-4/3 overflow-hidden rounded-2xl border border-line-soft">
        <VehiclePlaceholder make={make} model={model} size="feature" />
      </div>
    );
  }

  const current = images[active];

  return (
    <div>
      {/* Main image */}
      <button
        ref={openerRef}
        type="button"
        onClick={() => setLightboxOpen(true)}
        aria-label={`Open larger view of ${current.alt}`}
        className="group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden rounded-2xl border border-line-soft bg-surface-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- see file header */}
        <img
          key={current.display}
          src={current.display}
          alt={current.alt}
          width={1200}
          height={900}
          /* The LCP element on this page: never lazy, and preloaded by the
             page itself so the fetch starts before this markup parses. */
          loading="eager"
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-canvas/80 px-3 py-1.5 text-xs font-medium text-muted opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          Click to enlarge
        </span>
      </button>

      {/* Thumbnail strip */}
      {count > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {images.map((image, index) => (
            <li key={image.thumb}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${count}`}
                aria-current={index === active ? "true" : undefined}
                className={`block aspect-4/3 w-full overflow-hidden rounded-lg border transition-all ${
                  index === active
                    ? "border-amber opacity-100"
                    : "border-line-soft opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- see file header */}
                <img
                  src={image.thumb}
                  alt=""
                  width={400}
                  height={300}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${current.alt} — image ${active + 1} of ${count}`}
          tabIndex={-1}
          onClick={closeLightbox}
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas-deep/95 p-4 backdrop-blur-sm focus:outline-none sm:p-8"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-line bg-canvas/80 text-muted transition-colors hover:text-amber"
          >
            <Close className="h-5 w-5" />
          </button>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  previous();
                }}
                aria-label="Previous image"
                className="absolute left-3 grid h-11 w-11 place-items-center rounded-full border border-line bg-canvas/80 text-muted transition-colors hover:text-amber sm:left-6"
              >
                <ArrowRight className="h-5 w-5 rotate-180" />
              </button>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  next();
                }}
                aria-label="Next image"
                className="absolute right-3 grid h-11 w-11 place-items-center rounded-full border border-line bg-canvas/80 text-muted transition-colors hover:text-amber sm:right-6"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Only here is `full` (2000px) ever requested. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- see file header */}
          <img
            src={current.full}
            alt={current.alt}
            onClick={(event) => event.stopPropagation()}
            className="max-h-full max-w-full cursor-default rounded-lg object-contain"
          />

          {count > 1 && (
            <p className="absolute bottom-5 rounded-full bg-canvas/80 px-3 py-1.5 text-xs text-muted backdrop-blur">
              {active + 1} / {count}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
