"use server";

/**
 * Server Action behind the booking form.
 *
 * Runs on the server so the CRM API key stays out of the browser — the form
 * component never sees it and never talks to the CRM directly.
 *
 * Unlike the enquiry action this does NOT redirect on success. An enquiry is
 * finished when it is sent; a booking is not confirmed until somebody rings the
 * customer, and that distinction has to survive into the UI. Sending them to a
 * page headed "thank you" invites them to read the slot as booked.
 */

import { checkSlot, SLOT_MESSAGES, toLocalIso, BOOKING_TYPES } from "@/lib/booking";
import type { BookingFormState } from "@/lib/booking-state";
import { submitBooking, type BookingType } from "@/lib/crm";

/*
 * Nothing but `requestBooking` may be exported from this file — see
 * lib/booking-state.ts for why.
 */

/** Mirrors the API's own limits so obvious mistakes never cost a round trip. */
const LIMITS = { name: 255, email: 255, phone: 50, notes: 2000 } as const;

function text(formData: FormData, field: string): string {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

export async function requestBooking(
  _previous: BookingFormState,
  formData: FormData,
): Promise<BookingFormState> {
  const values = {
    name: text(formData, "name"),
    email: text(formData, "email"),
    phone: text(formData, "phone"),
    type: text(formData, "type"),
    date: text(formData, "date"),
    time: text(formData, "time"),
    notes: text(formData, "notes"),
  };

  // Comes from the page, not the customer, so it is never echoed back into the
  // form or shown as a field error.
  const registration = text(formData, "registration");

  const fieldErrors: Record<string, string> = {};

  if (!values.name) {
    fieldErrors.name = "Please tell us your name.";
  } else if (values.name.length > LIMITS.name) {
    fieldErrors.name = `Please keep your name under ${LIMITS.name} characters.`;
  }

  if (!values.email) {
    fieldErrors.email = "We need an email address to confirm to.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    fieldErrors.email = "That doesn't look like a valid email address.";
  }

  /*
   * Required here, where an enquiry treats it as optional. Confirming a booking
   * means ringing the customer back, so a booking with no number cannot be
   * confirmed at all. The digit count is deliberately loose: UK numbers get
   * typed with spaces, +44 and leading zeros, and turning away a real customer
   * costs far more than accepting an odd format.
   */
  const phoneDigits = values.phone.replace(/\D/g, "");

  if (!values.phone) {
    fieldErrors.phone = "We need a number to confirm your booking on.";
  } else if (values.phone.length > LIMITS.phone) {
    fieldErrors.phone = `Please keep your number under ${LIMITS.phone} characters.`;
  } else if (phoneDigits.length < 7) {
    fieldErrors.phone = "That doesn't look like a complete phone number.";
  }

  const isKnownType = BOOKING_TYPES.some((t) => t.value === values.type);
  if (!values.type) {
    fieldErrors.type = "Please choose what you'd like to book.";
  } else if (!isKnownType) {
    // Only reachable by tampering; the field is a radio group.
    fieldErrors.type = "Please choose one of the options listed.";
  }

  if (!values.date) fieldErrors.date = "Please choose a day.";
  if (!values.time) fieldErrors.time = "Please choose a time.";

  if (values.notes.length > LIMITS.notes) {
    fieldErrors.notes = `Please keep your note under ${LIMITS.notes} characters.`;
  }

  // Only worth checking the slot once there is a date AND a time to check.
  let appointmentDate = "";
  if (values.date && values.time) {
    const { when, problem } = checkSlot(values.date, values.time);
    if (problem) {
      // Attached to whichever field the customer can actually act on: a closed
      // day or a date out of range is the date's fault, the rest is the time's.
      const field =
        problem === "closed_day" || problem === "too_far" ? "date" : "time";
      fieldErrors[field] = SLOT_MESSAGES[problem];
    } else {
      appointmentDate = toLocalIso(when);
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  const outcome = await submitBooking({
    name: values.name,
    email: values.email,
    phone: values.phone,
    type: values.type as BookingType,
    appointmentDate,
    registration,
    notes: values.notes,
  });

  if (outcome.status === "sent") {
    return {
      status: "sent",
      confirmation: {
        reference: outcome.reference,
        appointmentDate: outcome.appointmentDate,
        name: values.name,
      },
    };
  }

  switch (outcome.status) {
    case "invalid":
      return {
        status: "error",
        /*
         * The CRM names two fields differently from this form: it validates one
         * `appointment_date` where the form has a separate date and time, and
         * `name`/`email`/`phone` line up as-is. Without this mapping a slot the
         * CRM rejects produces an error attached to nothing, and the form looks
         * like it failed for no reason.
         */
        fieldErrors: Object.fromEntries(
          Object.entries(outcome.fieldErrors).map(([field, message]) => [
            field === "appointment_date" ? "time" : field,
            message,
          ]),
        ),
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
          "We've had a lot of bookings in the last minute. Please try again shortly.",
        values,
      };

    case "unavailable":
    case "failed":
      return {
        status: "error",
        message:
          "Sorry — we couldn't send your booking just now. Please try again, " +
          "or call us and we'll get you in the diary straight away.",
        values,
      };
  }
}
