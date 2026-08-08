import Link from "next/link";
import { contact, whatsappLink } from "@/lib/site";
import { Phone, WhatsApp } from "./Icons";

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
 *
 * The car-in-a-circle icon is gone: DESIGN-bmw-m.md has no icon-in-a-ring
 * shape, and an empty state is one of the places a system like this stays
 * quietest. The tricolour marks it instead, which is a brand-identity moment
 * rather than decoration.
 */
export default function StockNotice({ title, body, action }: StockNoticeProps) {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  return (
    <div className="surface-card mx-auto max-w-2xl px-6 py-14 text-center sm:px-12">
      <span aria-hidden className="m-stripe mx-auto block h-1 w-16" />

      <h2 className="display-sm mt-8 text-ink">{title}</h2>

      <p className="mx-auto mt-5 max-w-md text-sm font-light leading-relaxed text-muted">
        {body}
      </p>

      <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
        {action && (
          <Link href={action.href} className="btn btn-solid">
            {action.label}
          </Link>
        )}

        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            <WhatsApp className="h-4.5 w-4.5" />
            WhatsApp us
          </a>
        ) : (
          <a href={`tel:${contact.phoneHref}`} className="btn btn-outline">
            <Phone className="h-4.5 w-4.5" />
            {contact.phone}
          </a>
        )}
      </div>
    </div>
  );
}
