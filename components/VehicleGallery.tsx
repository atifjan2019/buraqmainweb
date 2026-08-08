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
      <div className="photo-frame aspect-4/3 overflow-hidden">
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
        className="photo-frame group relative block aspect-4/3 w-full cursor-zoom-in overflow-hidden bg-surface-2"
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
        {/* Solid, not translucent: the system has no backdrop blur, so a
            chip over photography has to carry its own ground. */}
        <span className="pointer-events-none absolute bottom-3 right-3 bg-canvas px-3 py-2 text-[0.7rem] font-bold uppercase tracking-[1.5px] text-ink opacity-0 transition-opacity group-hover:opacity-100">
          Click to enlarge
        </span>
      </button>

      {/* Thumbnail strip */}
      {count > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-3 sm:grid-cols-6">
          {images.map((image, index) => (
            <li key={image.thumb}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${count}`}
                aria-current={index === active ? "true" : undefined}
                /* The active thumbnail is marked by an ink border rather
                   than by a hue — this system has no accent colour, and the
                   tricolour is identity-only. */
                className={`block aspect-4/3 w-full overflow-hidden border transition-all ${
                  index === active
                    ? "border-ink opacity-100"
                    : "border-line-soft opacity-55 hover:opacity-100"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-canvas/97 p-4 focus:outline-none sm:p-8"
        >
          <button
            type="button"
            onClick={closeLightbox}
            aria-label="Close image viewer"
            className="btn-icon absolute right-4 top-4"
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
                className="btn-icon absolute left-3 sm:left-6"
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
                className="btn-icon absolute right-3 sm:right-6"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Only here is `full` (2000px) ever requested.
              Sized in viewport units, not `max-h-full`/`max-w-full`: a
              percentage max-size does not reliably clamp a replaced element
              inside a padded, fixed, flex-centred parent, so the 2000px photo
              rendered at close to natural size and overflowed the screen. The
              inset also keeps the photo clear of the close and arrow controls
              rather than putting them on top of it. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- see file header */}
          <img
            src={current.full}
            alt={current.alt}
            onClick={(event) => event.stopPropagation()}
            className="h-auto w-auto max-h-[78vh] max-w-[86vw] cursor-default object-contain sm:max-h-[82vh] sm:max-w-[80vw]"
          />

          {count > 1 && (
            <p className="absolute bottom-5 bg-canvas px-3 py-2 text-[0.7rem] font-bold uppercase tracking-[1.5px] text-muted">
              {active + 1} / {count}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
