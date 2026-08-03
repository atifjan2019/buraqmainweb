import { testimonials } from "@/lib/site";
import { Quote, Star } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Testimonials() {
  return (
    <section className="relative border-t border-line-soft py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="TESTIMONIALS"
          title="What Our"
          accent="Customers Say"
          body="Don't just take our word for it — here's what drivers say after buying from us."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90}>
              <figure className="group glass relative flex h-full flex-col rounded-2xl p-7 transition-all duration-500 hover:-translate-y-1 hover:border-amber/30">
                <Quote className="h-7 w-7 text-amber/25 transition-colors group-hover:text-amber/50" />

                <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-muted">
                  {t.quote}
                </blockquote>

                <div
                  className="mt-6 flex gap-0.5 text-amber"
                  aria-label="Rated 5 out of 5"
                >
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} className="h-3.5 w-3.5" />
                  ))}
                </div>

                <figcaption className="mt-4 flex items-center gap-3 border-t border-line-soft pt-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-linear-to-br from-amber-bright to-amber-dim font-display font-bold text-canvas">
                    {t.name.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {t.name}
                    </span>
                    <span className="block truncate text-xs text-faint">
                      Verified Customer · {t.car}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
