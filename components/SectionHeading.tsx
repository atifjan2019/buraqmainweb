import Reveal from "./Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  /** Rendered in gold, appended after the title. */
  accent?: string;
  body?: string;
  align?: "left" | "center";
}

export default function SectionHeading({
  eyebrow,
  title,
  accent,
  body,
  align = "center",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Reveal>
        <span
          className={`inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber ${
            centered ? "justify-center" : ""
          }`}
        >
          <span className="h-px w-6 bg-amber/50" />
          {eyebrow}
          {centered && <span className="h-px w-6 bg-amber/50" />}
        </span>
      </Reveal>

      <Reveal delay={80}>
        <h2 className="mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-bold leading-[1.05] tracking-[-0.025em] text-ink">
          {title}
          {accent && <span className="text-gold"> {accent}</span>}
        </h2>
      </Reveal>

      {body && (
        <Reveal delay={140}>
          <p className="mt-5 text-base leading-relaxed text-muted">{body}</p>
        </Reveal>
      )}
    </div>
  );
}
