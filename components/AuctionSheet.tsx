import Link from "next/link";
import { getVehicles } from "@/lib/crm";
import { contact, whatsappLink } from "@/lib/site";
import { vehicleHref, type Vehicle } from "@/lib/vehicles";
import { ArrowRight, WhatsApp } from "./Icons";
import Reveal from "./Reveal";

/**
 * The auction sheet, explained.
 *
 * Every car imported from a Japanese auction carries the inspector's own
 * grading of it. For a UK buyer that sheet is the single strongest piece of
 * evidence about a car's condition, and most people have never seen one — so
 * the section's job is to say the sheet exists, that we hand it over, and that
 * they are free to check it themselves.
 *
 * What it deliberately does NOT claim is a translation service. The dealership
 * asked for the offer to be "you can have the sheet and verify it with us",
 * and promising to translate documents is a commitment to work nobody has
 * agreed to do.
 *
 * The illustration is a real auction sheet from live stock when one has been
 * published, which is why this component reads the CRM rather than shipping a
 * picture. Until then it shows the grading scale instead — true either way,
 * and never a stock photo of somebody else's paperwork.
 */
export default async function AuctionSheet() {
  let sheet: { thumb: string; href: string; label: string } | null = null;

  try {
    const { vehicles } = await getVehicles({ perPage: 50 });
    sheet = firstPublishedSheet(vehicles);
  } catch {
    // A CRM outage costs this section its illustration, never the page.
    sheet = null;
  }

  const wa = whatsappLink(
    "Hi Burraq Motors, could you send me the auction sheet for a car I'm interested in?",
  );

  return (
    <section className="border-t border-line-soft bg-canvas-deep py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <div>
              <span className="eyebrow">Japanese Imports</span>

              <h2 className="display-lg mt-6 text-ink">Ask For The Auction Sheet</h2>

              <p className="mt-6 max-w-xl text-base font-light leading-relaxed text-muted">
                Every car sold at a Japanese auction is inspected first, and the
                inspector records what they find on an auction sheet — a grade
                for the car overall, separate grades for the interior and
                bodywork, the verified odometer reading, and a diagram marking
                every scratch, dent and repair they could see.
              </p>

              <p className="mt-4 max-w-xl text-base font-light leading-relaxed text-muted">
                It is the most honest document that exists about an imported
                car, because it was written before anyone was trying to sell it
                to you. Ask us for the sheet on any car here and we will send
                it — and you are welcome to have it checked by anyone you
                like. We would rather you bought with the evidence in front of
                you.
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link href="/contact" className="btn btn-solid">
                  Request a sheet
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {wa && (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline"
                  >
                    <WhatsApp className="h-4 w-4" />
                    Ask on WhatsApp
                  </a>
                )}
              </div>

              <p className="caption mt-6 text-faint">
                Or call {contact.phone} — we can read one over the phone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            {sheet ? (
              /* A real sheet from real stock, linking to the car it belongs
                 to. Flat on the canvas with a hairline — the design system has
                 no shadows, and a document does not need dressing up. */
              <Link href={sheet.href} className="group block">
                {/* eslint-disable-next-line @next/next/no-img-element --
                    served straight from the CRM, as VehicleCard documents. */}
                <img
                  src={sheet.thumb}
                  alt={sheet.label}
                  loading="lazy"
                  decoding="async"
                  className="w-full border border-line bg-canvas object-contain transition-opacity group-hover:opacity-90"
                />
                <span className="caption mt-4 block text-faint">
                  A real sheet from our current stock — tap to see the car
                </span>
              </Link>
            ) : (
              <GradingScale />
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/**
 * What the grades mean, for the case where no sheet has been published yet.
 *
 * This is the part of a sheet a buyer actually needs translating, and it is
 * the same for every car — so it is worth saying plainly rather than filling
 * the space with a picture of a document we do not have.
 */
function GradingScale() {
  const grades: Array<[string, string]> = [
    ["S", "As new. Almost never seen on an imported used car."],
    ["6 – 5", "Exceptional. Very low mileage, no meaningful faults."],
    ["4.5 – 4", "Good honest condition. Where most of our stock sits."],
    ["3.5 – 3", "Visible wear or past repair. Priced accordingly."],
    ["R", "Repaired accident damage, declared on the sheet."],
  ];

  return (
    <div className="border border-line bg-canvas">
      <div className="border-b border-line px-6 py-4 sm:px-8">
        <span className="label-uppercase text-ink">The grading scale</span>
      </div>

      <dl>
        {grades.map(([grade, meaning], i) => (
          <div
            key={grade}
            className={`flex gap-6 px-6 py-4 sm:px-8 ${
              i > 0 ? "border-t border-line-soft" : ""
            }`}
          >
            <dt className="w-20 shrink-0 font-mono text-sm font-bold text-ink">
              {grade}
            </dt>
            <dd className="text-sm font-light leading-relaxed text-muted">
              {meaning}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/** The first published auction sheet across current stock, if there is one. */
function firstPublishedSheet(
  vehicles: Vehicle[],
): { thumb: string; href: string; label: string } | null {
  for (const vehicle of vehicles) {
    const doc = vehicle.documents.find(
      // A PDF has no thumbnail, so it cannot illustrate anything here.
      (d) => d.kind.startsWith("auction_sheet") && d.thumb,
    );

    if (doc?.thumb) {
      return {
        thumb: doc.thumb,
        href: vehicleHref(vehicle),
        label: `${doc.label} — ${vehicle.make} ${vehicle.model}`,
      };
    }
  }

  return null;
}
