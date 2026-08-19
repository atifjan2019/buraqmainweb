"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "./Icons";

interface CardRailProps {
  /**
   * The cards. These arrive as already-rendered Server Component output —
   * passing them through `children` keeps VehicleCard off this component's
   * module graph, so the cards stay server-rendered and only the scroll
   * mechanics ship to the browser.
   */
  children: React.ReactNode;
  /**
   * Plural noun for the arrows' accessible names — "vehicles", "reviews". A
   * screen-reader user hearing "Next" twice on one page cannot tell which rail
   * they are in.
   */
  noun: string;
}

/**
 * A horizontal card rail with paging arrows.
 *
 * Built on native overflow scrolling rather than a transform-based carousel:
 * the track is a real scroll container, so trackpad swipes, touch flicks,
 * shift+wheel, keyboard and screen-reader focus all work with no code. The
 * arrows are an *addition* to that, not the mechanism — which is why the rail
 * still functions perfectly if this component never hydrates.
 *
 * Paging moves by whole cards rather than a fixed pixel amount, measured off
 * the first card so it stays correct across the responsive width changes.
 */
export default function CardRail({ children, noun }: CardRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    // 1px of slack: browsers report fractional scroll positions at some zoom
    // levels, and an exact comparison leaves the end arrow enabled forever.
    setAtStart(el.scrollLeft <= 1);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    sync();

    // The track's own scrolling, plus resize: a viewport change alters how
    // many cards fit, which can leave the rail already at its end.
    el.addEventListener("scroll", sync, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync]);

  const page = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;

    // Measure a real card so the step follows the responsive card width
    // instead of a hard-coded guess. The 24px is the gap-6 gutter.
    const card = el.firstElementChild as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 : el.clientWidth;

    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <div className="mt-14">
      <div
        ref={trackRef}
        /* No visible scrollbar: the arrows and the partially-visible next card
           already say "this scrolls", and a bar under the photography would be
           the only chrome of its kind on the page. Scrolling itself is
           untouched — this hides the bar, it does not disable the gesture. */
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2
                   [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      {/* Controls sit under the track, right-aligned. Overlaying them on the
          photography would need a scrim to stay legible, and the design doc
          rules gradients out. */}
      <div className="mt-8 flex justify-end gap-3">
        <RailButton
          direction="left"
          noun={noun}
          disabled={atStart}
          onClick={() => page(-1)}
        />
        <RailButton
          direction="right"
          noun={noun}
          disabled={atEnd}
          onClick={() => page(1)}
        />
      </div>
    </div>
  );
}

function RailButton({
  direction,
  noun,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  noun: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={`${direction === "left" ? "Previous" : "Next"} ${noun}`}
      /* Square, ink-outlined, flat — the same vocabulary as .btn-outline.
         Disabled fades rather than disappears, so the control row does not
         reflow when you reach either end. */
      className="flex h-12 w-12 items-center justify-center border border-ink text-ink
                 transition-colors duration-200
                 hover:bg-ink hover:text-on-ink
                 focus-visible:bg-ink focus-visible:text-on-ink focus-visible:outline-none
                 disabled:pointer-events-none disabled:opacity-25"
    >
      <ArrowRight
        className={`h-4 w-4 ${direction === "left" ? "rotate-180" : ""}`}
      />
    </button>
  );
}
