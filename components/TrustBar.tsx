import { trustBadges } from "@/lib/site";
import { Check } from "./Icons";
import Reveal from "./Reveal";

export default function TrustBar() {
  return (
    <section className="relative border-y border-line-soft bg-surface/30">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <ul className="grid grid-cols-2 gap-px lg:grid-cols-4">
          {trustBadges.map((badge, i) => (
            <li key={badge}>
              <Reveal delay={i * 70}>
                <div className="flex items-center justify-center gap-3 px-3 py-7 text-center">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-amber/25 bg-amber/10">
                    <Check className="h-4 w-4 text-amber" />
                  </span>
                  <span className="text-sm font-medium text-ink sm:text-[0.95rem]">
                    {badge}
                  </span>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
