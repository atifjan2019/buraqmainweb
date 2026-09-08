import Link from "next/link";
import { bookingCta, contact, showroomBySlug, whatsappLink } from "@/lib/site";
import { Phone, WhatsApp } from "./Icons";

interface VehicleStickyBarProps {
  /** Used to name the car in the WhatsApp message and prefill the booking. */
  headline: string;
  registration?: string | null;
  /** CRM branch slug, so Call reaches the showroom holding this car. */
  branchSlug?: string | null;
}

/**
 * The three ways to start a conversation about this car, pinned to the bottom
 * of a phone screen.
 *
 * A vehicle page is long — gallery, spec grid, description, auction sheets, a
 * finance calculator and a representative example — and on mobile every
 * contact affordance sat below all of it. The desktop layout has had a sticky
 * enquiry sidebar since it was built (`lg:sticky`), so the visitor most likely
 * to be holding a phone was the only one who had to scroll to the end to find
 * a phone number.
 *
 * Deliberately plain links, no client component and no state: this is the
 * page's purpose, and it does not get to depend on a bundle arriving. The
 * enquiry card above it is inside a `js-only` block for the modal, and this
 * bar is what covers the case where that never loads.
 *
 * `lg:hidden` because above that width the sticky sidebar already does this
 * job, and two of them would be one too many.
 */
export default function VehicleStickyBar({
  headline,
  registration,
  branchSlug,
}: VehicleStickyBarProps) {
  const plate = registration?.trim();

  // Same rule as the sidebar: ring the branch the car is standing in.
  const showroom = showroomBySlug(branchSlug);
  const phone = showroom?.phone ?? contact.phone;
  const phoneHref = showroom?.phoneHref ?? contact.phoneHref;
  const wa = whatsappLink(
    `Hi, I'm interested in the ${headline}${plate ? ` (${plate})` : ""} — is it still available?`,
  );

  const bookHref = plate
    ? `${bookingCta.href}?vehicle=${encodeURIComponent(plate)}`
    : bookingCta.href;

  return (
    <div
      /* pb-[env(safe-area-inset-bottom)] keeps the row clear of the iPhone home
         indicator, which otherwise sits over the middle button. */
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <div className="grid grid-cols-3 gap-2 p-3">
        {phone && (
          <a
            href={`tel:${phoneHref}`}
            className="btn btn-outline h-12 min-h-12 w-full px-2 text-xs"
          >
            <Phone className="h-4 w-4" />
            Call
          </a>
        )}

        {wa && (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline h-12 min-h-12 w-full px-2 text-xs"
          >
            <WhatsApp className="h-4 w-4" />
            WhatsApp
          </a>
        )}

        {/* The solid one: booking is the outcome this page exists to produce. */}
        <Link
          href={bookHref}
          className="btn btn-solid h-12 min-h-12 w-full px-2 text-center text-xs"
        >
          Test Drive
        </Link>
      </div>
    </div>
  );
}
