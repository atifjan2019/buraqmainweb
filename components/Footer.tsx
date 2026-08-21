import Link from "next/link";
import { contact, financeDisclaimer, nav, site } from "@/lib/site";
import { Mail, Phone, Pin } from "./Icons";
import Logo from "./Logo";

const year = new Date().getFullYear();

const legal = [
  { label: "Auction Sheets", href: "/auction-sheets" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Cookies", href: "/cookies" },
];

/**
 * Closes every page. Per DESIGN-bmw-m.md the footer never inverts and never
 * lifts off the canvas — it is the same black as the page floor, separated only
 * by the tricolour at its top edge and by hairlines between its rows.
 *
 * Four columns at desktop, which is the structure the doc specifies. The legal
 * links are a column of their own rather than a row of small print at the
 * bottom: on an FCA-facing trading site they are navigation, not a postscript.
 */
export default function Footer() {
  const hasContactDetails =
    contact.phone || contact.email || contact.addressLines.length > 0;

  return (
    <footer className="relative bg-canvas">
      {/* Brand-identity moment: the one decorative element the system has, and
          the page's closing signature. */}
      <span aria-hidden className="m-stripe block h-1 w-full" />

      <div className="mx-auto max-w-[90rem] px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
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

          {/* Contact */}
          <div>
            <h3 className="label-uppercase text-ink">Get in touch</h3>

            {hasContactDetails ? (
              <ul className="mt-4 flex flex-col gap-1 text-sm text-muted">
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phoneHref}`}
                      className="flex min-h-11 items-center gap-2.5 transition-colors hover:text-ink"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-faint" />
                      {contact.phone}
                    </a>
                  </li>
                )}
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
                {contact.addressLines.length > 0 && (
                  <li className="flex items-start gap-2.5">
                    <Pin className="mt-0.5 h-4 w-4 shrink-0 text-faint" />
                    <address className="not-italic leading-relaxed">
                      {contact.addressLines.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
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
            as another sentence. That makes the whole line 700, so bolding
            "Webspires" would no longer distinguish it — the emphasis moves to
            colour instead, which is how this system separates things anyway:
            it has no accent hue, only ink against muted.
          */}
          <p className="label-uppercase-sm flex items-center gap-2 text-faint">
            Developed with
            {/* The emoji carries its own colour, so it is the one thing in the
                footer that doesn't resolve through a token. Labelled, because
                a bare ❤️ is announced as "red heart" by screen readers and
                that reads as noise mid-sentence. */}
            <span role="img" aria-label="love" className="text-sm">
              ❤️
            </span>
            by
            <a
              href="https://webspires.co.uk?utm_source=burraqmotors"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink transition-opacity hover:opacity-70"
            >
              Webspires
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
