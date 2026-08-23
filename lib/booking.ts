/**
 * Booking rules, shared by the form and the Server Action.
 *
 * THESE ARE A COURTESY, NOT A GUARD. Every rule here is also enforced by the
 * CRM in App\Http\Controllers\Api\AppointmentController, which is the only
 * place any of it is real — a caller holding the API key never runs this file.
 * What these do is stop a customer filling in a form only to have it bounced,
 * which is a worse experience than not offering the slot in the first place.
 *
 * They are duplicated from the CRM knowingly. The two live either side of an
 * HTTP boundary and neither can read the other; if the showroom's hours change,
 * both move. Serving the hours from the CRM would fix that and is worth doing
 * before a third thing depends on them.
 */

import type { BookingType } from "./crm";

/** First bookable hour. */
export const OPENS_AT = 9;

/**
 * Last bookable START, not closing time. The showroom shuts at 18:00 and a test
 * drive is not instant, so the last slot begins at 17:00.
 */
export const LAST_SLOT = 17;

/** Sunday, as JS getDay() numbers it. */
export const CLOSED_DAY = 0;

export const MIN_NOTICE_HOURS = 2;

export const MAX_AHEAD_DAYS = 90;

export const BOOKING_TYPES: ReadonlyArray<{
  value: BookingType;
  label: string;
  hint: string;
}> = [
  {
    value: "test_drive",
    label: "Test drive",
    hint: "Drive the car yourself. Bring your licence.",
  },
  {
    value: "viewing",
    label: "Showroom viewing",
    hint: "See the car in person, no obligation.",
  },
  {
    value: "handover",
    label: "Collection",
    hint: "Collecting a car you have already bought.",
  },
];

/** Every bookable start time, as 24-hour "HH:MM". */
export function slotTimes(): string[] {
  const times: string[] = [];
  for (let hour = OPENS_AT; hour <= LAST_SLOT; hour++) {
    times.push(`${String(hour).padStart(2, "0")}:00`);
  }
  return times;
}

/** "17:00" → "5:00pm", for labels. */
export function formatSlot(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const suffix = h < 12 ? "am" : "pm";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")}${suffix}`;
}

/**
 * The earliest and latest dates the date input should allow, as "YYYY-MM-DD".
 *
 * `min` is today rather than tomorrow: a booking later today is legitimate as
 * long as it clears the notice period, and that is a question about the TIME,
 * which this input does not know. Rejecting the whole day here would refuse
 * a five o'clock slot at nine in the morning.
 */
export function dateBounds(now: Date = new Date()): { min: string; max: string } {
  const iso = (d: Date) => {
    // Local, not toISOString(): that converts to UTC first, which rolls the
    // date backwards for anyone west of Greenwich and — during BST — hands
    // British users yesterday's date for the first hour of every day.
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const da = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${da}`;
  };

  const max = new Date(now);
  max.setDate(max.getDate() + MAX_AHEAD_DAYS);

  return { min: iso(now), max: iso(max) };
}

/** Why a requested slot cannot be taken, or null when it is fine. */
export type SlotProblem =
  | "unparseable"
  | "too_soon"
  | "too_far"
  | "closed_day"
  | "outside_hours";

/**
 * Combines a "YYYY-MM-DD" date and an "HH:MM" time into a local Date, and says
 * whether the business could honour it.
 *
 * Built by hand rather than with `new Date("2026-09-03T11:00")` because that
 * string form is only reliably parsed as local time in modern engines, and the
 * difference between local and UTC here is a customer arriving an hour out.
 */
export function checkSlot(
  date: string,
  time: string,
  now: Date = new Date(),
): { when: Date; problem: SlotProblem | null } {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);

  if ([y, mo, d, h, mi].some((n) => !Number.isFinite(n))) {
    return { when: new Date(NaN), problem: "unparseable" };
  }

  const when = new Date(y, mo - 1, d, h, mi, 0, 0);
  if (Number.isNaN(when.getTime())) {
    return { when, problem: "unparseable" };
  }

  const earliest = new Date(now.getTime() + MIN_NOTICE_HOURS * 3600_000);
  if (when < earliest) return { when, problem: "too_soon" };

  const latest = new Date(now);
  latest.setDate(latest.getDate() + MAX_AHEAD_DAYS);
  if (when > latest) return { when, problem: "too_far" };

  if (when.getDay() === CLOSED_DAY) return { when, problem: "closed_day" };

  if (h < OPENS_AT || h > LAST_SLOT || (h === LAST_SLOT && mi > 0)) {
    return { when, problem: "outside_hours" };
  }

  return { when, problem: null };
}

/** Customer-facing wording for each problem. */
export const SLOT_MESSAGES: Record<SlotProblem, string> = {
  unparseable: "Please choose a date and a time.",
  too_soon: `Please choose a time at least ${MIN_NOTICE_HOURS} hours from now.`,
  too_far: `Please choose a date within the next ${MAX_AHEAD_DAYS} days.`,
  closed_day: "We're closed on Sundays — please pick another day.",
  outside_hours: `We take bookings between ${formatSlot(
    `${String(OPENS_AT).padStart(2, "0")}:00`,
  )} and ${formatSlot(`${String(LAST_SLOT).padStart(2, "0")}:00`)}.`,
};

/**
 * The local ISO 8601 string the CRM expects, WITHOUT a timezone suffix.
 *
 * Sending a `Z` string would have the CRM read a 2pm booking as 2pm UTC, which
 * is 3pm in the showroom for half the year. The appointment is a wall-clock
 * time in Bury, so it travels as one.
 */
export function toLocalIso(when: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}` +
    `T${pad(when.getHours())}:${pad(when.getMinutes())}:00`
  );
}
