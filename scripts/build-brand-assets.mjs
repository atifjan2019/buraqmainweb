/**
 * Generates dark-theme brand assets from the supplied logo raster.
 *
 * The source logo is artwork on a white field (black winged horse, red type),
 * which is illegible on the near-black site canvas. This script knocks the
 * white out and rebuilds the mark as a soft-edged monochrome silhouette, which
 * is the standard way to carry a light-background logo onto a dark surface.
 *
 * Run with: node scripts/build-brand-assets.mjs
 */

import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const SRC = "public/brand/logo.png";
const OUT = "public/brand";

/** Site palette. */
const INK = { r: 250, g: 250, b: 250 };
const AMBER = { r: 245, g: 165, b: 36 };

/**
 * Rebuilds artwork as a single-colour silhouette.
 *
 * Luminance drives the alpha channel, so dark ink becomes opaque, white paper
 * becomes fully transparent, and antialiased edges keep a soft falloff instead
 * of turning into jagged cutouts.
 */
async function monochrome(input, colour) {
  const img = sharp(input).ensureAlpha();
  const { data, info } = await img
    .raw()
    .toBuffer({ resolveWithObject: true });

  const out = Buffer.alloc(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];

    // Rec. 601 luma — cheap and perceptually fine for a mask.
    const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Ink (luma 0) -> opaque, paper (luma 1) -> transparent.
    // Source transparency is respected via `a`.
    const alpha = Math.round((1 - luma) * (a / 255) * 255);

    out[i] = colour.r;
    out[i + 1] = colour.g;
    out[i + 2] = colour.b;
    out[i + 3] = alpha;
  }

  return sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  });
}

await mkdir(OUT, { recursive: true });

// 1. Full lockup, trimmed of its white margin, in white and in amber.
const trimmed = await sharp(SRC).trim({ threshold: 20 }).png().toBuffer();

await (await monochrome(trimmed, INK))
  .resize({ width: 512, fit: "inside" })
  .png()
  .toFile(`${OUT}/logo-light.png`);

await (await monochrome(trimmed, AMBER))
  .resize({ width: 512, fit: "inside" })
  .png()
  .toFile(`${OUT}/logo-amber.png`);

// 2. The winged-horse emblem alone, for the header chip and app icons.
//    The lockup reads: "BMM" wordmark, horse, "BURRAQ MOTORS / MANCHESTER".
//    The horse occupies the middle band.
//    Band tuned so the "BMM" descenders stay out and the hooves stay in.
const meta = await sharp(trimmed).metadata();
const EMBLEM_TOP = 0.3;
const EMBLEM_BOTTOM = 0.83;
const emblem = await sharp(trimmed)
  .extract({
    left: 0,
    top: Math.round(meta.height * EMBLEM_TOP),
    width: meta.width,
    height: Math.round(meta.height * (EMBLEM_BOTTOM - EMBLEM_TOP)),
  })
  .trim({ threshold: 20 })
  .png()
  .toBuffer();

await (await monochrome(emblem, INK))
  .resize({ width: 256, fit: "inside" })
  .png()
  .toFile(`${OUT}/mark-light.png`);

await (await monochrome(emblem, AMBER))
  .resize({ width: 256, fit: "inside" })
  .png()
  .toFile(`${OUT}/mark-amber.png`);

// 3. App icons. Amber mark centred on the canvas colour, with breathing room.
const CANVAS = { r: 10, g: 10, b: 11, alpha: 1 };

for (const size of [192, 512]) {
  const inner = Math.round(size * 0.72);
  const markBuf = await (await monochrome(emblem, AMBER))
    .resize({ width: inner, height: inner, fit: "inside" })
    .png()
    .toBuffer();

  await sharp({
    create: { width: size, height: size, channels: 4, background: CANVAS },
  })
    .composite([{ input: markBuf, gravity: "center" }])
    .png()
    .toFile(`${OUT}/icon-${size}.png`);
}

// Next.js picks these up from app/ automatically.
const appIcon = await (await monochrome(emblem, AMBER))
  .resize({ width: 130, height: 130, fit: "inside" })
  .png()
  .toBuffer();

await sharp({
  create: { width: 180, height: 180, channels: 4, background: CANVAS },
})
  .composite([{ input: appIcon, gravity: "center" }])
  .png()
  .toFile("app/apple-icon.png");

const faviconMark = await (await monochrome(emblem, AMBER))
  .resize({ width: 24, height: 24, fit: "inside" })
  .png()
  .toBuffer();

await sharp({
  create: { width: 32, height: 32, channels: 4, background: CANVAS },
})
  .composite([{ input: faviconMark, gravity: "center" }])
  .png()
  .toFile("app/icon.png");

console.log("Brand assets written:");
console.log("  public/brand/logo-light.png   full lockup, white");
console.log("  public/brand/logo-amber.png   full lockup, amber");
console.log("  public/brand/mark-light.png   horse emblem, white");
console.log("  public/brand/mark-amber.png   horse emblem, amber");
console.log("  public/brand/icon-192.png     app icon");
console.log("  public/brand/icon-512.png     app icon");
console.log("  app/icon.png                  favicon");
console.log("  app/apple-icon.png            touch icon");
