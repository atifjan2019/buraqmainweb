/**
 * Static business configuration.
 *
 * Anything in `contact` is real-world business data — it must never be
 * guessed. Values still marked TODO are being pulled off the current live
 * site; leave them empty rather than inventing a plausible number.
 */

/**
 * Registered entity behind the trading name. Confirmed by Codeweavers in
 * writing during the finance integration.
 *
 * TODO before launch — these are legally required on a UK trading site and on
 * the privacy notice, and nobody has supplied them yet:
 *   companyNumber   Companies House registration number
 *   vatNumber       VAT registration number
 *   icoNumber       ICO data protection register reference
 *   fcaNumber       FCA firm reference number (the site claims "FCA Authorised")
 */
export const company = {
  legalName: "Burraq Traders Ltd",
  tradingAs: "Burraq Motors",
  companyNumber: "",
  /** VAT registration, printed in the Terms only once it is filled in. */
  vatNumber: "",
  icoNumber: "",
  fcaNumber: "",
} as const;

/**
 * The origin this deployment actually answers on.
 *
 * Every canonical tag, the sitemap and robots.txt are built from it, so a
 * hardcoded value is wrong the moment the site moves — and a sitemap
 * advertising a host you don't serve gets the wrong one indexed.
 *
 * Resolution order:
 *   NEXT_PUBLIC_SITE_URL      set in the host's env once a real domain is live
 *   ..._PROJECT_PRODUCTION_URL  the project's stable production alias
 *   NEXT_PUBLIC_VERCEL_URL    per-deployment, previews only
 *   the production domain     the intended final home, and the right answer
 *                             for a plain `next build` with no environment
 *
 * The middle two are not interchangeable, which is easy to get wrong:
 * VERCEL_URL is unique to a single deployment
 * (buraqmainweb-568t0csc3-….vercel.app) and changes on every push. Using it in
 * production would hand search engines a new canonical host each deploy and
 * index an immutable build URL. PROJECT_PRODUCTION_URL is the alias that
 * survives deploys, so production takes that and only previews — where
 * describing the specific build IS correct — fall through to VERCEL_URL.
 *
 * NEXT_PUBLIC_ because this module is imported by Client Components; a
 * server-only variable would arrive as undefined in the browser. Vercel exposes
 * the prefixed copies when "Automatically expose System Environment Variables"
 * is on; if that is ever turned off, set NEXT_PUBLIC_SITE_URL explicitly.
 */
function siteUrl(): string {
  const clean = (value: string) => value.trim().replace(/\/+$/, "");

  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit?.trim()) return clean(explicit);

  const production = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && production?.trim()) {
    return `https://${clean(production)}`;
  }

  const deployment = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (deployment?.trim()) return `https://${clean(deployment)}`;

  return "https://burraqmotors.co.uk";
}

export const site = {
  name: "Burraq Motors",
  tagline: "Premium Japanese Cars in Manchester",
  description:
    "Browse quality hybrid and imported vehicles in Manchester. Finance available on selected cars. Every vehicle HPI checked, warranty available, nationwide delivery.",
  url: siteUrl(),
} as const;

interface ContactDetails {
  /** As shown to visitors. */
  phone: string;
  /** E.164 for the tel: href. */
  phoneHref: string;
  whatsappDisplay: string;
  /** Digits only, international format, for wa.me. */
  whatsapp: string;
  email: string;
  addressLines: string[];
  city: string;
  country: string;
  openingHours: string;
  trustpilot: string;
}

/**
 * Taken verbatim from the current live site. An empty string means the detail
 * is unverified — the UI hides that control rather than showing a guess.
 *
 * Note: the live site's footer links WhatsApp to 07414 984700 while its
 * confirmation email uses 07462 187617. We use the publicly displayed number;
 * worth confirming with the client which one is monitored.
 */
export const contact: ContactDetails = {
  phone: "07462 187617",
  phoneHref: "+447462187617",
  whatsappDisplay: "+44 7414 984700",
  whatsapp: "447414984700",
  email: "contactus@burraqmotors.co.uk",
  addressLines: ["Unit 3 Fern Street", "Bury", "Lancashire BL9 5BP"],
  city: "Manchester",
  country: "United Kingdom",
  // Taken from the showroom signage in the dealership's own photography.
  openingHours: "Monday to Saturday, 9am – 6pm",
  trustpilot: "https://uk.trustpilot.com/review/burraqmotors.co.uk",
};

/**
 * The named contact shown beside a car on its detail page.
 *
 * ⚠ PLACEHOLDER. The name below is invented, and it should be replaced with a
 * real member of staff before this gets much traffic. A named person on a
 * vehicle page reads as "this is who you'll be dealing with", and a customer
 * who rings up asking for someone who doesn't exist is a worse first
 * impression than no name at all. It also sits oddly next to the deliberate
 * decision on the About page not to invent staff biographies.
 *
 * `photo` is null until a real photograph exists at `public/team/…`. The card
 * falls back to initials rather than a stock portrait on purpose: a
 * stranger's face captioned with an invented name is a bigger claim than no
 * face, and a harder one to walk back.
 */
export const salesContact = {
  name: "Adam Rashid",
  role: "Sales Specialist",
  blurb:
    "Happy to talk this one through, arrange a viewing, or run the finance figures for you — no pressure either way.",
  photo: null as string | null,
};

/** Builds a wa.me link, or null when we don't have a verified number. */
export function whatsappLink(message?: string): string | null {
  if (!contact.whatsapp) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${contact.whatsapp}${text}`;
}

/**
 * The primary navigation, rendered by both `Header` and `Footer` — which is
 * why links are added here rather than typed into the header alone.
 *
 * The ordering is shopping links, then reading, then company. Journal and
 * Auction Sheets sit in the middle for the same reason: both are things a
 * visitor reads while deciding, so they belong with the cars rather than with
 * the About/Contact pair. Auction Sheets leads that pair because it answers a
 * question specific to buying an import — "can I trust this car's history" —
 * which is the objection that stops the sale.
 */
export const nav = [
  { label: "Home", href: "/" },
  { label: "Our Cars", href: "/cars" },
  { label: "Finance", href: "/finance" },
  { label: "Auction Sheets", href: "/auction-sheets" },
  { label: "Journal", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

/** Headline numbers shown in the hero and stat strip. */
export const stats = [
  { value: "200+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "200+", label: "Cars Sold" },
  { value: "24/7", label: "Support" },
] as const;

/** Trust badges under the hero. */
export const trustBadges = [
  "FCA Authorised",
  "Finance Available",
  "HPI Checked Vehicles",
  "Warranty Available",
] as const;

/** Scrolling marquee of specialisations. */
export const specialisms = [
  "Japanese Car Specialist",
  "Warranty",
  "All Cars HPI Clear",
  "Vehicle Sourcing",
  "6/12 Months MOT",
  "Nationwide Delivery",
  "Finance",
] as const;

export const financeSteps = [
  {
    step: "01",
    title: "Choose your car",
    body: "Browse our stock and pick the vehicle that fits your needs and budget.",
  },
  {
    step: "02",
    title: "Submit a quick enquiry",
    body: "Send us a few details. It takes a couple of minutes and costs nothing.",
  },
  {
    step: "03",
    title: "We check suitable options",
    body: "Our team reviews the finance options available to you and comes back with the detail.",
  },
  {
    step: "04",
    title: "Drive away",
    body: "Complete the paperwork with us and collect your car, or have it delivered nationwide.",
  },
] as const;

export const whyUs = [
  {
    title: "Quality Assured",
    body: "Every vehicle undergoes rigorous inspection to ensure it meets our high standards of quality and reliability.",
  },
  {
    title: "Competitive Prices",
    body: "We offer the best value for money with transparent pricing and no hidden fees.",
  },
  {
    title: "Expert Service",
    body: "Our experienced team provides personalised service to help you find the perfect vehicle.",
  },
  {
    title: "Warranty",
    body: "Comprehensive warranty coverage on our vehicles for genuine peace of mind.",
  },
  {
    title: "Transparent Process",
    body: "No hidden fees and no surprises. We believe in honest, straightforward car sales.",
  },
  {
    title: "After-Sales Support",
    body: "We're here for you after the sale too, with ongoing support and maintenance services.",
  },
] as const;

/**
 * Customer reviews carried across from the current site.
 *
 * NOT dead code, and not the primary source any more. Since the CRM began
 * caching real Google and Trustpilot reviews, `components/Testimonials.tsx`
 * renders those — and falls back to THIS set whenever the CRM is unreachable
 * or has no visible reviews to publish (see `pickTestimonials` in
 * `lib/reviews.ts`). An empty testimonials band on the homepage is worse than
 * six true-but-static quotes, so this array is the floor under that section
 * and must not be deleted or emptied.
 */
export const testimonials = [
  {
    quote:
      "Bought my 2019 Toyota Corolla from Burraq Motors last month. The car was exactly as described, and the team was incredibly helpful throughout the process. No hidden fees, which was refreshing!",
    name: "Ahmed Khan",
    car: "Toyota Corolla",
  },
  {
    quote:
      "After visiting 3 other dealers, I finally found my perfect 2020 Toyota Prius at Burraq Motors. The finance team helped me get a great rate, and the car has been running perfectly for 6 months now. Amazing fuel efficiency!",
    name: "Sarah Ahmed",
    car: "Toyota Prius",
  },
  {
    quote:
      "I was skeptical about buying a used car, but Burraq Motors' 12-month warranty gave me confidence. My 2018 Toyota Camry has been flawless, and their service team is always helpful.",
    name: "Mohammed Ali",
    car: "Toyota Camry",
  },
  {
    quote:
      "Traded in my old car and got a fantastic deal on a 2021 Toyota Prius. The team was honest about the trade-in value and helped me understand all the paperwork. Very professional service.",
    name: "James Wilson",
    car: "Toyota Prius",
  },
  {
    quote:
      "My family needed a reliable 7-seater and we found the perfect 2019 Toyota Voxy at Burraq Motors. The kids love it, and it's been trouble-free for over a year. Great value for money!",
    name: "Lisa Thompson",
    car: "Toyota Voxy",
  },
  {
    quote:
      "First-time car buyer here! The team at Burraq Motors made everything so simple. They explained every step, helped with insurance, and even showed me how to use all the features. Couldn't be happier.",
    name: "Rachel Green",
    car: "Toyota Corolla",
  },
] as const;

/**
 * FCA requires finance advertising to carry a status qualifier. Keep this
 * wording on every finance call-to-action.
 */
export const financeDisclaimer =
  "Finance subject to status, terms and conditions, and affordability.";

/**
 * Longer disclosure shown alongside the quote calculator.
 *
 * Codeweavers explicitly do not supply a disclaimer and state the site is not
 * FCA compliant without the dealer's own wording, so this must be reviewed and
 * signed off by Burraq Motors before launch. The FCA firm reference number is
 * still outstanding — see the TODO below.
 */
export const financeFullDisclaimer =
  "Figures are illustrative only and do not constitute an offer of finance. " +
  "Finance is subject to status, affordability and lender approval. Terms and " +
  "conditions apply. Written quotations available on request. Burraq Motors is " +
  "a credit broker, not a lender, and may receive a commission from lenders.";

/** Codeweavers finance plugin. The API key is a public, client-side embed key. */
export const codeweavers = {
  apiKey: process.env.NEXT_PUBLIC_CODEWEAVERS_API_KEY ?? "SuvI8TJFiT4Y1i8ff6",
  scriptBase: "https://plugins.codeweavers.app/scripts/v1/platform/finance",
} as const;

export function codeweaversScriptUrl(): string {
  return `${codeweavers.scriptBase}?ApiKey=${codeweavers.apiKey}`;
}

/** Codeweavers' finance explainer films, embedded on the finance page. */
export const financeVideos = [
  { id: "866686746", title: "Why finance through a dealership?" },
  { id: "887241645", title: "What is Conditional Sale?" },
  { id: "838572663", title: "What is Hire Purchase?" },
  { id: "810874993", title: "What is Personal Contract Purchase?" },
  { id: "848713929", title: "What is Personal Contract Hire?" },
  { id: "912895855", title: "What is Lease Purchase?" },
] as const;
