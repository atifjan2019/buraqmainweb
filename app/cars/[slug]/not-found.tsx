import StockNotice from "@/components/StockNotice";

/**
 * Shown when the CRM returns 404 for a registration — the car has been sold or
 * unpublished. That can happen while someone has the page open, so the copy
 * assumes a real buyer looking at a car that has just gone.
 */
export default function VehicleNotFound() {
  return (
    <section className="relative pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[40rem] w-[60rem] -translate-x-1/2 opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,165,36,0.12) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <StockNotice
          title="This car is no longer available"
          body="It's been sold or taken off sale. We get new stock in regularly, and we can source specific vehicles to order — tell us what you're after and we'll keep an eye out."
          action={{ label: "Browse current stock", href: "/cars" }}
        />
      </div>
    </section>
  );
}
