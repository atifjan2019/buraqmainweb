import Link from "next/link";
import { getBranches } from "@/lib/crm";
import {
  contact,
  financeDisclaimer,
  guides,
  nav,
  showrooms,
  site,
} from "@/lib/site";
import { Mail, Phone } from "./Icons";
import Logo from "./Logo";

const year = new Date().getFullYear();

/*
  Auction Sheets used to head this list. It is a buying guide, and filing it
  with the privacy notice, the terms and the cookie policy both mislabelled it
  and diluted a column that on an FCA-facing trading site is compliance
  surface rather than a postscript. It sits in `guides` now.
*/
const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

/**
 * Showrooms for the footer, live from the CRM with the built-in list behind it.
 *
 * Same source as the contact page, so the two cannot disagree — which they did
 * while both kept their own copy. Falls back rather than failing: a footer with
 * no address is worse than one a day out of date.
 */
async function footerShowrooms() {
  try {
    const live = await getBranches();

    if (live.length > 0) {
      return live.map((branch) => {
        const digits = branch.phone.replace(/[^0-9]/g, "");
        return {
          name: branch.name,
          slug: branch.slug,
          // The static list carries the person who answers each phone; the CRM
          // has no such column, so it is matched on slug and simply omitted for
          // a branch the website does not know by name.
          contactName:
            showrooms.find((s) => s.slug === branch.slug)?.contactName ?? "",
          phone: branch.phone,
          phoneHref: digits.startsWith("0") ? `+44${digits.slice(1)}` : `+${digits}`,
          addressLines: [
            ...branch.addressLines,
            [branch.city, branch.postcode].filter(Boolean).join(" "),
          ].filter(Boolean),
          openingHours: branch.openingHours,
        };
      });
    }
  } catch (error) {
    console.error("[footer] showrooms unavailable, using built-in list", error);
  }

  return showrooms;
}

/**
 * Closes every page. Per DESIGN-bmw-m.md the footer never inverts and never
 * lifts off the canvas — it is the same black as the page floor, separated only
 * by the tricolour at its top edge and by hairlines between its rows.
 *
 * The legal links are a column of their own rather than a row of small print at
 * the bottom: on an FCA-facing trading site they are navigation, not a
 * postscript.
 */
export default async function Footer() {
  const branches = await footerShowrooms();
  const hasContactDetails =
    contact.phone || contact.email || contact.addressLines.length > 0;

  return (
    <footer className="relative bg-canvas">
      {/* Brand-identity moment: the one decorative element the system has, and
          the page's closing signature. */}
      <span aria-hidden className="m-stripe block h-1 w-full" />

      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8">
        {/* Six blocks now — Guides split out of Legal, and Showrooms arrived
            carrying two branches. Six tracks at 1280 crushes the two that hold
            full sentences, so they wrap into three columns over two rows
            instead, which stays legible from 1024 up. */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            {/* Larger than the header's. The footer has vertical room, and at
                this size the roundel's own "BurraqMotors Manchester" is
                readable rather than implied. */}
            <Link href="/" className="inline-block">
              <Logo markClassName="h-20" />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              {site.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="label-uppercase text-ink">Explore</h3>
            {/* gap-0, not gap-3: each row now carries its own 44px height,
                and keeping the gap on top would space the column out to twice
                the height it needs. */}
            <ul className="mt-4 flex flex-col">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Guides — reading matter, kept clear of the legal column. Also
              where Journal now lives, since the main nav is down to the six
              items the brief asked for. */}
          <div>
            <h3 className="label-uppercase text-ink">Guides</h3>
            <ul className="mt-4 flex flex-col">
              {guides.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="label-uppercase text-ink">Legal</h3>
            {/* gap-0, not gap-3: each row now carries its own 44px height,
                and keeping the gap on top would space the column out to twice
                the height it needs. */}
            <ul className="mt-4 flex flex-col">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/*
            Showrooms — both of them, each with the person who answers its
            phone. This footer used to publish one address and one number for a
            two-branch business, so a caller asking about a car standing in
            Ashton reached Bury about half the time.

            Addresses come from the CRM, which is where the dealership already
            maintains them, so a correction there reaches the site without a
            deploy. Every field is gated: a branch whose address has not been
            filled in yet still shows its name, contact and number rather than
            printing an empty block.
          */}
          <div>
            <h3 className="label-uppercase text-ink">Showrooms</h3>
            <ul className="mt-4 flex flex-col gap-5 text-sm text-muted">
              {branches.map((showroom) => (
                <li key={showroom.name}>
                  <p className="label-uppercase-sm text-ink">{showroom.name}</p>

                  {showroom.addressLines.length > 0 && (
                    <address className="mt-1.5 not-italic leading-relaxed">
                      {showroom.addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
                  )}

                  <a
                    href={`tel:${showroom.phoneHref}`}
                    className="mt-1 flex min-h-11 items-center gap-2.5 transition-colors hover:text-ink"
                  >
                    <Phone className="h-4 w-4 shrink-0 text-faint" />
                    <span>
                      {showroom.phone}
                      <span className="block text-xs text-faint">
                        {showroom.contactName}
                      </span>
                    </span>
                  </a>

                  <Link
                    href={`/cars?branch=${encodeURIComponent(showroom.slug)}`}
                    className="inline-flex min-h-11 items-center text-xs font-bold uppercase tracking-wider transition-colors hover:text-ink"
                  >
                    View stock
                  </Link>

                  {showroom.openingHours && (
                    <p className="caption mt-1 text-faint">
                      {showroom.openingHours}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="label-uppercase text-ink">Get in touch</h3>

            {hasContactDetails ? (
              <ul className="mt-4 flex flex-col gap-1 text-sm text-muted">
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex min-h-11 items-center gap-2.5 transition-colors hover:text-ink"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-faint" />
                      {contact.email}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p className="mt-6 text-sm text-muted">
                <Link href="/contact" className="link-m">
                  Send us a message →
                </Link>
              </p>
            )}
          </div>
        </div>

        {/*
          The regulatory notice gets a recessed strip with a machined label,
          rather than sitting as one more grey paragraph among several. It was
          previously indistinguishable from the copyright line beside it, which
          is the wrong outcome twice over: visually it read as filler, and this
          is FCA small print that regulators expect to be easy to find.

          `spec-cell` is the same recessed surface the stat panels use — one
          step off the canvas, hairline, no shadow.
        */}
        <div className="spec-cell mt-16 border border-line-soft p-6 sm:p-8">
          <h3 className="label-uppercase-sm text-faint">Finance disclaimer</h3>
          <p className="caption mt-3 max-w-4xl leading-relaxed text-muted">
            {financeDisclaimer} Burraq Motors is a credit broker, not a lender.
          </p>
        </div>

        {/* Bottom bar: copyright left, build credit right, stacking on a phone
            rather than squeezing onto one line. */}
        <div className="mt-8 flex flex-col gap-4 border-t border-line-soft pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="caption text-faint">
            © {year} {site.name}. All rights reserved.
          </p>

          {/*
            Set in the machined label voice so it reads as chrome rather than
            as another sentence.

            Phase 1 asked for this to be removed or made discreet, and discreet
            is the right end of that: the credit stays, but it stops competing.
            The link was the one thing down here painted in ink, which made the
            agency's name the highest-contrast text in the footer of the
            client's own site. It now resolves to the same faint token as the
            words around it and separates on hover instead. The heart went with
            it — a coloured emoji is not chrome, and it was the only thing in
            the footer not resolving through a token.
          */}
          <p className="label-uppercase-sm text-faint">
            Developed by{" "}
            <a
              href="https://webspires.co.uk?utm_source=burraqmotors"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-ink"
            >
              Webspires
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
