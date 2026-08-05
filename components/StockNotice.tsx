import Link from "next/link";
import { contact, whatsappLink } from "@/lib/site";
import { Car, Phone, WhatsApp } from "./Icons";

interface StockNoticeProps {
  title: string;
  body: string;
  /** Optional link back into the stock list. */
  action?: { label: string; href: string };
}

/**
 * Shared empty / unavailable state for the stock pages — no results, a sold
 * car, or the CRM being unreachable. Each of those is a dead end for the
 * visitor, so every one of them offers a way to reach a human instead.
 */
export default function StockNotice({ title, body, action }: StockNoticeProps) {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  return (
    <div className="glass mx-auto max-w-xl rounded-2xl px-6 py-14 text-center sm:px-10">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-surface-2">
        <Car className="h-7 w-7 text-amber/70" strokeWidth={1.5} />
      </span>

      <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
        {title}
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
        {body}
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        {action && (
          <Link
            href={action.href}
            className="inline-flex items-center justify-center rounded-full bg-amber px-6 py-3 text-sm font-semibold text-on-amber transition-colors hover:bg-amber-bright"
          >
            {action.label}
          </Link>
        )}

        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
          >
            <WhatsApp className="h-4.5 w-4.5" />
            WhatsApp us
          </a>
        ) : (
          <a
            href={`tel:${contact.phoneHref}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
          >
            <Phone className="h-4.5 w-4.5" />
            {contact.phone}
          </a>
        )}
      </div>
    </div>
  );
}
