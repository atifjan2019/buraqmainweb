"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "./Icons";

/**
 * Drift speed in pixels per second.
 *
 * Was 28; raised 40% at the owner's request. Per second rather than per frame
 * so a 120Hz laptop and a 60Hz monitor move at the same rate.
 */
const SPEED = 39.2;

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
  /**
   * Drift the rail leftwards on its own, wrapping forever.
   *
   * The caller must render its cards TWICE for this — the wrap works by
   * jumping back exactly one copy's width once the first copy has passed, and
   * that jump is only invisible because identical content sits under it.
   */
  autoScroll?: boolean;
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
export default function CardRail({
  children,
  noun,
  autoScroll = false,
}: CardRailProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  /**
   * Anything that should stop the drift: a pointer over the rail, focus
   * inside it, a finger on it, or a page in a background tab. Held in a ref
   * rather than state so the animation frame reads it without re-rendering
   * sixty times a second.
   */
  const paused = useRef(false);

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

  useEffect(() => {
    if (!autoScroll) return;

    const el = trackRef.current;
    if (!el) return;

    // Anyone who asks for less motion gets a rail that simply sits still. The
    // arrows and the scrollbar still work, so nothing is lost but the drift.
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (still.matches) return;

    let frame = 0;
    let last = performance.now();

    const step = (now: number) => {
      const elapsed = now - last;
      last = now;

      frame = requestAnimationFrame(step);

      if (paused.current || document.hidden) return;

      // Pixels per second, not per frame: a 120Hz laptop and a 60Hz monitor
      // must move the rail at the same speed.
      el.scrollLeft += (elapsed / 1000) * SPEED;

      // The wrap. The caller renders two identical copies, so scrolling past
      // the first one puts the second in exactly the position the first
      // occupied — subtracting its width lands on an identical frame and the
      // seam cannot be seen. Assigning scrollLeft directly (never scrollTo
      // with smooth behaviour) keeps the jump instantaneous.
      const half = el.scrollWidth / 2;
      if (half > 0 && el.scrollLeft >= half) el.scrollLeft -= half;
    };

    frame = requestAnimationFrame(step);

    return () => cancelAnimationFrame(frame);
  }, [autoScroll]);

  const page = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;

    // Taking the arrows means steering it yourself; drifting on afterwards
    // would fight the person using it.
    paused.current = true;

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
        {...(autoScroll
          ? {
              // Reading a card is impossible while it slides away, and a rail
              // that keeps moving under a pointer feels broken rather than
              // alive. Focus is covered too: a keyboard user tabbing into a
              // card must not have it scroll out from under them.
              onMouseEnter: () => (paused.current = true),
              onMouseLeave: () => (paused.current = false),
              onFocusCapture: () => (paused.current = true),
              onBlurCapture: () => (paused.current = false),
              onTouchStart: () => (paused.current = true),
              // Not resumed on touchend: a phone has no hover, so the only
              // honest reading of a deliberate touch is "I am looking at
              // this now". It resumes on the next page load.
            }
          : {})}
        /* No visible scrollbar: the arrows and the partially-visible next card
           already say "this scrolls", and a bar under the photography would be
           the only chrome of its kind on the page. Scrolling itself is
           untouched — this hides the bar, it does not disable the gesture. */
        /* Scroll snapping and a continuous drift are incompatible: mandatory
           snap keeps hauling the track back to the nearest card, so the rail
           either stutters or refuses to move at all. A drifting rail gets no
           snap; a hand-driven one keeps it, because a flick that lands
           halfway across a card looks broken. */
        className={`flex gap-6 overflow-x-auto pb-2
                    [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
                    ${autoScroll ? "" : "snap-x snap-mandatory"}`}
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
