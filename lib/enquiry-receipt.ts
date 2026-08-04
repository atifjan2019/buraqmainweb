/**
 * Carries the details of a just-submitted enquiry from the Server Action to
 * the thank-you page.
 *
 * A short-lived httpOnly cookie rather than query parameters: the customer's
 * name and enquiry reference would otherwise sit in the URL, where they reach
 * browser history, server access logs, analytics, and the `Referer` header sent
 * to every third-party script the page loads. None of those should hold a
 * lead's personal details.
 *
 * Only ever read on the server — the page renders from it during SSR, so the
 * value never needs to be readable by client JavaScript.
 */

export const ENQUIRY_RECEIPT_COOKIE = "burraq_enquiry";

/** Long enough to survive a refresh or a slow redirect, short enough to forget. */
export const ENQUIRY_RECEIPT_MAX_AGE = 15 * 60;

export interface EnquiryReceipt {
  /** As the customer typed it, used for the greeting. */
  name: string;
  /** CRM reference, e.g. "ENQ-00042". May be empty if the CRM omitted one. */
  reference: string;
  /** e.g. "2023 MG MG4 EV SE Long Range" — blank for a general enquiry. */
  vehicle: string;
  /** Canonical slug, so we can link back to the car. Blank if unknown. */
  slug: string;
}

/*
 * base64url keeps the JSON free of the delimiters cookie serialisation cares
 * about, whatever punctuation happens to be in someone's name.
 */
export function encodeReceipt(receipt: EnquiryReceipt): string {
  return Buffer.from(JSON.stringify(receipt), "utf8").toString("base64url");
}

/** Returns null for anything malformed, expired or hand-crafted. */
export function decodeReceipt(value: string | undefined): EnquiryReceipt | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(value, "base64url").toString("utf8"),
    );

    if (!parsed || typeof parsed !== "object") return null;
    const candidate = parsed as Record<string, unknown>;

    // The cookie is httpOnly but still client-held, so treat every field as
    // untrusted text. It is only ever echoed back to the person who sent it.
    return {
      name: asText(candidate.name, 255),
      reference: asText(candidate.reference, 40),
      vehicle: asText(candidate.vehicle, 160),
      slug: asText(candidate.slug, 160),
    };
  } catch {
    return null;
  }
}

function asText(value: unknown, maxLength: number): string {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

/** "Jane Buyer" → "Jane", for a greeting that doesn't read like a database row. */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] ?? "";
}
