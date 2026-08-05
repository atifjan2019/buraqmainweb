"use client";

import { Moon, Sun } from "./Icons";

/**
 * Switches the site between the dark "Midnight Performance" palette and the
 * light one. Both are defined as token sets in globals.css and selected by
 * `data-theme` on <html>, so flipping that attribute repaints the whole site
 * — no component subscribes to the theme and nothing re-renders.
 *
 * There is deliberately no React state here. The theme is already on the DOM
 * before this component ever mounts (set by the inline script in layout.tsx,
 * ahead of first paint), so mirroring it into state would only create a second
 * copy that can disagree with the first, and would force this button to render
 * differently on the server than on the client. Which glyph shows is decided
 * in CSS off the same attribute — see `.theme-icon-*` in globals.css.
 *
 * Rendered inside a `.no-js-only`-free path on purpose: with scripting off the
 * button simply does nothing, and the site stays on its default dark palette.
 */
export default function ThemeToggle({
  className = "",
}: {
  className?: string;
}) {
  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "light" ? "dark" : "light";

    root.dataset.theme = next;

    // A refused write (Safari private mode, storage disabled) must not cost
    // the visitor the switch they just made — it only costs them the memory
    // of it on the next page load.
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* preference is not persistable here; the live switch still applied */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      /*
        Static label: the accessible name cannot describe the current theme
        without the server knowing it, and a name that changes under the user
        is worse for screen readers than one that names the action.
      */
      aria-label="Switch between the dark and light theme"
      title="Switch theme"
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-line text-muted transition-colors hover:border-amber/50 hover:text-amber ${className}`}
    >
      <Sun className="theme-icon-sun h-[18px] w-[18px]" />
      <Moon className="theme-icon-moon h-[18px] w-[18px]" />
    </button>
  );
}
