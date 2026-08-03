"use client";

import { useState } from "react";

interface VideoEmbedProps {
  /** Vimeo video id. */
  id: string;
  title: string;
}

/**
 * Click-to-load Vimeo embed.
 *
 * Nothing is requested from Vimeo until the visitor presses play, so the page
 * sets no third-party cookies on load. That keeps the finance page defensible
 * under UK GDPR/PECR without a consent banner. `dnt=1` also asks Vimeo not to
 * track the session once it does load.
 */
export default function VideoEmbed({ id, title }: VideoEmbedProps) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://player.vimeo.com/video/${id}?dnt=1&autoplay=1`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className="h-full w-full border-0"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
      className="group/play relative grid h-full w-full place-items-center bg-surface-2 transition-colors hover:bg-surface"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(245,165,36,0.14), transparent 62%)",
        }}
      />
      <span className="relative grid h-16 w-16 place-items-center rounded-full border border-amber/40 bg-canvas/70 backdrop-blur transition-all duration-300 group-hover/play:scale-110 group-hover/play:border-amber group-hover/play:shadow-[0_0_36px_-6px_var(--color-amber)]">
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="ml-1 h-6 w-6 text-amber"
        >
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </span>
      <span className="relative mt-4 text-xs text-faint">
        Loads from Vimeo when you press play
      </span>
    </button>
  );
}
