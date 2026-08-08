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
 *
 * The mood-lighting bloom that used to sit behind the headline is gone: the
 * doc's Don't list rules out gradient backdrops behind display type, and the
 * page floor stays plain canvas.
 */
export default function ComingSoon({ eyebrow, title, body }: ComingSoonProps) {
  const wa = whatsappLink("Hi Burraq Motors, I'd like to enquire about a car.");

  return (
    <section className="flex min-h-[80svh] items-center bg-canvas pt-32 pb-24">
      <div className="mx-auto w-full max-w-3xl px-5 text-center sm:px-8">
        <span className="eyebrow eyebrow-center justify-center">{eyebrow}</span>

        <h1 className="display-lg mt-8 text-ink">{title}</h1>

        <p className="mx-auto mt-6 max-w-lg text-base font-light leading-relaxed text-muted">
          {body}
        </p>

        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="btn btn-solid">
            Back to Home
            <ArrowRight className="h-4 w-4" />
          </Link>
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
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
