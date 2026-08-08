import Image from "next/image";
import Link from "next/link";
import { whatsappLink } from "@/lib/site";
import { ArrowRight, WhatsApp } from "./Icons";
import Reveal from "./Reveal";

/** Pre-footer band. Photography, not a gradient — see the note below. */
const CTA_IMAGE = "/cars/111-audi-a3-sedan-quattro/06.jpeg";

/**
 * `cta-band-photo` from DESIGN-bmw-m.md: a full-bleed photograph with the
 * headline and a primary-outline button over it, at 80px vertical padding. The
 * doc's phrasing is that the CTA inherits the page's editorial gravity through
 * photography rather than through chrome — which is why the amber radial bloom
 * that used to fill this band is gone rather than restyled.
 *
 * The copy sits in a solid canvas panel rather than directly on the image. On a
 * white surface, black centred type over a photograph needs a scrim heavy
 * enough to erase the car; a panel keeps the photograph at full strength and
 * keeps the type at full contrast, and the band still reads as photography
 * because the image runs edge to edge behind it.
 */
export default function CtaBanner() {
  const wa = whatsappLink("Hi Burraq Motors, I'm looking for a car.");

  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <Image
          src={CTA_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="mx-auto max-w-[90rem] px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl bg-canvas px-6 py-16 text-center sm:px-14">
          <Reveal>
            <span className="eyebrow eyebrow-center justify-center">
              Ready when you are
            </span>
          </Reveal>

          <Reveal delay={90}>
            <h2 className="display-md mt-6 text-ink">
              Ready to find your next car?
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <p className="mx-auto mt-6 max-w-xl text-base font-light leading-relaxed text-muted">
              Browse our collection of premium Japanese imports and find the
              vehicle that fits you. Nationwide delivery available.
            </p>
          </Reveal>

          <Reveal delay={210}>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cars" className="btn btn-solid">
                Browse All Cars
                <ArrowRight className="h-4 w-4" />
              </Link>
              {wa ? (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <WhatsApp className="h-5 w-5" />
                  WhatsApp Us
                </a>
              ) : (
                <Link href="/contact" className="btn btn-outline">
                  Contact Us
                </Link>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
