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
      className="group/play relative grid h-full w-full place-items-center gap-4 bg-surface-2 transition-colors hover:bg-surface"
    >
      {/* A circular icon button, which is the one shape DESIGN-bmw-m.md
          allows a radius on: functional media controls read as circles, and
          everything else in the system reads as a rectangle. The radial wash
          that used to sit behind it is gone with the rest of the ornament. */}
      <span className="btn-icon transition-colors group-hover/play:border-ink group-hover/play:bg-ink group-hover/play:text-on-ink">
        <svg viewBox="0 0 24 24" fill="currentColor" className="ml-1 h-5 w-5">
          <path d="M8 5.5v13l11-6.5-11-6.5Z" />
        </svg>
      </span>
      <span className="caption text-faint">
        Loads from Vimeo when you press play
      </span>
    </button>
  );
}
