import type { ReactNode } from "react";

interface LegalPageProps {
  eyebrow: string;
  title: string;
  updated: string;
  intro: string;
  children: ReactNode;
}

/**
 * Shared shell for the long-form legal documents. Deliberately plain and
 * high-contrast — these pages are read, not admired, and regulators expect
 * them to be easy to find and easy to follow.
 */
export default function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: LegalPageProps) {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line-soft pt-36 pb-14">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[34rem] w-[54rem] -translate-x-1/2 opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse, rgba(245,165,36,0.10) 0%, transparent 65%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-5 sm:px-8">
          <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber">
            <span className="h-px w-6 bg-amber/50" />
            {eyebrow}
          </span>
          <h1 className="mt-5 font-display text-[clamp(2rem,5vw,3.4rem)] font-bold leading-[1.04] tracking-[-0.03em] text-ink">
            {title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{intro}</p>
          <p className="mt-6 text-xs text-faint">Last updated: {updated}</p>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div
          className="mx-auto max-w-3xl px-5 text-[0.95rem] leading-relaxed text-muted sm:px-8
            [&_a]:text-amber [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-amber-bright
            [&_h2]:mt-14 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink
            [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink
            [&_li]:mt-2 [&_li]:pl-1
            [&_p]:mt-4
            [&_strong]:text-ink
            [&_table]:mt-5 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
            [&_td]:border-t [&_td]:border-line-soft [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top
            [&_th]:border-b [&_th]:border-line [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_th]:font-semibold [&_th]:text-ink
            [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-5"
        >
          {children}
        </div>
      </section>
    </>
  );
}
