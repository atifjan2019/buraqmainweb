import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowRight, Phone, WhatsApp } from "@/components/Icons";
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
    <section className="flex min-h-[80svh] items-center bg-canvas pt-32 pb-24">
      <div className="mx-auto w-full max-w-2xl px-5 text-center sm:px-8">
        {/* The tick-in-a-disc is gone with the rest of the ornament. The
            tricolour marks the moment instead, which is what the doc reserves
            it for — a brand-identity beat, not a status icon. */}
        <span aria-hidden className="m-stripe mx-auto block h-1 w-16" />

        <h1 className="display-lg mt-8 text-ink">
          {greeting ? `Thank you, ${greeting}` : "Thank you"}
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base font-light leading-relaxed text-muted">
          {receipt?.vehicle ? (
            <>
              We&apos;ve received your enquiry about the{" "}
              <span className="text-ink">{receipt.vehicle}</span>.
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
          <div className="spec-cell mx-auto mt-10 inline-flex flex-col items-center border border-line-soft px-10 py-6">
            <span className="label-uppercase-sm text-faint">Your reference</span>
            <span className="display-sm mt-3 text-ink">
              {receipt.reference}
            </span>
            <span className="caption mt-3 text-faint">
              Quote this if you call or message us
            </span>
          </div>
        )}

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href={`tel:${contact.phoneHref}`} className="btn btn-solid">
            <Phone className="h-4.5 w-4.5" />
            {contact.phone}
          </a>

          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <WhatsApp className="h-5 w-5" />
              WhatsApp us
            </a>
          )}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
          {receipt?.slug && (
            <Link href={`/cars/${receipt.slug}`} className="link-m">
              Back to the car
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          <Link href="/cars" className="link-m">
            Browse more cars
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <p className="caption mt-12 text-faint">{contact.openingHours}</p>
      </div>
    </section>
  );
}
