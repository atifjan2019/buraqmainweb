import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /**
   * The tail of the headline. It used to be rendered in the accent colour;
   * this system has no accent colour for type — white IS the primary, and the
   * doc forbids introducing a brand hue outside the tricolour, which is
   * identity-only and never lands on running text. So it renders as part of
   * the same white headline, and stays a separate prop only because every
   * caller already splits its heading this way.
   */
  accent?: string;
  body?: string;
  align?: "left" | "center";
  /**
   * The heading level. `h2` by default, because most callers are a section
   * inside a page that already has an h1 above them.
   *
   * `/cars` is the exception and the reason this exists: it is the site's most
   * commercially important indexable page and its masthead was an h2, leaving
   * the page with no h1 at all. The visual treatment is identical either way —
   * this changes the tag, not the type.
   */
  as?: "h1" | "h2";
}

/**
 * Standard section masthead: tricolour-ruled eyebrow, UPPERCASE display-lg
 * headline, optional Light lead paragraph.
 */
export default function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  align = "center",
  as: Heading = "h2",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <Reveal>
        <span
          className={`eyebrow ${centered ? "eyebrow-center justify-center" : ""}`}
        >
          {eyebrow}
        </span>
      </Reveal>

      <Reveal delay={80}>
        <Heading className="display-lg mt-6 text-ink">
          {accent ? `${title} ${accent}` : title}
        </Heading>
      </Reveal>

      {body && (
        <Reveal delay={140}>
          <p
            className={`mt-6 text-base font-light leading-relaxed text-muted ${
              centered ? "mx-auto max-w-2xl" : "max-w-2xl"
            }`}
          >
            {body}
          </p>
        </Reveal>
      )}
    </div>
  );
}
