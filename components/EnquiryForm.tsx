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

const fieldClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink " +
  "placeholder:text-faint transition-colors focus:border-amber/50 focus:outline-none " +
  "focus:ring-2 focus:ring-amber/20 aria-[invalid=true]:border-red-500/60";

const labelClass = "block text-xs font-semibold tracking-wide text-muted";

/*
 * Error red is the one colour on this form with no token behind it. The pale
 * reds that lift an error off the dark canvas sit at roughly 1.4:1 on a white
 * card, so the light scheme needs a deep red instead. `light-dark()` reads the
 * `color-scheme` globals.css already sets per theme, which keeps the choice in
 * CSS — the component still has no idea which theme it is in.
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
    <form action={formAction} className="glass rounded-2xl p-6 sm:p-7">
      <h3 className="font-display text-xl font-semibold text-ink">{heading}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{intro}</p>

      {/* Context for the sales team — set by the page, not the customer. */}
      <input type="hidden" name="registration" value={registration} />

      {state.message && (
        <p
          role="alert"
          className={`mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm ${alertTextClass}`}
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
            className={`mt-2 ${fieldClass}`}
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
            className={`mt-2 ${fieldClass}`}
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
            className={`mt-2 ${fieldClass}`}
            placeholder="07700 900123"
          />
          <FieldError id={errorId("phone")} message={errors.phone} />
        </div>

        <div>
          <label className={labelClass} htmlFor={fieldId("message")}>
            Message <span className="font-normal text-faint">(optional)</span>
          </label>
          <textarea
            id={fieldId("message")}
            name="message"
            rows={4}
            maxLength={2000}
            defaultValue={state.values?.message}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? errorId("message") : undefined}
            className={`mt-2 resize-y ${fieldClass}`}
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
        className="mt-6 w-full rounded-full bg-amber px-6 py-3.5 font-semibold text-on-amber transition-all hover:bg-amber-bright hover:shadow-(--shadow-glow) disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {pending ? "Sending…" : "Send enquiry"}
      </button>

      <p className="mt-4 text-xs leading-relaxed text-faint">
        We&apos;ll only use your details to answer this enquiry. Read our{" "}
        <Link
          href="/privacy"
          className="underline decoration-line underline-offset-2 transition-colors hover:text-muted"
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
    <p id={id} role="alert" className={`mt-2 text-xs ${fieldErrorTextClass}`}>
      {message}
    </p>
  );
}
