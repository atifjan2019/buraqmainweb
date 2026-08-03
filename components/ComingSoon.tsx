import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "./Icons";

interface ComingSoonProps {
  eyebrow: string;
  title: string;
  body: string;
}

/**
 * Placeholder for routes that are designed but not built yet. Keeps the
 * navigation honest — nothing in the header leads to a 404.
 */
export default function ComingSoon({ eyebrow, title, body }: ComingSoonProps) {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  return (
    <section className="relative flex min-h-[80svh] items-center overflow-hidden pt-32 pb-24">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[45rem] w-[60rem] -translate-x-1/2 opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse, rgba(245,165,36,0.13) 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-3xl px-5 text-center sm:px-8">
        <span className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.24em] text-amber">
          <span className="h-px w-6 bg-amber/50" />
          {eyebrow}
          <span className="h-px w-6 bg-amber/50" />
        </span>

        <h1 className="mt-6 font-display text-[clamp(2.2rem,6vw,4rem)] font-bold leading-[1.03] tracking-[-0.03em] text-ink">
          {title}
        </h1>

        <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-muted">
          {body}
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber px-8 py-4 font-semibold text-canvas transition-all hover:bg-amber-bright hover:shadow-[0_0_40px_-8px_var(--color-amber)]"
          >
            Back to Home
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-line px-8 py-4 font-semibold text-ink transition-colors hover:border-amber/40 hover:text-amber"
            >
              <WhatsApp className="h-5 w-5" />
              WhatsApp Us
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
