import { clients } from "@/lib/content";

/**
 * Continuous client rail. The track holds the list twice and slides exactly
 * -50%, so the loop is seamless; the CSS pauses it under reduced-motion.
 * Set as wordmarks rather than logo files - the originals are low-resolution
 * CMS thumbnails, and clean type reads better than a rescaled PNG.
 */
export function LogoMarquee() {
  return (
    <section className="border-y border-we-line bg-white py-10" aria-label="Clients">
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.22em] text-we-muted">
        Trusted by teams across the Netherlands and beyond
      </p>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="we-marquee-track flex w-max items-center gap-14 group-hover:[animation-play-state:paused]">
          {[...clients, ...clients].map((name, i) => (
            <span
              key={`${name}-${i}`}
              aria-hidden={i >= clients.length}
              className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-we-ink/35 transition-colors duration-300 hover:text-we-indigo"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
