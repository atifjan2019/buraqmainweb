import { createHash } from "node:crypto";

/**
 * Why the finance figures are or are not showing.
 *
 * The site suppresses every monthly payment when it cannot obtain a valid
 * representative example, which is correct but tells you nothing about the
 * cause: a missing key, a mistyped one, and the lender refusing the call all
 * look identical from the front end — an empty page where the figures were.
 * This answers the question directly.
 *
 * NOTHING SECRET IS RETURNED. The key never appears; what comes back is whether
 * one is set, how long it is before and after trimming (which is how a pasted
 * trailing newline is caught — the commonest cause of a key that "is definitely
 * there" and definitely does not work), and a short hash. The hash is the useful
 * part: hashing the working key locally and comparing the two prefixes proves
 * whether the deployment holds the same value, without either of us handling it.
 *
 * The probe is the same call the site makes, against a fixed synthetic vehicle,
 * so a non-200 or a thrown error distinguishes "the lender will not talk to this
 * deployment" from "this deployment has no key to talk with".
 */

export const dynamic = "force-dynamic";

const ENDPOINT =
  "https://services.codeweavers.net/public/v3/jsonfinance/calculate";

const PROBE = {
  Parameters: {
    Term: 60,
    Deposit: 10,
    DepositType: "Percentage",
    AnnualMileage: 10000,
    AnnualMileageUnit: "Miles",
  },
  VehicleRequests: [
    {
      Id: "health-probe",
      Vehicle: {
        CashPrice: 12600,
        Type: "Car",
        VehicleStatus: "Preowned",
        CurrentMileage: 50000,
        CurrentMileageUnit: "Miles",
        RegistrationDate: "2021-01-01",
        RegistrationCountryCode: "GB",
      },
    },
  ],
};

export async function GET() {
  const raw = process.env.CODEWEAVERS_API_KEY ?? "";
  const key = raw.trim();

  const report: Record<string, unknown> = {
    keyPresent: Boolean(key),
    // Different numbers here mean whitespace came in with the paste.
    rawLength: raw.length,
    trimmedLength: key.length,
    // First 12 hex of sha256. Enough to compare two values, useless to reverse.
    fingerprint: key
      ? createHash("sha256").update(key).digest("hex").slice(0, 12)
      : null,
    region: process.env.VERCEL_REGION ?? null,
    environment: process.env.VERCEL_ENV ?? "unknown",
  };

  if (!key) {
    report.lender = "not attempted — no key in this environment";
    return Response.json(report);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const startedAt = Date.now();

  try {
    // Deliberately sending the TRIMMED key: if this succeeds while the site
    // fails, the untrimmed value is the whole story.
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-CW-ApiKey": key,
      },
      body: JSON.stringify(PROBE),
      signal: controller.signal,
      cache: "no-store",
    });

    const body = await response.text();
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(body) as Record<string, unknown>;
    } catch {
      /* non-JSON body — reported as a snippet below */
    }

    const vehicleResults =
      (parsed?.VehicleResults as { FinanceProductResults?: unknown[] }[]) ?? [];
    const products =
      (vehicleResults[0]?.FinanceProductResults as
        | {
            Key?: string;
            HasError?: boolean;
            Error?: { TechnicalMessage?: string };
            Quote?: { RegularPayment?: number };
          }[]
        | undefined) ?? [];

    report.lender = {
      status: response.status,
      ms: Date.now() - startedAt,
      products: products.map((p) => ({
        key: p.Key,
        hasError: p.HasError,
        payment: p.Quote?.RegularPayment ?? null,
        reason: p.Error?.TechnicalMessage ?? null,
      })),
      representativeExample: Boolean(parsed?.RepresentativeExample),
      // Only when the response was not JSON at all — a proxy or block page.
      bodySnippet: parsed ? undefined : body.slice(0, 200),
    };
  } catch (error) {
    report.lender = {
      status: null,
      ms: Date.now() - startedAt,
      threw: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }

  return Response.json(report);
}
