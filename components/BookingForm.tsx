"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { requestBooking } from "@/app/actions/booking";
import {
  BOOKING_TYPES,
  dateBounds,
  formatSlot,
  slotTimes,
} from "@/lib/booking";
import {
  initialBookingState,
  type BookingFormState,
} from "@/lib/booking-state";

interface BookingFormProps {
  /**
   * The car being booked against, passed to the CRM as context. Omitted on the
   * standalone booking page, where the customer has not picked a car yet — the
   * Server Action treats a blank registration as a general booking and skips
   * the vehicle lookup.
   */
  registration?: string;
  vehicleHeadline?: string;
  heading?: string;
  intro?: string;
  /** Preselects the radio group when the entry point implies the answer. */
  defaultType?: string;
}

const labelClass = "label-uppercase block text-ink";

/*
 * Same reasoning as EnquiryForm: error red is the one colour on this form with
 * no token behind it, and deliberately not the M red — the tricolour is
 * identity-only, and reusing a stop of it as a validation state would make the
 * brand mark mean "you typed something wrong".
 */
const alertTextClass = "text-[color:light-dark(#b91c1c,#fecaca)]";
const fieldErrorTextClass = "text-[color:light-dark(#b91c1c,#fca5a5)]";

export default function BookingForm({
  registration = "",
  vehicleHeadline,
  heading = "Book a test drive",
  intro = "Pick a day and a time that suits you. We'll call to confirm before you travel.",
  defaultType = "test_drive",
}: BookingFormProps) {
  const [state, formAction, pending] = useActionState<
    BookingFormState,
    FormData
  >(requestBooking, initialBookingState);

  const ids = useId();
  const fieldId = (name: string) => `${ids}-${name}`;
  const errorId = (name: string) => `${ids}-${name}-error`;
  const errors = state.fieldErrors ?? {};

  /*
   * Computed at render on the client, so it follows the visitor's own clock
   * rather than the server's. The bounds are a courtesy on the input; the CRM
   * re-checks the slot regardless.
   */
  const { min, max } = dateBounds();

  /*
   * A success STATE, not a redirect to /thank-you — which is what the enquiry
   * form does. The difference is the point: an enquiry is finished when it
   * sends, whereas this is a request nobody has agreed to yet, and a page
   * headed "thank you" would invite the customer to read the slot as booked and
   * drive to Bury on the strength of it.
   */
  if (state.status === "sent" && state.confirmation) {
    return (
      <div className="surface-card p-6 sm:p-8">
        <h3 className="title-lg text-ink">Request received</h3>

        <p className="mt-4 text-sm font-light leading-relaxed text-muted">
          Thanks {state.confirmation.name} — we have your request for{" "}
          <strong className="font-normal text-ink">
            {formatWhen(state.confirmation.appointmentDate)}
          </strong>
          .
        </p>

        {/* The single most important sentence on this screen. */}
        <p className="mt-4 text-sm font-light leading-relaxed text-muted">
          It is not confirmed yet. Someone will call you to check the car is
          ready and the time still works, usually the same working day. Please
          wait for that call before travelling.
        </p>

        {state.confirmation.reference && (
          <dl className="mt-8 border-t border-line-soft pt-6">
            <dt className="label-uppercase-sm text-faint">Your reference</dt>
            <dd className="display-sm mt-2 text-ink">
              {state.confirmation.reference}
            </dd>
          </dl>
        )}

        <div className="mt-8 flex flex-wrap gap-4">
          <Link href="/cars" className="btn btn-outline">
            Keep browsing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="surface-card p-6 sm:p-8">
      <h3 className="title-lg text-ink">{heading}</h3>
      <p className="mt-3 text-sm font-light leading-relaxed text-muted">
        {intro}
      </p>

      {/* Context for the sales team — set by the page, not the customer. */}
      <input type="hidden" name="registration" value={registration} />

      {state.message && (
        <p
          role="alert"
          className={`mt-6 border border-current/40 px-4 py-3 text-sm font-light ${alertTextClass}`}
        >
          {state.message}
        </p>
      )}

      {/* What they want. A radio group rather than a select: there are three
          options, each needs a line of explanation, and a select hides both the
          choices and their hints behind a tap. */}
      <fieldset className="mt-8">
        <legend className={labelClass}>What would you like to book?</legend>

        <div className="mt-3 grid gap-px border border-line bg-line sm:grid-cols-3">
          {BOOKING_TYPES.map((option) => (
            <label
              key={option.value}
              className="group flex cursor-pointer flex-col bg-canvas p-4 transition-colors
                         has-[:checked]:bg-ink has-[:checked]:text-on-ink"
            >
              <input
                type="radio"
                name="type"
                value={option.value}
                defaultChecked={
                  (state.values?.type ?? defaultType) === option.value
                }
                className="sr-only"
              />
              <span className="label-uppercase-sm">{option.label}</span>
              <span className="mt-2 text-xs font-light leading-relaxed text-muted group-has-[:checked]:text-on-ink/70">
                {option.hint}
              </span>
            </label>
          ))}
        </div>

        <FieldError id={errorId("type")} message={errors.type} />
      </fieldset>

      {/* When. */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor={fieldId("date")}>
            Day
          </label>
          <input
            id={fieldId("date")}
            name="date"
            type="date"
            required
            min={min}
            max={max}
            defaultValue={state.values?.date}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? errorId("date") : undefined}
            className="field mt-3"
          />
          <FieldError id={errorId("date")} message={errors.date} />
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldId("time")}>
            Time
          </label>
          {/* A select of whole hours rather than a free time input. The showroom
              works in slots, and a time input invites 14:37. */}
          <select
            id={fieldId("time")}
            name="time"
            required
            defaultValue={state.values?.time ?? ""}
            aria-invalid={Boolean(errors.time)}
            aria-describedby={errors.time ? errorId("time") : undefined}
            className="field mt-3"
          >
            <option value="" disabled>
              Choose a time
            </option>
            {slotTimes().map((time) => (
              <option key={time} value={time}>
                {formatSlot(time)}
              </option>
            ))}
          </select>
          <FieldError id={errorId("time")} message={errors.time} />
        </div>
      </div>

      {/* Who. */}
      <div className="mt-6 space-y-4">
        <div>
          <label className={labelClass} htmlFor={fieldId("name")}>
            Your name
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            required
            maxLength={255}
            autoComplete="name"
            defaultValue={state.values?.name}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errorId("name") : undefined}
            className="field mt-3"
            placeholder="Jane Buyer"
          />
          <FieldError id={errorId("name")} message={errors.name} />
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldId("email")}>
            Email
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            required
            maxLength={255}
            autoComplete="email"
            defaultValue={state.values?.email}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
            className="field mt-3"
            placeholder="jane@example.com"
          />
          <FieldError id={errorId("email")} message={errors.email} />
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldId("phone")}>
            Phone
          </label>
          <input
            id={fieldId("phone")}
            name="phone"
            type="tel"
            required
            maxLength={50}
            autoComplete="tel"
            defaultValue={state.values?.phone}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
            className="field mt-3"
            placeholder="07700 900123"
          />
          <FieldError id={errorId("phone")} message={errors.phone} />
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldId("notes")}>
            Anything we should know? <span className="text-faint">(optional)</span>
          </label>
          <textarea
            id={fieldId("notes")}
            name="notes"
            rows={3}
            maxLength={2000}
            defaultValue={state.values?.notes}
            aria-invalid={Boolean(errors.notes)}
            aria-describedby={errors.notes ? errorId("notes") : undefined}
            className="field mt-3 resize-y"
            placeholder={
              vehicleHeadline
                ? `I'd like to drive the ${vehicleHeadline}.`
                : "Which car you'd like to see, whether you have a part-exchange, anything else."
            }
          />
          <FieldError id={errorId("notes")} message={errors.notes} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-solid mt-8 w-full"
      >
        {pending ? "Sending…" : "Request this appointment"}
      </button>

      {/* Said before they submit as well as after. The button above says
          "request" for the same reason: nothing on this page can promise a slot,
          because no one has agreed to it yet. */}
      <p className="caption mt-5 leading-relaxed text-faint">
        We&apos;ll call to confirm before you travel. Your details are only used
        to arrange this appointment — read our{" "}
        <Link
          href="/privacy"
          className="underline decoration-line underline-offset-2 transition-colors hover:text-ink"
        >
          privacy policy
        </Link>
        .
      </p>
    </form>
  );
}

/**
 * "2026-09-03T11:00:00" → "Thursday 3 September, 11:00am".
 *
 * Parsed by hand rather than with `new Date(string)`: the CRM returns the slot
 * as a local wall-clock time, and letting the browser guess at the timezone is
 * how a customer gets told to arrive an hour out.
 */
function formatWhen(iso: string): string {
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return iso;

  const [, y, mo, d, h, mi] = match;
  const when = new Date(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi));

  const day = when.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return `${day}, ${formatSlot(`${h}:${mi}`)}`;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className={`caption mt-2 ${fieldErrorTextClass}`}>
      {message}
    </p>
  );
}
