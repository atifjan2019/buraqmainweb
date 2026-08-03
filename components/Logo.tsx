import Image from "next/image";

/**
 * The winged-horse (Buraq) emblem from the dealership's logo, recoloured for
 * the dark canvas by scripts/build-brand-assets.mjs, paired with a typeset
 * wordmark so it stays crisp at small sizes.
 */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`}>
      <Image
        src="/brand/mark-amber.png"
        alt=""
        width={256}
        height={134}
        priority
        className="h-9 w-auto transition-transform duration-500 group-hover:scale-105"
      />
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-semibold tracking-tight text-ink">
          BURRAQ
        </span>
        <span className="text-[0.62rem] font-medium tracking-[0.32em] text-amber">
          MOTORS
        </span>
      </span>
    </span>
  );
}
