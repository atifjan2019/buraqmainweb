import type { SVGProps } from "react";

/**
 * Inline icon set. Kept local rather than pulling an icon package so the
 * production bundle stays small and the Docker build on the VPS stays light.
 */

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function ArrowRight(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function Calendar(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 11h18" />
    </svg>
  );
}

export function Sun(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function Moon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  );
}

export function Gauge(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
      <path d="m13.4 10.6 4.1-4.1" />
      <path d="M3.5 18a9 9 0 1 1 17 0" />
    </svg>
  );
}

export function Fuel(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15" />
      <path d="M3 20h12" />
      <path d="M13 9h3a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-2.5-2.5" />
      <path d="M6 8h5" />
    </svg>
  );
}

export function Gear(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 4v16M18 4v16M6 9h12M12 4v5" />
      <circle cx="6" cy="4" r="1.4" />
      <circle cx="18" cy="4" r="1.4" />
      <circle cx="12" cy="20" r="1.4" />
    </svg>
  );
}

export function Shield(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3l7 3v6c0 4.2-2.9 7.8-7 9-4.1-1.2-7-4.8-7-9V6l7-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/**
 * Clasped hands — the finance assurance in the hero.
 *
 * Drawn as two forearms meeting at a grip rather than as anatomical hands:
 * at the 20px this renders at, fingers turn to mush, and the two diagonals
 * plus a horizontal clasp still read as a handshake at that size.
 */
export function Handshake(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M2.5 10.5 6 7a1.8 1.8 0 0 1 2.5 0L11 9.5" />
      <path d="M21.5 10.5 18 7a1.8 1.8 0 0 0-2.5 0L13 9.5" />
      <path d="m7 12.5 2.8 2.8a1.7 1.7 0 0 0 2.4 0l3.3-3.3" />
      <path d="M2.5 10.5v2.8M21.5 10.5v2.8" />
    </svg>
  );
}

/**
 * Headset — customer support.
 *
 * A headset rather than the mockup's "247" roundel: three digits inside a
 * 20px circle land under 6px tall, which is below the point where the numerals
 * are legible at all. The wording beside it already says 24/7, so the icon only
 * has to carry "support", and a headset does that without needing to be read.
 */
export function Headset(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 13.5v-1.5a8 8 0 0 1 16 0v1.5" />
      <rect x="2" y="13" width="4.5" height="6" rx="1.8" />
      <rect x="17.5" y="13" width="4.5" height="6" rx="1.8" />
      <path d="M19.75 19v.5a2.5 2.5 0 0 1-2.5 2.5H13" />
    </svg>
  );
}

export function Check(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

export function Phone(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6.5 3h3l1.5 4-2 1.5a12 12 0 0 0 6.5 6.5L17 13l4 1.5v3a2 2 0 0 1-2.2 2A17 17 0 0 1 3.5 5.2 2 2 0 0 1 5.5 3h1Z" />
    </svg>
  );
}

export function Mail(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

export function Pin(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function Star(props: IconProps) {
  return (
    <svg {...base} fill="currentColor" stroke="none" {...props}>
      <path d="m12 3 2.6 5.6 6 .8-4.4 4.2 1.1 6L12 16.8 6.7 19.6l1.1-6L3.4 9.4l6-.8L12 3Z" />
    </svg>
  );
}

export function Quote(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M9.5 5.5C6.4 7 4.6 9.7 4.6 13v5.5h6.2V13H7.9c0-2.3 1-3.9 3-4.9l-1.4-2.6Zm9.6 0C16 7 14.2 9.7 14.2 13v5.5h6.2V13h-2.9c0-2.3 1-3.9 3-4.9l-1.4-2.6Z" />
    </svg>
  );
}

export function WhatsApp(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84a9.6 9.6 0 0 0 1.32 4.88L2 22l5.42-1.42a9.85 9.85 0 0 0 4.62 1.18h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2Zm0 17.9h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.51 3.68-8.18 8.2-8.18a8.18 8.18 0 0 1 0 16.36Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.22-.09-.39-.13-.55.12s-.63.8-.77.96-.28.19-.53.06a6.7 6.7 0 0 1-3.35-2.93c-.25-.43.25-.4.72-1.33.08-.16.04-.3-.02-.42s-.55-1.33-.76-1.82c-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.31s-.84.82-.84 2 .86 2.32.98 2.48c.12.16 1.7 2.59 4.11 3.63 1.53.66 2.13.72 2.9.6.46-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.06-.11-.22-.17-.47-.29Z" />
    </svg>
  );
}

export function Menu(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function Close(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function Car(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 17h14M4 17v-4.2a2 2 0 0 1 .2-.9L6.5 7A2 2 0 0 1 8.3 6h7.4a2 2 0 0 1 1.8 1.1l2.3 4.8a2 2 0 0 1 .2.9V17" />
      <path d="M4 13h16" />
      <circle cx="7.5" cy="17" r="1.6" />
      <circle cx="16.5" cy="17" r="1.6" />
    </svg>
  );
}

/**
 * A sheet of paper with a turned corner and ruled lines — used where a document
 * exists but cannot be pictured, so the placeholder reads as a document rather
 * than as a photograph that failed to load.
 */
export function Document(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h4" />
    </svg>
  );
}

export function Sparkle(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
    </svg>
  );
}
