"use client";

import { useEffect, useRef, useState } from "react";
import EnquiryForm from "./EnquiryForm";
import { Close } from "./Icons";

interface EnquiryDialogProps {
  /** Passed straight through to the form — the car this enquiry is about. */
  registration?: string;
  vehicleHeadline?: string;
  /** Label on the trigger. */
  label?: string;
}

/**
 * "Enquire now" button that opens the enquiry form in a modal.
 *
 * Built on the native <dialog> rather than a hand-rolled overlay, for the same
 * reason VehicleDescription is built on <details>: the browser supplies focus
 * trapping, Escape-to-close, background inertness and the correct
 * screen-reader semantics, and a hand-rolled modal gets at least one of those
 * subtly wrong. It also renders in the top layer, which escapes any containing
 * block an ancestor might create — the exact trap that was breaking the
 * gallery lightbox (see the reveal note in globals.css).
 *
 * This component is only half the story. It renders nothing useful without
 * scripting, so the vehicle page marks it `js-only` and renders the form
 * inline behind `no-js-only`. Enquiring is the site's one conversion path;
 * putting it behind a JS-only control with no fallback would silently remove
 * it for anyone whose bundle fails to load.
 */
export default function EnquiryDialog({
  registration,
  vehicleHeadline,
  label = "Enquire now",
}: EnquiryDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  /*
   * showModal() makes the page behind inert to clicks and to the keyboard, but
   * it does not stop it scrolling — a wheel over the backdrop still moves the
   * page under the form. The previous value is restored rather than cleared,
   * so this cooperates with anything else holding the same lock.
   */
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
        className="btn btn-solid w-full"
      >
        {label}
      </button>

      <dialog
        ref={dialogRef}
        /* Fires for the close button, for Escape, and for the backdrop click
           below — so the scroll lock is released on every exit path rather
           than on the one the button happens to take. */
        onClose={() => setOpen(false)}
        /* A click landing on the dialog itself is a click on the backdrop:
           the panel inside is a child, so anything that reaches this element
           missed it. */
        onClick={(event) => {
          if (event.target === dialogRef.current) dialogRef.current?.close();
        }}
        aria-label="Enquire about this car"
      >
        <div className="flex max-h-[90dvh] w-[min(34rem,92vw)] flex-col">
          {/* Outside the scroll container, so it stays reachable on a phone
              where the form is taller than the viewport. */}
          <div className="flex shrink-0 justify-end pb-3">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close the enquiry form"
              className="btn-icon"
            >
              <Close className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <EnquiryForm
              registration={registration}
              vehicleHeadline={vehicleHeadline}
            />
          </div>
        </div>
      </dialog>
    </>
  );
}
