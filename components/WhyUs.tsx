import { stats, whyUs } from "@/lib/site";
import { Check } from "./Icons";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

export default function WhyUs() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="WHY US"
          title="Why Choose"
          accent="Burraq Motors"
          body="We focus on quality Japanese imports, transparent pricing, and a straightforward buying experience you can trust."
        />

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {whyUs.map((item, i) => (
            <Reveal key={item.title} delay={(i % 3) * 90}>
              <div className="group glass h-full rounded-2xl p-7 transition-all duration-500 hover:-translate-y-1 hover:border-amber/30">
                <span className="grid h-11 w-11 place-items-center rounded-xl border border-amber/25 bg-amber/10 transition-colors group-hover:bg-amber group-hover:text-on-amber">
                  <Check className="h-5 w-5 text-amber transition-colors group-hover:text-on-amber" />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Numbers */}
        <Reveal delay={160}>
          <dl className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line-soft bg-line-soft lg:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="bg-canvas px-6 py-10 text-center transition-colors hover:bg-surface/60"
              >
                <dt className="font-display text-4xl font-bold text-gold">
                  {s.value}
                </dt>
                <dd className="mt-2 text-sm text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
