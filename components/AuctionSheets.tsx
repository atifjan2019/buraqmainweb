import { formatFileSize, type VehicleDocument } from "@/lib/vehicles";
import { Document } from "./Icons";

/**
 * The auction-sheet section on a car's detail page.
 *
 * Every car Burraq Motors imports is inspected and graded at a Japanese
 * auction, and the inspector's sheet is the strongest proof of condition an
 * importer can put in front of a buyer — usually alongside an English
 * translation. This section is that evidence, so it is built to read as part of
 * the car's record rather than as a marketing block: the same hairline grid the
 * spec table uses, no fill, no shadow, no colour of its own.
 *
 * It deliberately does NOT reuse `VehicleGallery`'s lightbox. A sheet is dense
 * Japanese text, small stamps and a hand-written grade; the visitor needs to
 * zoom it with their own browser, save it, print it, or send it to a mechanic.
 * A lightbox traps the document inside our page and makes it feel like a
 * marketing image, so each sheet opens as its own full-resolution document
 * instead — in a new tab for an image, and as a download for a PDF, which is
 * what the CRM's `Content-Disposition: attachment` gives us either way.
 *
 * A Server Component: no state, no effects, no browser APIs, so it ships no
 * JavaScript at all. Per the Next.js Server and Client Components guide, the
 * `"use client"` directive is earned by interactivity, and there is none here.
 *
 * Images come straight from the CRM's URLs rather than through `next/image`,
 * for the reason `VehicleGallery` documents: `/_next/image` re-fetches and
 * re-encodes them and pins the site to a stale copy after a sheet is replaced
 * in the CRM — and this is the one picture on the site where being current is
 * the entire point. It would also need an `images.remotePatterns` entry for the
 * CRM host, which `next.config.ts` deliberately does not carry.
 */
export default function AuctionSheets({
  documents,
}: {
  documents: VehicleDocument[];
}) {
  // Neither sheet published — no heading, no empty frame, no "coming soon".
  // Most of the forecourt is in this state at any moment and an absent section
  // is the honest render of it.
  if (documents.length === 0) return null;

  const single = documents.length === 1;

  /*
   * The CRM's kind list grows without a site deploy, so the copy is chosen from
   * what actually arrived rather than assumed. Today that is only the two
   * auction sheets; if the dealership starts publishing an export certificate,
   * the heading widens and the auction-specific explanation drops out instead
   * of standing over a document it does not describe.
   */
  const auctionSheetsOnly = documents.every((sheet) =>
    sheet.kind.startsWith("auction_sheet"),
  );

  const heading = single
    ? documents[0].label
    : auctionSheetsOnly
      ? "Auction sheets"
      : "Vehicle documents";

  return (
    <div className="mt-16">
      <h2 className="title-lg text-ink">{heading}</h2>

      {auctionSheetsOnly && (
        // Most UK buyers have never seen one of these and will not know what
        // they are looking at. One sentence, in the page's own body voice.
        <p className="mt-4 max-w-2xl text-sm font-light leading-relaxed text-muted">
          Every car we import is inspected and graded at the Japanese auction.{" "}
          {single
            ? "This is the inspector's own sheet, exactly as it was issued."
            : "These are the inspector's own sheets, exactly as they were issued."}
        </p>
      )}

      {/*
        The same instrument-panel grid as the spec table above: a hairline
        border, 1px gaps, and cells that carry the canvas themselves — so this
        reads as another part of the record rather than as a panel bolted on.

        One document keeps a single column and a sensible ceiling, because a
        lone sheet stretched across the full column would be a 700px-wide
        thumbnail. Two sit side by side, original first — the site prints the
        CRM's order and never re-sorts.
      */}
      <div
        className={`mt-6 grid gap-px border border-line-soft bg-line-soft ${
          single ? "sm:max-w-md" : "sm:grid-cols-2"
        }`}
      >
        {documents.map((sheet) => (
          <Sheet
            key={sheet.url}
            sheet={sheet}
            // With one cell the heading already carries the label; printing it
            // again 400px below would be the same words twice.
            showLabel={!single}
          />
        ))}
      </div>
    </div>
  );
}

/** One document cell — a picture of the sheet, or a document affordance. */
function Sheet({
  sheet,
  showLabel,
}: {
  sheet: VehicleDocument;
  showLabel: boolean;
}) {
  const size = formatFileSize(sheet.byteSize);
  const isPdf = sheet.format === "pdf";

  const caption = [
    isPdf ? "PDF" : "Image",
    size,
    isPdf ? "Downloads" : "Opens full size",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <a
      href={sheet.url}
      /* An image opens as its own document for zooming and saving. A PDF is
         served with `Content-Disposition: attachment`, so it downloads — and
         pointing that at a new tab would leave a blank one behind. */
      target={isPdf ? undefined : "_blank"}
      rel="noopener noreferrer"
      className="group block bg-canvas p-5 sm:p-6"
    >
      {isPdf ? (
        /*
          Never an <img>, and never an empty grey box that reads as a thumbnail
          that failed. The CRM's host has no PDF renderer — no Ghostscript, no
          Imagick PDF delegate — so a PDF sheet can never have a preview, and
          this affordance says "document" plainly enough that the absent
          picture reads as a property of the format rather than as a fault.
        */
        <span className="surface-outline grid aspect-3/4 place-items-center bg-canvas">
          <span className="flex flex-col items-center gap-4 px-4 text-center">
            <Document aria-hidden className="h-10 w-10 text-faint" />
            <span className="label-uppercase-sm text-faint">
              PDF — no preview
            </span>
          </span>
        </span>
      ) : (
        <span className="photo-frame block aspect-3/4 overflow-hidden bg-canvas">
          {/*
            `object-contain`, never `object-cover`. Cropping is the one thing
            this section cannot do: a sheet with its grade box cut off is worse
            than no sheet at all. The letterboxing sits on canvas, which is
            also the colour of the paper.

            The width and height are the frame's ratio rather than the file's —
            sheets are scanned and photographed at every proportion, and the
            fixed-ratio box is what actually reserves the space.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element -- see file header */}
          <img
            src={sheet.thumb ?? sheet.url}
            alt=""
            width={600}
            height={800}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-contain transition-opacity duration-200 group-hover:opacity-85"
          />
        </span>
      )}

      {/*
        Hidden rather than dropped when the heading above already carries these
        words. The link's accessible name is built from its own text, so
        removing the label outright would leave a screen reader announcing
        "Image · 471 KB · Opens full size" with no idea which document that is.
      */}
      <span
        className={
          showLabel ? "label-uppercase-sm mt-4 block text-ink" : "sr-only"
        }
      >
        {sheet.label}
      </span>

      <span className={`caption block text-faint ${showLabel ? "mt-2" : "mt-4"}`}>
        {caption}
        {/* The thumbnail is decorative here — the label and this caption are
            the link's accessible name — so the one thing left to announce is
            where the link goes. */}
        {!isPdf && <span className="sr-only"> (opens in a new tab)</span>}
      </span>
    </a>
  );
}
