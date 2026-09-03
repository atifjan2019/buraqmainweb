import type { Metadata } from "next";
import Image from "next/image";
import FinancePanel from "@/components/finance/FinancePanel";
import RepresentativeExampleBand from "@/components/finance/RepresentativeExampleBand";
import Reveal from "@/components/Reveal";
import SectionHeading from "@/components/SectionHeading";
import VideoEmbed from "@/components/VideoEmbed";
import { quoteOne } from "@/lib/codeweavers/client";
import { DEFAULT_PARAMETERS, registrationDate, toFinanceInput } from "@/lib/codeweavers/params";
import { getVehicle } from "@/lib/crm";
import { financeDisclaimer, financeSteps, financeVideos } from "@/lib/site";
import { vehicleHeadline } from "@/lib/vehicles";

export const metadata: Metadata = {
  title: "Car Finance",
  description:
    "Calculate illustrative monthly payments on any vehicle price. Finance available on selected cars at Burraq Motors Manchester, subject to status.",
};

const HERO_IMAGE = "/cars/107-toyota-prius/01.jpeg";

type SearchParams = Record<string, string | string[] | undefined>;

/** Query strings can repeat a key; the first value wins. */
function single(value: string | string[] | undefined): string | undefined {
  const first = Array.isArray(value) ? value[0] : value;
  return first?.trim() ? first.trim() : undefined;
}

/**
 * Price the calculator opens at when no car is named, or when the one named
 * cannot be found. Roughly mid-forecourt, so the first quote a visitor sees is
 * in the right region rather than anchored at nothing.
 */
const FALLBACK_PRICE = 12900;

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  /*
   * `?vehicle=<slug>` is set by every card in the stock grid and by the finance
   * button on each vehicle page — and until now this page ignored it entirely
   * and opened at a hardcoded 12,900 no matter which car was clicked. Somebody
   * pressing Finance on a 9,700 Audi was quoted on 12,900: not merely unhelpful
   * on a regulated product, but wrong in the customer's favour-adjacent
   * direction, which is worse.
   *
   * Failure here is silent by design. A slug that no longer resolves — car
   * sold, link shared months later — falls back to the default price rather
   * than 404ing: the calculator is still useful without a specific car, and
   * an error page helps nobody.
   */
  const slug = single((await searchParams).vehicle);

  let vehicle = null;
  if (slug) {
    try {
      vehicle = await getVehicle(slug);
    } catch (error) {
      console.error("[finance] could not resolve vehicle for calculator", error);
    }
  }

  const initialPrice = vehicle?.price ?? FALLBACK_PRICE;

  /*
   * Quote before render so the calculator opens with real figures instead of
   * an empty panel that only fills in once somebody touches a control.
   *
   * When a car was named we quote that exact car — its mileage and age change
   * the answer. Without one we quote the fallback price against a
   * representative age, which is what the standalone calculator is for.
   */
  const financeInput = vehicle
    ? toFinanceInput(vehicle)
    : {
        id: "calculator",
        price: initialPrice,
        mileage: 50000,
        registrationDate: `${new Date().getFullYear() - 5}-01-01`,
      };

  const finance = await quoteOne(financeInput);
  return (
    <>
      {/*
        Header band. The photograph takes its own half at full strength rather
        than sitting washed-out behind the type: a scrim heavy enough to carry
        black copy over an image erases the car, and the doc would rather have
        the photograph intact. The film grain that used to overlay it is gone
        with the rest of the decoration.
      */}
      <section className="border-b border-line-soft bg-canvas">
        <div className="grid lg:grid-cols-2">
          <div className="relative order-first min-h-[16rem] lg:order-last lg:min-h-[30rem]">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"
            />
          </div>

          <div className="flex items-center px-5 pt-24 pb-16 sm:px-8 lg:px-16 lg:py-24">
            <div className="max-w-xl">
              <Reveal>
                <span className="eyebrow">Finance</span>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="display-lg mt-6 text-ink">
                  Car finance, made simple
                </h1>
              </Reveal>
              <Reveal delay={140}>
                <p className="mt-6 max-w-lg text-base font-light leading-relaxed text-muted">
                  {vehicle
                    ? `Illustrative Hire Purchase payments for the ${vehicleHeadline(vehicle)}. Figures are for illustration only, carry no obligation, and are not an offer of finance.`
                    : "Put in a vehicle price and see illustrative Hire Purchase payments. Figures are for illustration only, carry no obligation, and are not an offer of finance."}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section className="bg-canvas py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <FinancePanel
              price={financeInput.price}
              mileage={financeInput.mileage}
              registrationDate={financeInput.registrationDate}
              registration={vehicle?.registration}
              initialQuotes={finance?.quotes ?? []}
              /* The price is the thing being explored here, unlike on a car's
                 own page where it is a fact about that car. */
              priceEditable={!vehicle}
              heading={
                vehicle
                  ? `Finance the ${vehicleHeadline(vehicle)}`
                  : "Work out your monthly payment"
              }
            />
          </Reveal>
        </div>
      </section>

      {/* Required wherever a monthly payment appears — the calculator above
          shows one. CONC 3.5.3R is triggered by the figure, not by the page. */}
      <RepresentativeExampleBand />

      {/* Process */}
      <section className="border-y border-line-soft bg-canvas py-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <SectionHeading
            eyebrow="How It Works"
            title="Four steps to"
            accent="your next car"
          />
          <ol className="mt-16 grid gap-px border border-line-soft bg-line-soft sm:grid-cols-2 lg:grid-cols-4">
            {financeSteps.map((step, i) => (
              <li key={step.step} className="spec-cell">
                <Reveal delay={i * 90}>
                  <div className="group h-full p-8">
                    {/* Ghost numeral. A grey that recedes on white advances on
                        black, so this is a token pair rather than one colour
                        at a low alpha — and hover has to deepen it on white
                        where it lightens on black. */}
                    <span className="display-md block leading-none text-(--ghost-numeral) transition-colors group-hover:text-(--ghost-numeral-hover)">
                      {step.step}
                    </span>
                    <h3 className="title-lg mt-6 text-ink">{step.title}</h3>
                    <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                      {step.body}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal delay={140}>
            <p className="caption mt-16 text-center text-faint">
              {financeDisclaimer}
            </p>
          </Reveal>
        </div>
      </section>

      {/* Explainer films */}
      <section className="bg-canvas py-24">
        <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
          <SectionHeading
            eyebrow="Understand Your Options"
            title="Finance explained,"
            accent="in plain English"
            body="Short films covering each type of agreement, so you know exactly what you're signing."
          />

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {financeVideos.map((video, i) => (
              <Reveal key={video.id} delay={(i % 3) * 90}>
                <figure className="surface-card overflow-hidden transition-colors hover:border-ink">
                  <div className="aspect-video w-full overflow-hidden bg-surface-2">
                    <VideoEmbed id={video.id} title={video.title} />
                  </div>
                  <figcaption className="title-lg border-t border-line-soft p-6 text-ink">
                    {video.title}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
