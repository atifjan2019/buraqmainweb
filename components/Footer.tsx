import Link from "next/link";
import { contact, financeDisclaimer, nav, site } from "@/lib/site";
import { Mail, Phone, Pin } from "./Icons";

const year = new Date().getFullYear();

export default function Footer() {
  const hasContactDetails =
    contact.phone || contact.email || contact.addressLines.length > 0;

  return (
    <footer className="relative border-t border-line-soft bg-canvas-deep">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-linear-to-br from-amber-bright to-amber-dim font-display text-lg font-bold text-canvas">
                B
              </span>
              <span className="flex flex-col leading-none">
                <span className="font-display text-base font-semibold tracking-tight text-ink">
                  BURRAQ
                </span>
                <span className="text-[0.62rem] font-medium tracking-[0.32em] text-amber">
                  MOTORS
                </span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">
              {site.description}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-ink">
              Explore
            </h3>
            <ul className="mt-5 flex flex-col gap-3">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted transition-colors hover:text-amber"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-ink">
              Get in touch
            </h3>

            {hasContactDetails ? (
              <ul className="mt-5 flex flex-col gap-3.5 text-sm text-muted">
                {contact.phone && (
                  <li>
                    <a
                      href={`tel:${contact.phoneHref}`}
                      className="flex items-center gap-2.5 transition-colors hover:text-amber"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-amber/70" />
                      {contact.phone}
                    </a>
                  </li>
                )}
                {contact.email && (
                  <li>
                    <a
                      href={`mailto:${contact.email}`}
                      className="flex items-center gap-2.5 transition-colors hover:text-amber"
                    >
                      <Mail className="h-4 w-4 shrink-0 text-amber/70" />
                      {contact.email}
                    </a>
                  </li>
                )}
                {contact.addressLines.length > 0 && (
                  <li className="flex items-start gap-2.5">
                    <Pin className="mt-0.5 h-4 w-4 shrink-0 text-amber/70" />
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
              <p className="mt-5 text-sm text-muted">
                <Link
                  href="/contact"
                  className="transition-colors hover:text-amber"
                >
                  Send us a message →
                </Link>
              </p>
            )}
          </div>
        </div>

        <div className="mt-14 border-t border-line-soft pt-8">
          <p className="text-xs leading-relaxed text-faint">
            {financeDisclaimer} Burraq Motors is a credit broker, not a lender.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-faint">
              © {year} {site.name}. All rights reserved.
            </p>
            <div className="flex gap-5 text-xs text-faint">
              <Link href="/privacy" className="transition-colors hover:text-muted">
                Privacy Policy
              </Link>
              <Link href="/terms" className="transition-colors hover:text-muted">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
