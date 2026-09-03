import { representativeExample } from "@/lib/codeweavers/client";
import { REPRESENTATIVE_VEHICLE_PRICE } from "@/lib/codeweavers/params";
import RepresentativeExample from "./RepresentativeExample";

/**
 * The representative example, fetched and banded.
 *
 * ANY page that shows a monthly payment must carry this. CONC 3.5.3R is
 * triggered by the figure, not by the page it happens to sit on, so the
 * listings grid and the homepage's stock sections both need it — and wiring the
 * homepage cards without this would have put an unqualified financial promotion
 * on the site's front door.
 *
 * Self-fetching rather than taking a prop so that adding payments to a new
 * surface cannot accidentally ship without the example: whoever adds the
 * figures adds this beside them, and the data comes with it.
 *
 * The example is calculated on a designated vehicle, never read off a listings
 * batch — see representativeExample() for why that distinction matters.
 */
export default async function RepresentativeExampleBand() {
  const quote = await representativeExample({
    id: "representative-example",
    price: REPRESENTATIVE_VEHICLE_PRICE,
    mileage: 50000,
    // Mid-age for this forecourt. Held relative to the current year so the
    // example does not quietly become a quote for a fifteen-year-old car.
    registrationDate: `${new Date().getFullYear() - 5}-01-01`,
  });

  if (!quote) return null;

  return (
    <section className="bg-canvas py-16">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <RepresentativeExample quote={quote} />
      </div>
    </section>
  );
}
