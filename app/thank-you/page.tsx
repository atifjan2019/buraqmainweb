import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, Check, Phone, WhatsApp } from "@/components/Icons";
import {
  decodeReceipt,
  ENQUIRY_RECEIPT_COOKIE,
  firstName,
} from "@/lib/enquiry-receipt";
import { contact, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Thank you",
  description: "We've received your enquiry and will be in touch shortly.",
  // A transactional page for one customer — never a search result.
  robots: { index: false, follow: false },
};

/**
 * Confirmation shown after an enquiry is submitted.
 *
 * Details arrive in a short-lived httpOnly cookie set by the Server Action, not
 * in the URL, so the customer's name and reference stay out of browser history,
 * logs and `Referer` headers. Reaching this page directly — bookmarked, shared,
 * or after the cookie expires — is expected and falls back to a generic thank
 * you rather than an error.
 */
export default async function ThankYouPage() {
  const store = await cookies();
  const receipt = decodeReceipt(store.get(ENQUIRY_RECEIPT_COOKIE)?.value);

  const greeting = receipt ? firstName(receipt.name) : "";
  const wa = whatsappLink(
    receipt?.vehicle
      ? `Hi Burraq Motors, I've just enquired about the ${receipt.vehicle}${
          receipt.reference ? ` (${receipt.reference})` : ""
        }.`
      : "Hi Burraq Motors, I've just sent an enquiry.",
  );

  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-32 pb-24">
      {/*
        Ambient warmth behind the confirmation, mixed off --color-glow rather
        than --color-amber: it carries no text, so it has no contrast
        requirement and keeps the brand's vivid amber on both themes. The light
        palette's darkened amber would turn this into a muddy tan.
      */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[45rem] w-[60rem] -translate-x-1/2 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, color-mix(in oklab, var(--color-glow) 13%, transparent) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-2xl px-5 text-center sm:px-8">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber/15">
          <Check className="h-8 w-8 text-amber" />
        </span>

        <h1 className="mt-7 font-display text-[clamp(2rem,5.5vw,3.2rem)] font-bold leading-[1.05] tracking-[-0.03em] text-ink">
          {greeting ? `Thank you, ${greeting}` : "Thank you"}
        </h1>

        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted">
          {receipt?.vehicle ? (
            <>
              We&apos;ve received your enquiry about the{" "}
              <span className="font-semibold text-ink">{receipt.vehicle}</span>.
              One of our team will be in touch shortly — usually the same day.
            </>
          ) : (
            <>
              We&apos;ve received your enquiry. One of our team will be in touch
              shortly — usually the same day.
            </>
          )}
        </p>

        {receipt?.reference && (
          <div className="mx-auto mt-8 inline-flex flex-col items-center rounded-2xl border border-line-soft bg-surface/60 px-7 py-5 backdrop-blur">
            <span className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-faint">
              Your reference
            </span>
            <span className="mt-2 font-display text-2xl font-bold tracking-wide text-gold">
              {receipt.reference}
            </span>
            <span className="mt-2 text-xs text-faint">
              Quote this if you call or message us
            </span>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`tel:${contact.phoneHref}`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-amber px-7 py-3.5 font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow)"
          >
            <Phone className="h-4.5 w-4.5" />
            {contact.phone}
          </a>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-7 py-3.5 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
            >
              <WhatsApp className="h-5 w-5" />
              WhatsApp us
            </a>
          )}
        </div>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          {receipt?.slug && (
            <Link
              href={`/cars/${receipt.slug}`}
              className="group inline-flex items-center gap-1.5 font-medium text-muted transition-colors hover:text-amber"
            >
              Back to the car
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          <Link
            href="/cars"
            className="group inline-flex items-center gap-1.5 font-medium text-muted transition-colors hover:text-amber"
          >
            Browse more cars
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <p className="mt-10 text-xs text-faint">
          {contact.openingHours}
        </p>
      </div>
    </section>
  );
}
