import { NextResponse } from "next/server";

/**
 * Hands a customer to the Codeweavers application, carrying their exact quote.
 *
 * WHY THIS EXISTS RATHER THAN A DIRECT LINK. Codeweavers document the apply
 * journey as a plain hyperlink:
 *
 *   //services.codeweavers.net/navigator/redirectToApplication/apply
 *     ?apiKey={KEY}&quoteReference={REF}
 *
 * which would put the API key in the page markup of every car we list. This
 * redirects through our own origin instead, attaching the key server-side, so
 * the browser only ever sees a quote reference.
 *
 * WHY NOT QuoteActions.Apply. The live response does carry a ready-made apply
 * URL at Quote.QuoteActions.Apply, and it works. It is also undocumented:
 * Codeweavers' own Swagger types QuoteActions as an open string→string
 * dictionary with no named keys, and the word appears nowhere in their prose
 * documentation. Building the application handoff — the one step where a
 * customer's real finance application is at stake — on a field they have not
 * committed to is a silent breakage waiting for a release. `quoteReference` is
 * documented, and its stated purpose is exactly this: "Transfer vehicle and
 * finance information to the application."
 */

const APPLY_BASE =
  "https://services.codeweavers.net/navigator/redirectToApplication/apply";

/**
 * Quote references are GUIDs in practice, but the contract only says "string".
 * Constrained to what a reference can safely be rather than to what one
 * currently looks like: anything else is a caller building their own redirect.
 */
const REFERENCE = /^[A-Za-z0-9-]{8,64}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reference = url.searchParams.get("quote");

  const key = process.env.CODEWEAVERS_API_KEY;

  if (!key) {
    console.error(
      "[codeweavers] CODEWEAVERS_API_KEY is not set — cannot start a finance " +
        "application.",
    );
    return NextResponse.redirect(new URL("/contact", url.origin), 302);
  }

  // No reference, or a shaped-wrong one: send them to the general application
  // rather than to a Codeweavers error page. They lose the pre-filled figures,
  // not the ability to apply.
  const target = new URL(APPLY_BASE);
  target.searchParams.set("apiKey", key);

  if (reference && REFERENCE.test(reference)) {
    target.searchParams.set("quoteReference", reference);
  } else if (reference) {
    console.error(`[codeweavers] rejected malformed quote reference`);
  }

  // Where Codeweavers returns the customer once they are done.
  target.searchParams.set("referrer", `${url.origin}/finance`);

  // 302, not 308: the destination carries a credential and a per-quote
  // reference, and neither should be cached by a browser or a proxy.
  return NextResponse.redirect(target.toString(), 302);
}
