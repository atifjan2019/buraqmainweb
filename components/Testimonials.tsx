import { testimonials } from "@/lib/site";
import { Star } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function Testimonials() {
  return (
    <section className="border-t border-line-soft bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What Our"
          accent="Customers Say"
          body="Don't just take our word for it — here's what drivers say after buying from us."
        />

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90}>
              <figure className="surface-card flex h-full flex-col p-8 transition-colors hover:border-ink">
                {/* Stars in ink, not in a hue. The doc forbids introducing a
                    brand colour outside the tricolour, and the tricolour is
                    identity-only — it never lands on a rating. */}
                <div
                  className="flex gap-1 text-ink"
                  aria-label="Rated 5 out of 5"
                >
                  {Array.from({ length: 5 }).map((_, n) => (
                    <Star key={n} className="h-3.5 w-3.5" />
                  ))}
                </div>

                {/* The oversized quote glyph is gone with the rest of the
                    ornament; the rule and the tracking carry the structure. */}
                <blockquote className="mt-6 flex-1 text-sm font-light leading-relaxed text-muted">
                  {t.quote}
                </blockquote>

                <figcaption className="mt-8 border-t border-line-soft pt-5">
                  <span className="label-uppercase block text-ink">
                    {t.name}
                  </span>
                  <span className="caption mt-2 block text-faint">
                    Verified Customer · {t.car}
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
