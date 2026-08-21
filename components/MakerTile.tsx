"use client";

import Link from "next/link";
import { useState } from "react";
import type { MakerOption } from "@/lib/vehicles";

export interface MakerModel {
  /** The model as the CRM writes it, trimmed to two words. */
  label: string;
  /** That car's own page — the popover is a shortcut, not a dead preview. */
  href: string;
  thumb: string | null;
}

interface MakerTileProps {
  maker: MakerOption;
  models: MakerModel[];
}

/**
 * One marque, with the models behind it revealed on hover.
 *
 * The tile itself is a link to the filtered stock list, so the section works
 * exactly as it did before for anyone who never hovers — on a phone, on a
 * keyboard, with JavaScript still loading. The popover is an enhancement over
 * a working link, never the only way through.
 *
 * It opens on hover AND on focus. Hover-only disclosure is invisible to a
 * keyboard, and the models are the most useful thing in the section.
 */
export default function MakerTile({ maker, models }: MakerTileProps) {
  const [open, setOpen] = useState(false);
  const showPopover = open && models.length > 0;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={() => setOpen(false)}
    >
      <Link
        href={`/cars?make=${encodeURIComponent(maker.name)}`}
        className="group flex h-full min-h-[11rem] flex-col items-center justify-center gap-5 bg-canvas p-8
                   transition-colors duration-200 hover:bg-surface-2
                   focus-visible:bg-surface-2 focus-visible:outline-none"
      >
        {maker.logoUrl ? (
          <span className="flex h-20 w-full items-center justify-center sm:h-24">
            {/* eslint-disable-next-line @next/next/no-img-element --
                served straight from the CRM, the same call VehicleCard
                documents: next/image would proxy through /_next/image and pin
                a logo swapped in the CRM to a stale copy. */}
            <img
              src={maker.logoUrl}
              alt={maker.displayName}
              loading="lazy"
              decoding="async"
              className={`maker-logo${maker.logoDarkUrl ? " maker-logo--light" : ""}`}
            />

            {maker.logoDarkUrl && (
              /* eslint-disable-next-line @next/next/no-img-element -- see above */
              <img
                src={maker.logoDarkUrl}
                alt={maker.displayName}
                loading="lazy"
                decoding="async"
                className="maker-logo maker-logo--dark"
              />
            )}
          </span>
        ) : (
          <span className="display-sm text-center text-ink">
            {maker.displayName}
          </span>
        )}
      </Link>

      {/*
        The models behind the marque.

        Positioned over the tile below rather than pushing the grid around —
        a popover that reflows a six-tile grid on hover is unusable, because
        the tile you aimed at moves out from under the pointer.

        pointer-events stay live so the thumbnails are clickable: the gap
        between tile and panel is zero, so the pointer never leaves the
        hoverable region on its way down.
      */}
      {showPopover && (
        <div
          className="absolute left-1/2 top-full z-20 w-[min(22rem,90vw)] -translate-x-1/2
                     border border-line bg-canvas p-4"
        >
          <div className="grid grid-cols-4 gap-3">
            {models.map((model) => (
              <Link
                key={model.label}
                href={model.href}
                className="group/model flex flex-col items-center gap-1.5 text-center"
              >
                <span className="flex h-12 w-full items-center justify-center overflow-hidden bg-surface">
                  {model.thumb ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- CRM-served, as above */
                    <img
                      src={model.thumb}
                      alt={model.label}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span aria-hidden className="m-stripe h-0.5 w-6" />
                  )}
                </span>

                <span className="caption leading-tight text-muted transition-colors group-hover/model:text-ink">
                  {model.label}
                </span>
              </Link>
            ))}
          </div>

          <Link
            href={`/cars?make=${encodeURIComponent(maker.name)}`}
            className="caption mt-4 block text-center text-ink underline underline-offset-4"
          >
            View all models
          </Link>
        </div>
      )}
    </div>
  );
}
