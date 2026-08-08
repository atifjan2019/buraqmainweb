import Link from "next/link";
import { contact, financeDisclaimer, nav, site } from "@/lib/site";
import { Mail, Phone, Pin } from "./Icons";
import Logo from "./Logo";

const year = new Date().getFullYear();

const legal = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
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
            <Link href="/" className="inline-block">
              <Logo />
            </Link>

            <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
              {site.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="label-uppercase text-ink">Explore</h3>
            <ul className="mt-6 flex flex-col gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
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
            <ul className="mt-6 flex flex-col gap-3">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
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
              <ul className="mt-6 flex flex-col gap-3.5 text-sm text-muted">
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phoneHref}`}
                      className="flex items-center gap-2.5 transition-colors hover:text-ink"
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
                      className="flex items-center gap-2.5 transition-colors hover:text-ink"
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

        <div className="mt-16 border-t border-line-soft pt-8">
          <p className="caption max-w-3xl leading-relaxed text-faint">
            {financeDisclaimer} Burraq Motors is a credit broker, not a lender.
          </p>
          {/* Copyright left, build credit right — they stack on a phone rather
              than squeezing onto one line. */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="caption text-faint">
              © {year} {site.name}. All rights reserved.
            </p>

            <p className="caption text-faint">
              {/* The emoji carries its own colour, so this is the one bit of
                  the footer that doesn't resolve through a token. Labelled
                  because a bare ❤️ is announced as "red heart" by screen
                  readers, which reads as noise mid-sentence. */}
              Developed in{" "}
              <span role="img" aria-label="love">
                ❤️
              </span>{" "}
              By{" "}
              <a
                href="https://webspires.co.uk?utm_source=burraqmotors"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-ink transition-opacity hover:opacity-70"
              >
                Webspires
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
