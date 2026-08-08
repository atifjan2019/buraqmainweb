"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { sendEnquiry } from "@/app/actions/enquiry";
import {
  initialEnquiryState,
  type EnquiryFormState,
} from "@/lib/enquiry-state";

interface EnquiryFormProps {
  /**
   * The car this enquiry is about, passed to the CRM as context. Omitted on
   * the contact page, where the enquiry isn't about any particular car — the
   * Server Action treats a blank registration as a general lead and skips the
   * vehicle lookup entirely.
   */
  registration?: string;
  /** Used to pre-fill the message so the customer starts from something. */
  vehicleHeadline?: string;
  /** Overrides for the general form, which is not asking about a car. */
  heading?: string;
  intro?: string;
}

/*
 * `.field` and `.label-uppercase` carry the whole control now — 48px tall,
 * square, hairline border that thickens to ink on focus, which is the only
 * input state DESIGN-bmw-m.md documents. The focus ring is gone with them: the
 * border IS the focus state here, and a second glowing ring outside it was the
 * consumer-tech treatment the system backs away from.
 */
const labelClass = "label-uppercase block text-ink";

/*
 * Error red is the one colour on this form with no token behind it, and it
 * deliberately isn't the M red: the tricolour is identity-only, and reusing one
 * of its stops as a validation state would make the brand mark mean "you typed
 * something wrong". The deep red reads at 5.9:1 on white; the pale one lifts
 * off the black canvas where the deep one would disappear. `light-dark()` reads
 * the `color-scheme` globals.css already sets per theme, which keeps the choice
 * in CSS — the component still has no idea which theme it is in.
 */
const alertTextClass = "text-[color:light-dark(#b91c1c,#fecaca)]";
const fieldErrorTextClass = "text-[color:light-dark(#b91c1c,#fca5a5)]";

export default function EnquiryForm({
  registration = "",
  vehicleHeadline,
  heading = "Enquire about this car",
  intro = "Send us a message and we'll come back to you with availability, finance options and anything else you need.",
}: EnquiryFormProps) {
  const [state, formAction, pending] = useActionState<
    EnquiryFormState,
    FormData
  >(sendEnquiry, initialEnquiryState);

  const ids = useId();
  const fieldId = (name: string) => `${ids}-${name}`;
  const errorId = (name: string) => `${ids}-${name}-error`;
  const errors = state.fieldErrors ?? {};

  /*
   * There is no success branch here: a successful submission redirects to
   * /thank-you from the Server Action, so this component only ever renders the
   * form or its errors.
   */
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
          <label className={labelClass} htmlFor={fieldId("message")}>
            Message <span className="text-faint">(optional)</span>
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={4}
            maxLength={2000}
            defaultValue={state.values?.message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? errorId("message") : undefined}
            className="field mt-3 resize-y"
            placeholder={
              vehicleHeadline
                ? `I'm interested in the ${vehicleHeadline} — is it still available?`
                : "Tell us what you're looking for — make, budget, part-exchange, or anything else."
            }
          />
          <FieldError id={errorId("message")} message={errors.message} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="btn btn-solid mt-8 w-full"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>

      <p className="caption mt-5 leading-relaxed text-faint">
        We&apos;ll only use your details to answer this enquiry. Read our{" "}
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

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className={`caption mt-2 ${fieldErrorTextClass}`}>
      {message}
    </p>
  );
}
