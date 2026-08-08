import StockNotice from "@/components/StockNotice";

/**
 * Shown when the CRM returns 404 for a registration — the car has been sold or
 * unpublished. That can happen while someone has the page open, so the copy
 * assumes a real buyer looking at a car that has just gone.
 */
export default function VehicleNotFound() {
  return (
    <section className="bg-canvas pt-32 pb-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <StockNotice
          title="This car is no longer available"
          body="It's been sold or taken off sale. We get new stock in regularly, and we can source specific vehicles to order — tell us what you're after and we'll keep an eye out."
          action={{ label: "Browse current stock", href: "/cars" }}
        />
      </div>
    </section>
  );
}
