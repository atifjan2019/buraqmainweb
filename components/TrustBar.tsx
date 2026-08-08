import { trustBadges } from "@/lib/site";
import Reveal from "./Reveal";

/**
 * The strip directly under the hero. Built as a row of spec cells rather than
 * as badges: DESIGN-bmw-m.md has no chip or pill shape, and the check-in-a-
 * circle treatment this carried was the kind of chrome the system deliberately
 * strips out. Hairline gaps make the four read as one divided panel.
 */
export default function TrustBar() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-8">
        {/* The outer border matters as much as the gaps: without it the panel
            has no edge against the canvas, since nothing here casts a shadow
            to give it one. */}
        <ul className="grid grid-cols-2 gap-px border border-line-soft bg-line-soft lg:grid-cols-4">
          {trustBadges.map((badge, i) => (
            <li key={badge} className="spec-cell">
              <Reveal delay={i * 70}>
                <div className="px-5 py-8">
                  <span className="label-uppercase block text-ink">
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
