import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import Reveal from "@/components/Reveal";
import { contact } from "@/lib/site";
import {
  formatSlot,
  LAST_SLOT,
  MIN_NOTICE_HOURS,
  OPENS_AT,
} from "@/lib/booking";

export const metadata: Metadata = {
  title: "Book a Test Drive",
  description:
    "Book a test drive, a showroom viewing or a collection at Burraq Motors in Bury. Pick a day and time and we'll call to confirm.",
};

/**
 * The booking page.
 *
 * Deliberately honest about what it does: it takes a REQUEST. Nothing here or
 * in the CRM checks whether the car or a salesperson is free, so every slot
 * offered is one the customer would like rather than one the business has
 * agreed to. The copy says so three times — in the intro, on the button, and
 * again on the confirmation — because the failure mode of getting this wrong is
 * somebody driving to Bury for an appointment nobody knew about.
 */
export default function BookPage() {
  const opens = formatSlot(`${String(OPENS_AT).padStart(2, "0")}:00`);
  const last = formatSlot(`${String(LAST_SLOT).padStart(2, "0")}:00`);

  return (
    <>
      <section className="border-b border-line-soft bg-canvas pt-32 pb-16">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <Reveal>
            <span className="eyebrow">Visit Us</span>
            <h1 className="display-lg mt-6 text-ink">Book a test drive</h1>
            <p className="mt-6 max-w-2xl text-base font-light leading-relaxed text-muted">
              Tell us when suits and we&apos;ll get the car ready. Every booking
              is confirmed by phone first, so you never travel for a car that
              isn&apos;t there.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-canvas-deep py-20">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* What to expect, so the form is not the first thing that has to
                explain itself. */}
            <Reveal>
              <div className="max-w-md">
                <h2 className="display-sm text-ink">How it works</h2>

                <ol className="mt-10 border-t border-line-soft">
                  {[
                    [
                      "Ask for a slot",
                      `Pick any day we're open, between ${opens} and ${last}. We need at least ${MIN_NOTICE_HOURS} hours' notice to get a car ready.`,
                    ],
                    [
                      "We call you back",
                      "Usually the same working day. We'll confirm the car is available and the time still works.",
                    ],
                    [
                      "Come and drive it",
                      "Bring your driving licence. If you're part-exchanging, bring that car and its V5C too.",
                    ],
                  ].map(([title, body], i) => (
                    <li
                      key={title}
                      className="flex gap-6 border-b border-line-soft py-6"
                    >
                      <span className="display-sm shrink-0 text-ghost-numeral">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="title-lg text-ink">{title}</h3>
                        <p className="mt-2 text-sm font-light leading-relaxed text-muted">
                          {body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>

                <div className="mt-10 border border-line p-6">
                  <p className="label-uppercase-sm text-faint">
                    Rather just call?
                  </p>
                  <a
                    href={`tel:${contact.phoneHref}`}
                    className="display-sm mt-3 block text-ink transition-colors hover:text-muted"
                  >
                    {contact.phone}
                  </a>
                  <p className="caption mt-3 text-faint">
                    {contact.openingHours}
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <BookingForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
