/**
 * Shape of the enquiry form's action state.
 *
 * This deliberately lives outside `app/actions/enquiry.ts`. A `"use server"`
 * module may export *only* async functions — Next validates that at runtime via
 * `ensureServerEntryExports`, and a single non-function export (such as the
 * plain object below) throws
 * `A "use server" file can only export async functions, found object.`
 * when the module is evaluated to service an action call.
 *
 * `next build` does not catch it, so the failure only appears on the first real
 * submission: the POST 500s before `sendEnquiry` runs and the lead is lost.
 * Keeping the constant here means the action file exports nothing but the
 * function itself.
 */
/**
 * There is no "sent" state: a successful submission redirects to /thank-you
 * from the Server Action, so the form only ever holds its idle or error state.
 * The CRM reference travels in the receipt cookie instead — see
 * `lib/enquiry-receipt.ts`.
 */
export interface EnquiryFormState {
  status: "idle" | "error";
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
