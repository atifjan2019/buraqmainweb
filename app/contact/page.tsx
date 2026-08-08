import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { ArrowRight } from "@/components/Icons";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import { contact, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Call, WhatsApp or message Burraq Motors in Manchester. Showroom in Bury, open Monday to Saturday. We'll come back to you on availability, finance and part-exchange.",
};

/**
 * Every detail here comes from `contact` in `lib/site.ts`, and each block is
 * gated on its own value being present. An unverified detail is left out
 * rather than guessed — a wrong phone number on a contact page costs real
 * enquiries, so the page is built to degrade to whatever is actually known.
 */
export default function ContactPage() {
  const wa = whatsappLink(
    "Hi Burraq Motors, I'd like to ask about a car.",
  );

  /** A directions link, not an embedded map: an iframe from Google would set
   *  third-party cookies before the visitor has agreed to anything, and this
   *  site carries no consent banner. The link only loads on a deliberate tap. */
  const directions = contact.addressLines.length
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        [...contact.addressLines, contact.country].join(", "),
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
                    <span className="label-uppercase block text-faint">
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
                    <span className="label-uppercase block text-faint">
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
                    <span className="label-uppercase block text-faint">
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

              <Reveal delay={240}>
                <div className="border-b border-line py-6">
                  <h2 className="label-uppercase text-faint">Visit us</h2>
                  {contact.addressLines.length > 0 && (
                    <address className="mt-2 not-italic font-light leading-relaxed text-ink">
                      {contact.addressLines.map((line) => (
                        <span key={line} className="block text-sm">
                          {line}
                        </span>
                      ))}
                    </address>
                  )}
                  <p className="mt-3 text-sm font-light text-muted">
                    {contact.openingHours}
                  </p>
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
