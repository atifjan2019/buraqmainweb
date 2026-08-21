"use client";

import { useEffect, useRef } from "react";

/**
 * Lamp positions, as percentages of the car image.
 *
 * Measured off the source render rather than estimated: each entry is the
 * luminance centroid of that lamp's lit pixels in the 1920x1080 original. They
 * are percentages because the container is sized by aspect-ratio, so one set of
 * numbers holds at every width — there is no breakpoint where a glow needs
 * moving, and adding a media query for position would mean a value here is
 * wrong.
 *
 * To re-measure after swapping the render, load the homepage with `?calibrate=1`
 * and click each lamp: the readout gives the exact pair to paste back in here.
 */
const LAMPS = [
  { id: "head-main", x: 28.85, y: 40.38, w: 6.2, h: 4.4, tint: "warm", delay: 0 },
  { id: "indicator", x: 31.38, y: 40.05, w: 2.4, h: 4.6, tint: "amber", delay: 60 },
  { id: "head-far", x: 10.05, y: 39.96, w: 3.0, h: 5.2, tint: "warm", delay: 30 },
  { id: "fog", x: 27.83, y: 52.68, w: 2.6, h: 2.2, tint: "warm", delay: 90 },
] as const;

/** Which lamps throw a beam onto the ground, and how far. */
const BEAMS = [
  { from: "head-main", x: 24, y: 62, w: 26, h: 16, rotate: -9 },
  { from: "head-far", x: 7, y: 60, w: 16, h: 12, rotate: -6 },
] as const;

export default function HeroCar() {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    // Blur layers are expensive to repaint. Off screen they must not run at
    // all, which animation-play-state gives us for free once the class lands.
    const observer = new IntersectionObserver(
      ([entry]) => frame.classList.toggle("is-paused", !entry.isIntersecting),
      { rootMargin: "120px" },
    );
    observer.observe(frame);

    // will-change earns its keep during the ignition burst and becomes a
    // standing cost afterwards, so it is dropped once the intro has settled.
    //
    // The lamps wait out the car's slide and the beat after it before they
    // light, so that burst starts later than it used to. Both durations are
    // read from the stylesheet rather than written down a second time here,
    // where a copy would go stale the first time somebody retimes the entry.
    const css = getComputedStyle(frame);
    const settle = window.setTimeout(
      () => frame.classList.add("has-settled"),
      readMs(css.getPropertyValue("--hero-entry"), 900) +
        readMs(css.getPropertyValue("--hero-ignite-beat"), 200) +
        1400,
    );

    const stopCalibrating = setUpCalibration(frame);

    return () => {
      observer.disconnect();
      window.clearTimeout(settle);
      stopCalibrating?.();
    };
  }, []);

  return (
    /* The container carries the image's own 16:9 ratio, so its box is exactly
       the rendered photograph at every width. That is what lets the glows be
       positioned in percentages: they are siblings of the img inside this box,
       so they scale with it rather than drifting as the viewport changes. */
    <div ref={frameRef} className="hero-car" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element --
          a static transparent cutout; next/image would add a wrapper whose box
          is not the rendered image, which is the one thing the overlay
          positioning depends on. */}
      <img
        src="/hero/land-cruiser.webp"
        alt=""
        width={1920}
        height={1080}
        fetchPriority="high"
        decoding="async"
        className="hero-car__img"
      />

      {BEAMS.map((beam) => {
        const lamp = LAMPS.find((l) => l.id === beam.from);
        return (
          <span
            key={beam.from}
            className="hero-beam"
            style={
              {
                left: `${beam.x}%`,
                top: `${beam.y}%`,
                width: `${beam.w}%`,
                height: `${beam.h}%`,
                "--rot": `${beam.rotate}deg`,
                // A beam follows its own lamp rather than sharing a delay, so
                // the light reaches the road just after the lamp lights — and
                // both wait for --hero-entry, the car's own arrival.
                animationDelay: `calc(var(--hero-entry) + var(--hero-ignite-beat) + ${(lamp?.delay ?? 0) + 40}ms)`,
              } as React.CSSProperties
            }
          />
        );
      })}

      {LAMPS.map((lamp) => (
        <span
          key={lamp.id}
          data-lamp={lamp.id}
          className={`hero-lamp hero-lamp--${lamp.tint}`}
          style={
            {
              left: `${lamp.x}%`,
              top: `${lamp.y}%`,
              width: `${lamp.w}%`,
              height: `${lamp.h}%`,
              // Offset by the entry duration: headlights that flare while the
              // car is still sliding read as a rendering fault, not a car
              // turning its lamps on. It arrives, then it lights up.
              animationDelay: `calc(var(--hero-entry) + var(--hero-ignite-beat) + ${lamp.delay}ms)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/**
 * A CSS time value in milliseconds.
 *
 * Accepts both units CSS allows, because `1.1s` and `1100ms` are the same
 * declaration and whoever retimes the entry should not have to know which one
 * this file happens to parse. Falls back rather than throwing: a mistimed
 * will-change drop is a wasted layer, not a broken hero.
 */
function readMs(value: string, fallback: number): number {
  const n = parseFloat(value);
  if (!Number.isFinite(n)) return fallback;
  return value.trim().endsWith("ms") ? n : n * 1000;
}

/**
 * Calibration mode: `?calibrate=1` on any page carrying the hero.
 *
 * The lamp coordinates above are the only hand-tuned numbers in this feature,
 * and they are tied to one specific render — swap the car photograph and every
 * one of them is wrong. This is the tool that makes re-measuring them a
 * two-minute job rather than a guessing loop: each lamp gets a crosshair so you
 * can see the current alignment against the new artwork, and clicking anywhere
 * prints the percentage pair under the cursor, ready to paste into LAMPS.
 *
 * It ships in the bundle deliberately. Gating it behind an env var would mean
 * the person most likely to need it — whoever swaps the render months from now
 * — cannot reach it on the deployed site. The cost is a few hundred bytes and
 * one `location.search` read that no normal visit ever passes.
 */
function setUpCalibration(frame: HTMLDivElement): (() => void) | undefined {
  if (new URLSearchParams(window.location.search).get("calibrate") !== "1") {
    return;
  }

  frame.classList.add("is-calibrating");

  const readout = document.createElement("output");
  readout.className = "hero-calibrate__readout";
  readout.textContent = "Click a lamp to read its position";
  frame.append(readout);

  const onClick = (event: MouseEvent) => {
    // Percentages of the frame, which is the same box the LAMPS values are
    // relative to — so what this prints can be pasted in unchanged.
    const box = frame.getBoundingClientRect();
    const x = ((event.clientX - box.left) / box.width) * 100;
    const y = ((event.clientY - box.top) / box.height) * 100;
    const pair = `x: ${x.toFixed(2)}, y: ${y.toFixed(2)}`;

    readout.textContent = pair;
    // eslint-disable-next-line no-console -- the entire point of this mode.
    console.log(`[hero-calibrate] ${pair}`);
  };

  frame.addEventListener("click", onClick);

  return () => {
    frame.removeEventListener("click", onClick);
    frame.classList.remove("is-calibrating");
    readout.remove();
  };
}
