import { stats, whyUs } from "@/lib/site";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function WhyUs() {
  return (
    <section id="about" className="bg-canvas py-24">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        <SectionHeading
          eyebrow="Why Us"
          title="Why Choose"
          accent="Burraq Motors"
          body="We focus on quality Japanese imports, transparent pricing, and a straightforward buying experience you can trust."
        />

        {/* Flat card surfaces with a hairline, no lift and no shadow. The
            elevation model here is a single step up from canvas — that step is
            the whole of it, which is why hover firms the border rather than
            moving the card. */}
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 90}>
              <div className="surface-card h-full p-8 transition-colors hover:border-ink">
                {/* The tricolour marks the card without becoming a fill — the
                    doc allows it as an accent rule and rules it out as a
                    surface. */}
                <span aria-hidden className="m-stripe block h-1 w-10" />
                <h3 className="title-lg mt-6 text-ink">{item.title}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Numbers — the doc's spec-cell treatment: value at display weight on
            top, machined label beneath, hairline gaps rather than gutters so
            the four read as one instrument panel. */}
        <Reveal delay={160}>
          <dl className="mt-16 grid grid-cols-2 gap-px border border-line-soft bg-line-soft lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="spec-cell px-6 py-10 text-center">
                <dt className="display-md text-ink">{s.value}</dt>
                <dd className="label-uppercase-sm mt-3 text-faint">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
