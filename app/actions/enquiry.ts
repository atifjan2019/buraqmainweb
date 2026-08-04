"use server";

/**
 * Server Action behind the enquiry form.
 *
 * This is the only path from the site into the dealership's sales pipeline.
 * It runs on the server so the CRM API key stays out of the browser — the form
 * component itself never sees it, and never talks to the CRM directly.
 */

import { submitEnquiry } from "@/lib/crm";

export interface EnquiryFormState {
  status: "idle" | "sent" | "error";
  /** CRM reference (e.g. "ENQ-00042"), shown back to the customer on success. */
  reference?: string;
  /** Form-level message, for problems that aren't tied to one field. */
  message?: string;
  /** Keyed by input name, so each field can render its own error. */
  fieldErrors?: Record<string, string>;
  /**
   * Echoed back so a rejected submission doesn't wipe what was typed —
   * React resets an uncontrolled form once the action resolves.
   */
  values?: {
    name: string;
    email: string;
    phone: string;
    message: string;
  };
}

export const initialEnquiryState: EnquiryFormState = { status: "idle" };

/** Mirrors the API's own limits so obvious mistakes never cost a round trip. */
const LIMITS = { name: 255, phone: 50, message: 2000 } as const;

function text(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function sendEnquiry(
  _previous: EnquiryFormState,
  formData: FormData,
): Promise<EnquiryFormState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    message: text(formData, "message"),
  };

  // The registration comes from the page, not the customer, so it is never
  // echoed back into the form or shown as a field error.
  const registration = text(formData, "registration");

  const fieldErrors: Record<string, string> = {};

  if (!values.name) {
    fieldErrors.name = "Please tell us your name.";
  } else if (values.name.length > LIMITS.name) {
    fieldErrors.name = `Please keep your name under ${LIMITS.name} characters.`;
  }

  if (!values.email) {
    fieldErrors.email = "We need an email address to reply to.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    fieldErrors.email = "That doesn't look like a valid email address.";
  }

  if (values.phone.length > LIMITS.phone) {
    fieldErrors.phone = `Please keep your number under ${LIMITS.phone} characters.`;
  }

  if (values.message.length > LIMITS.message) {
    fieldErrors.message = `Please keep your message under ${LIMITS.message} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  const outcome = await submitEnquiry({
    name: values.name,
    email: values.email,
    phone: values.phone,
    registration,
    message: values.message,
  });

  switch (outcome.status) {
    case "sent":
      return { status: "sent", reference: outcome.reference };

    case "invalid":
      return {
        status: "error",
        // The CRM validates the same field names the form uses, so its
        // messages drop straight back onto the inputs.
        fieldErrors: outcome.fieldErrors,
        message:
          Object.keys(outcome.fieldErrors).length > 0
            ? undefined
            : "Please check your details and try again.",
        values,
      };

    case "rate_limited":
      return {
        status: "error",
        message:
          "We've had a lot of enquiries in the last minute. Please try again shortly.",
        values,
      };

    case "unavailable":
    case "failed":
      return {
        status: "error",
        message:
          "Sorry — we couldn't send your enquiry just now. Please try again, " +
          "or call us and we'll pick it up straight away.",
        values,
      };
  }
}
