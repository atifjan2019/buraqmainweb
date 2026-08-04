"use server";

/**
 * Server Action behind the enquiry form.
 *
 * This is the only path from the site into the dealership's sales pipeline.
 * It runs on the server so the CRM API key stays out of the browser — the form
 * component itself never sees it, and never talks to the CRM directly.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getVehicle, submitEnquiry } from "@/lib/crm";
import {
  ENQUIRY_RECEIPT_COOKIE,
  ENQUIRY_RECEIPT_MAX_AGE,
  encodeReceipt,
} from "@/lib/enquiry-receipt";
import type { EnquiryFormState } from "@/lib/enquiry-state";
import { vehicleHeadline } from "@/lib/vehicles";

/*
 * Nothing but `sendEnquiry` may be exported from this file. A `"use server"`
 * module can only export async functions; any other export throws at runtime
 * the first time an action is invoked, which `next build` will not catch.
 * The state type and its initial value live in `lib/enquiry-state.ts`.
 */

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

  /*
   * The CRM treats phone as optional; requiring it is this site's own rule, so
   * it is enforced here as well as in the markup — an HTML `required` attribute
   * is trivially bypassed. The digit count is deliberately loose: UK numbers get
   * typed with spaces, +44, and leading zeros, and rejecting a real customer's
   * number is far more costly than accepting an odd format.
   */
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.phone) {
    fieldErrors.phone = "Please give us a phone number so we can call you back.";
  } else if (values.phone.length > LIMITS.phone) {
    fieldErrors.phone = `Please keep your number under ${LIMITS.phone} characters.`;
  } else if (phoneDigits.length < 7) {
    fieldErrors.phone = "That doesn't look like a complete phone number.";
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

  if (outcome.status === "sent") {
    /*
     * Look up the car purely to personalise the thank-you page. The lead is
     * already in the CRM at this point, so this must never be able to turn a
     * successful submission into an error — hence the catch and the blank
     * fallback. The read is normally free: the visitor just loaded this car's
     * page, so the response is still in the 2-minute data cache.
     */
    let vehicle = "";
    let slug = "";

    if (registration) {
      try {
        const found = await getVehicle(registration);
        if (found) {
          vehicle = vehicleHeadline(found);
          slug = found.slug;
        }
      } catch (error) {
        console.error("[enquiry] could not resolve vehicle for receipt", error);
      }
    }

    const store = await cookies();
    store.set(
      ENQUIRY_RECEIPT_COOKIE,
      encodeReceipt({
        name: values.name,
        reference: outcome.reference,
        vehicle,
        slug,
      }),
      {
        httpOnly: true,
        sameSite: "lax", // survives the redirect; not needed cross-site
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: ENQUIRY_RECEIPT_MAX_AGE,
      },
    );

    // Throws to unwind, so it sits outside every try/catch above.
    redirect("/thank-you");
  }

  switch (outcome.status) {
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
