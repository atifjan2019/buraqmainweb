import type { Metadata } from "next";
import EnquiryForm from "@/components/EnquiryForm";
import { Calendar, Mail, Phone, Pin, WhatsApp } from "@/components/Icons";
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
      <section className="relative overflow-hidden pt-32 pb-14 sm:pt-40 sm:pb-16">
        {/* Ambient warmth behind the masthead, mixed off --color-glow rather
            than --color-amber: it carries no text, so it has no contrast
            requirement and keeps the brand's vivid amber on both themes. */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[36rem] w-[56rem] -translate-x-1/2 opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 12%, transparent) 0%, transparent 65%)",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="CONTACT"
            title="Let's talk about"
            accent="your next car"
            body="Call us, message us on WhatsApp, or send the form below. Whichever you pick, a person reads it and comes back to you."
          />
        </div>
      </section>

      <section className="pb-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
            {/* Ways to reach us */}
            <div className="flex flex-col gap-4">
              {contact.phone && (
                <Reveal>
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="glass group flex items-start gap-4 rounded-2xl p-6 transition-colors hover:border-amber/40"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber/30 bg-amber/10 text-amber">
                      <Phone className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-base font-semibold text-ink">
                        Call the showroom
                      </span>
                      <span className="mt-1 block break-words text-sm text-amber">
                        {contact.phone}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted">
                        Quickest way to check whether a car is still available.
                      </span>
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
                    className="glass group flex items-start gap-4 rounded-2xl p-6 transition-colors hover:border-amber/40"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber/30 bg-amber/10 text-amber">
                      <WhatsApp className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-base font-semibold text-ink">
                        WhatsApp us
                      </span>
                      <span className="mt-1 block break-words text-sm text-amber">
                        {contact.whatsappDisplay}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted">
                        Send photos of your part-exchange and we&apos;ll value
                        it.
                      </span>
                    </span>
                  </a>
                </Reveal>
              )}

              {contact.email && (
                <Reveal delay={160}>
                  <a
                    href={`mailto:${contact.email}`}
                    className="glass group flex items-start gap-4 rounded-2xl p-6 transition-colors hover:border-amber/40"
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber/30 bg-amber/10 text-amber">
                      <Mail className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-base font-semibold text-ink">
                        Email us
                      </span>
                      {/* Long addresses must wrap rather than widen the card
                          and push the grid past the viewport on a phone. */}
                      <span className="mt-1 block break-all text-sm text-amber">
                        {contact.email}
                      </span>
                      <span className="mt-2 block text-sm leading-relaxed text-muted">
                        Best for anything you need in writing.
                      </span>
                    </span>
                  </a>
                </Reveal>
              )}

              <Reveal delay={240}>
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-amber/30 bg-amber/10 text-amber">
                      <Pin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="font-display text-base font-semibold text-ink">
                        Visit us
                      </h2>
                      {contact.addressLines.length > 0 && (
                        <address className="mt-1 not-italic leading-relaxed text-muted">
                          {contact.addressLines.map((line) => (
                            <span key={line} className="block text-sm">
                              {line}
                            </span>
                          ))}
                        </address>
                      )}
                      <p className="mt-3 flex items-start gap-2 text-sm text-muted">
                        <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-amber/70" />
                        {contact.openingHours}
                      </p>
                      {directions && (
                        <a
                          href={directions}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block text-sm font-semibold text-amber underline decoration-amber/40 underline-offset-4 transition-colors hover:text-amber-bright"
                        >
                          Get directions
                        </a>
                      )}
                    </div>
                  </div>
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
