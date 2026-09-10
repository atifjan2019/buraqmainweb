import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { ArrowRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { getBranches } from "@/lib/crm";
import { contact, showrooms, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  // Self-referencing canonical, and an og:url that is this page rather
  // than the site root — the layout sets og:url to the homepage for
  // everything, so sharing any of these posted a card describing the
  // homepage.
  alternates: { canonical: "/contact" },
  openGraph: { url: "/contact" },
  title: "Contact",
  description:
    "Call, WhatsApp or message Burraq Motors in Manchester. Showroom in Bury, open Monday to Saturday. We'll come back to you on availability, finance and part-exchange.",
};

/** What one showroom block needs to render, whatever the source. */
interface ShowroomCard {
  name: string;
  addressLines: string[];
  phone: string;
  phoneHref: string;
  openingHours: string;
}

/** "07462 187617" → "+447462187617", for a tel: link. */
function telHref(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, "");
  return digits.startsWith("0") ? `+44${digits.slice(1)}` : `+${digits}`;
}

/**
 * The showrooms, from the CRM, with the built-in list as a safety net.
 *
 * The dealership maintains its branch addresses, phones and opening hours in
 * the CRM already, and this page used to carry a second copy in source — which
 * had drifted: it published one address and one phone number for a business
 * with two showrooms, and the number it published was the wrong branch's.
 *
 * Reading it live means the address a customer sees is whatever the dealership
 * last saved, with no deploy in between. It also means a correction in the CRM
 * — the Ashton record currently has a Bury address line against an Ashton
 * postcode — fixes the website the moment it is saved.
 *
 * Falling back rather than failing: if the CRM is unreachable this page still
 * has to give somebody a way to turn up, so it drops to the built-in list. That
 * list can be stale; an empty contact page is worse.
 */
async function loadShowrooms(): Promise<ShowroomCard[]> {
  try {
    const live = await getBranches();

    if (live.length > 0) {
      return live.map((branch) => ({
        name: branch.name,
        // Postcode last, on its own line, the way an envelope is written.
        addressLines: [
          ...branch.addressLines,
          [branch.city, branch.postcode].filter(Boolean).join(" "),
        ].filter(Boolean),
        phone: branch.phone,
        phoneHref: branch.phone ? telHref(branch.phone) : "",
        openingHours: branch.openingHours,
      }));
    }
  } catch (error) {
    console.error("[contact] showrooms unavailable, using built-in list", error);
  }

  return showrooms.map((showroom) => ({
    name: showroom.name,
    addressLines: showroom.addressLines,
    phone: showroom.phone,
    phoneHref: showroom.phoneHref,
    openingHours: showroom.openingHours,
  }));
}

/**
 * Contact details, each block gated on its own value being present. An
 * unverified detail is left out rather than guessed — a wrong phone number on a
 * contact page costs real enquiries, so the page degrades to whatever is
 * actually known.
 */
export default async function ContactPage() {
  const wa = whatsappLink(
    "Hi Burraq Motors, I'd like to ask about a car.",
  );

  const branches = await loadShowrooms();

  /** A directions link, not an embedded map: an iframe from Google would set
   *  third-party cookies before the visitor has agreed to anything, and this
   *  site carries no consent banner. The link only loads on a deliberate tap. */
  const directionsFor = (branch: ShowroomCard) =>
    branch.addressLines.length
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          [branch.name, ...branch.addressLines, contact.country].join(", "),
        )}`
      : null;

  return (
    <>
      <section className="bg-canvas pt-32 pb-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <SectionHeading
            eyebrow="Contact"
            title="Let's talk about"
            accent="your next car"
            body="Call us, message us on WhatsApp, or send the form below. Whichever you pick, a person reads it and comes back to you."
          />
        </div>
      </section>

      <section className="bg-canvas pb-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/*
              Ways to reach us. Each was an icon-in-a-rounded-square beside a
              tinted value; both are shapes this system doesn't have. They are
              now hairline-separated rows with a machined label over the value,
              which is how the doc presents a fact — and the whole column reads
              as one panel rather than four floating cards.
            */}
            <div className="border-t border-line">
              {contact.phone && (
                <Reveal>
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="group block border-b border-line py-6 transition-colors hover:bg-surface"
                  >
                    <span className="label-uppercase-sm block text-faint">
                      Call the showroom
                    </span>
                    <span className="title-md mt-2 block break-words text-ink">
                      {contact.phone}
                    </span>
                    <span className="mt-2 block text-sm font-light leading-relaxed text-muted">
                      Quickest way to check whether a car is still available.
                    </span>
                  </a>
                </Reveal>
              )}

              {wa && (
                <Reveal delay={80}>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block border-b border-line py-6 transition-colors hover:bg-surface"
                  >
                    <span className="label-uppercase-sm block text-faint">
                      WhatsApp us
                    </span>
                    <span className="title-md mt-2 block break-words text-ink">
                      {contact.whatsappDisplay}
                    </span>
                    <span className="mt-2 block text-sm font-light leading-relaxed text-muted">
                      Send photos of your part-exchange and we&apos;ll value it.
                    </span>
                  </a>
                </Reveal>
              )}

              {contact.email && (
                <Reveal delay={160}>
                  <a
                    href={`mailto:${contact.email}`}
                    className="group block border-b border-line py-6 transition-colors hover:bg-surface"
                  >
                    <span className="label-uppercase-sm block text-faint">
                      Email us
                    </span>
                    {/* Long addresses must wrap rather than widen the column
                        and push the grid past the viewport on a phone. */}
                    <span className="title-md mt-2 block break-all text-ink">
                      {contact.email}
                    </span>
                    <span className="mt-2 block text-sm font-light leading-relaxed text-muted">
                      Best for anything you need in writing.
                    </span>
                  </a>
                </Reveal>
              )}

              {/* One block per showroom, in the CRM's own order. Each field
                  is gated separately, so a branch whose address has not been
                  recorded yet still shows its name, its number and its hours
                  rather than disappearing from the page. */}
              {branches.map((branch, index) => {
                const directions = directionsFor(branch);

                return (
                  <Reveal key={branch.name} delay={240 + index * 60}>
                    <div className="border-b border-line py-6">
                      <h2 className="label-uppercase-sm text-faint">
                        Visit us · {branch.name}
                      </h2>

                      {branch.addressLines.length > 0 && (
                        <address className="mt-2 not-italic font-light leading-relaxed text-ink">
                          {branch.addressLines.map((line) => (
                            <span key={line} className="block text-sm">
                              {line}
                            </span>
                          ))}
                        </address>
                      )}

                      {branch.phone && (
                        <a
                          href={`tel:${branch.phoneHref}`}
                          className="mt-2 block text-sm font-light text-ink transition-opacity hover:opacity-70"
                        >
                          {branch.phone}
                        </a>
                      )}

                      {branch.openingHours && (
                        <p className="mt-3 text-sm font-light text-muted">
                          {branch.openingHours}
                        </p>
                      )}

                      {directions && (
                        <a
                          href={directions}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-m mt-2"
                        >
                          Get directions
                          <ArrowRight className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </Reveal>
                );
              })}
            </div>

            {/* General enquiry — no registration, so the CRM records it as a
                lead without a car attached. */}
            <Reveal delay={120}>
              <EnquiryForm
                heading="Send us a message"
                intro="Tell us what you're after and we'll come back to you with what we have, what we can source, and the finance options that fit."
              />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
