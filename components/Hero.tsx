import Image from "next/image";
import Link from "next/link";
import { financeDisclaimer, whatsappLink } from "@/lib/site";
import { getFeaturedVehicles } from "@/lib/crm";
import { formatPrice, vehicleHref, vehicleTitle } from "@/lib/vehicles";
import { ArrowRight, Check, Sparkle, WhatsApp } from "./Icons";
import Reveal from "./Reveal";

const heroStats = [
  { value: "200+", label: "Happy Customers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Support" },
];

/**
 * Brand photography, not stock — a low-angle shot from the dealership's own
 * library that reads well against the dark canvas. The car it shows may no
 * longer be for sale, so nothing here claims it is.
 */
const HERO_IMAGE = "/cars/112-toyota-prius/03.jpeg";

export default async function Hero() {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  // Same request the featured section makes, so the two share one fetch.
  const [spotlight] = await getFeaturedVehicles(6);

  return (
    <section className="relative isolate flex min-h-[94svh] items-center overflow-hidden pt-28 pb-20">
      {/* Photography */}
      <div aria-hidden className="absolute inset-0 -z-30">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] opacity-70 lg:object-[70%_center]"
        />
      </div>

      {/* Scrims — keep the headline legible over the photo on every breakpoint */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-r from-canvas via-canvas/85 to-canvas/25 lg:via-canvas/70 lg:to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-linear-to-t from-canvas via-transparent to-canvas/85"
      />

      {/* Ambient amber light */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-[-15%] -z-10 h-[60rem] w-[60rem] rounded-full opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(245,165,36,0.20) 0%, rgba(245,165,36,0.06) 40%, transparent 70%)",
        }}
      />

      {/* Film grain */}
      <div
        aria-hidden
        className="grain-overlay pointer-events-none absolute inset-0 -z-10 opacity-[0.14] mix-blend-overlay"
      />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-amber/25 bg-canvas/60 px-4 py-1.5 text-xs font-medium tracking-wide text-amber backdrop-blur">
              <Sparkle className="h-3.5 w-3.5" />
              Trusted by 200+ Customers
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-7 font-display text-[clamp(2.6rem,7.4vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.03em] [text-shadow:0_2px_40px_rgba(0,0,0,0.6)]">
              <span className="block text-ink">Premium</span>
              <span className="block text-gold">Japanese Cars</span>
              <span className="block text-ink">in Manchester</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-7 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
              Browse quality hybrid and imported vehicles, each one HPI checked
              and prepared to a standard we'd happily drive ourselves. Finance
              available on selected cars.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/cars"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-canvas transition-all hover:bg-amber-bright hover:shadow-[0_0_44px_-8px_var(--color-amber)]"
              >
                Browse Cars
                <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/finance"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-canvas/50 px-8 py-4 font-semibold text-ink backdrop-blur transition-colors hover:border-amber/40 hover:text-amber"
              >
                Calculate Finance
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-muted transition-colors hover:text-ink"
                >
                  <WhatsApp className="h-5 w-5" />
                  WhatsApp Us
                </a>
              )}
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="mt-5 text-xs text-faint">{financeDisclaimer}</p>
          </Reveal>

          <Reveal delay={400}>
            <dl className="mt-12 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft">
              {heroStats.map((s) => (
                <div
                  key={s.label}
                  className="bg-canvas/80 px-4 py-6 backdrop-blur sm:px-6"
                >
                  <dt className="font-display text-2xl font-bold text-amber sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-[0.7rem] leading-tight text-muted sm:text-xs">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </div>

      {/* Spotlight card — anchors the photo to a real car you can buy */}
      {spotlight && (
        <div className="absolute right-8 bottom-16 z-10 hidden xl:block">
          <Reveal delay={520}>
            <Link
              href={vehicleHref(spotlight)}
              className="group glass block w-64 rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:border-amber/40"
            >
              <span className="text-[0.65rem] font-semibold tracking-[0.2em] text-amber">
                IN THE SPOTLIGHT
              </span>
              <p className="mt-3 font-display text-lg font-semibold leading-tight text-ink">
                {vehicleTitle(spotlight)}
              </p>
              <p className="mt-1 text-xs text-muted">
                {spotlight.year} · {spotlight.fuelType} ·{" "}
                {spotlight.transmission}
              </p>
              <p className="mt-4 font-display text-2xl font-bold text-gold">
                {formatPrice(spotlight.price)}
              </p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition-colors group-hover:text-amber">
                View details
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        </div>
      )}

      {/* Trust strip pinned to the bottom edge of the hero */}
      <div className="absolute inset-x-0 bottom-0 hidden lg:block xl:hidden">
        <ul className="mx-auto flex max-w-7xl flex-wrap gap-x-7 gap-y-2 px-8 pb-6">
          {["FCA Authorised", "HPI Checked", "Warranty Available"].map(
            (item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-xs text-muted"
              >
                <Check className="h-3.5 w-3.5 text-amber" />
                {item}
              </li>
            ),
          )}
        </ul>
      </div>
    </section>
  );
}
