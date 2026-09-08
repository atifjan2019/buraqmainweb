"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Stagger in milliseconds, applied via the --reveal-delay custom property. */
  delay?: number;
  className?: string;
  as?: ElementType;
}

/**
 * Fades and lifts its children into view the first time they're scrolled to.
 *
 * THE HIDDEN STATE IS OPT-IN, NOT THE DEFAULT, and that is the whole design.
 *
 * The obvious way to build this is to hide every reveal in CSS and let the
 * observer show them. That is what this component used to do, gated behind
 * `[data-js]` so a blocked bundle still rendered the page. But `data-js` is
 * stamped before first paint, and scripting is far more often SLOW than
 * blocked: from that stamp until React had hydrated and the observer had run,
 * every section on the page was opacity:0. On mobile data that is a blank
 * screen for as long as the bundle takes, and above the fold it delayed the
 * headline, the strapline and both buttons behind a 520ms stagger that could
 * not animate anything, because there was no scroll to animate on.
 *
 * So the polarity is inverted. Markup renders visible. This effect then hides
 * only what is still below the fold, and only once it is in a position to
 * bring it back — the observer is attached in the same tick. Anything already
 * on screen is marked shown without ever being hidden, so it neither flashes
 * nor waits.
 *
 * The consequence worth stating plainly: if the bundle never arrives, every
 * section is readable. If it arrives late, the visitor has been reading the
 * page the whole time and the sections below simply stop animating. There is
 * no state in which content is invisible and nothing is coming to reveal it.
 */
export default function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Anyone who asks for less motion keeps the content exactly as rendered.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Already on screen: there is nothing to animate on, so leave it alone.
    // Measured rather than assumed, because "above the fold" depends on the
    // viewport, not on where the component sits in the source.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) return;

    // Below the fold. Hide it and attach the observer in the same tick, so the
    // element is never hidden without something already watching to show it.
    el.dataset.reveal = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      data-reveal=""
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
      className={className}
    >
      {children}
    </Tag>
  );
}
