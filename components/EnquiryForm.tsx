"use client";

import Link from "next/link";
import { useActionState, useId } from "react";
import { sendEnquiry } from "@/app/actions/enquiry";
import {
  initialEnquiryState,
  type EnquiryFormState,
} from "@/lib/enquiry-state";

interface EnquiryFormProps {
  /** The car this enquiry is about, passed to the CRM as context. */
  registration: string;
  /** Used to pre-fill the message so the customer starts from something. */
  vehicleHeadline: string;
}

const fieldClass =
  "w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-sm text-ink " +
  "placeholder:text-faint transition-colors focus:border-amber/50 focus:outline-none " +
  "focus:ring-2 focus:ring-amber/20 aria-[invalid=true]:border-red-500/60";

const labelClass = "block text-xs font-semibold tracking-wide text-muted";

export default function EnquiryForm({
  registration,
  vehicleHeadline,
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
      <h3 className="font-display text-xl font-semibold text-ink">
        Enquire about this car
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Send us a message and we&apos;ll come back to you with availability,
        finance options and anything else you need.
      </p>

      {/* Context for the sales team — set by the page, not the customer. */}
      <input type="hidden" name="registration" value={registration} />

      {state.message && (
        <p
          role="alert"
          className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
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
            placeholder={`I'm interested in the ${vehicleHeadline} — is it still available?`}
          />
          <FieldError id={errorId("message")} message={errors.message} />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-6 w-full rounded-full bg-amber px-6 py-3.5 font-semibold text-canvas transition-all hover:bg-amber-bright hover:shadow-[0_0_36px_-10px_var(--color-amber)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
    <p id={id} role="alert" className="mt-2 text-xs text-red-300">
      {message}
    </p>
  );
}
