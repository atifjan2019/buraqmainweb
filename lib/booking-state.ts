/**
 * Shape of the booking form's action state.
 *
 * Lives outside `app/actions/booking.ts` for the same reason the enquiry
 * equivalent does: a `"use server"` module may export ONLY async functions.
 * A single non-function export — such as the plain object below — throws
 * `A "use server" file can only export async functions, found object.`
 * when the module is evaluated to service an action call.
 *
 * `next build` does not catch it, so the failure would only appear on the first
 * real submission: the POST 500s before the action runs and the booking is
 * lost. Keeping the constant here means the action file exports nothing but the
 * function itself.
 */
export interface BookingFormState {
  status: "idle" | "error" | "sent";
  /** Form-level message, for problems that aren't tied to one field. */
  message?: string;
  /** Keyed by input name, so each field renders its own error. */
  fieldErrors?: Record<string, string>;
  /** Shown on success — the CRM reference and the slot that was requested. */
  confirmation?: {
    reference: string;
    /** ISO 8601, local. Formatted for display by the component. */
    appointmentDate: string;
    name: string;
  };
  /**
   * Echoed back so a rejected submission doesn't wipe what was typed —
   * React resets an uncontrolled form once the action resolves.
   */
  values?: {
    name: string;
    email: string;
    phone: string;
    type: string;
    date: string;
    time: string;
    notes: string;
  };
}

export const initialBookingState: BookingFormState = { status: "idle" };
