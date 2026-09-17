"use client";

import Image from "next/image";
import { useContent } from "@/lib/content-context";
import { clientLogos } from "@/lib/site";

/**
 * Continuous client rail. The track holds the list twice and slides exactly
 * -50%, so the loop is seamless; the CSS pauses it under reduced-motion and
 * on hover.
 *
 * The logos are the real marks, migrated from the CMS. They arrive in every
 * shape and weight a logo can be, so each sits in a fixed-height box and is
 * set greyscale at rest - the same treatment the live site uses - which stops
 * one saturated logo from dominating the rail.
 */
export function LogoMarquee() {
  const { c } = useContent();

  // Falls back to plain wordmarks until the crawl has supplied real logos.
  const names = clientLogos.length ? null : c.clients;

  return (
    <section className="border-y border-we-line bg-white py-10" aria-label={c.labels.clientsLabel}>
      <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.22em] text-we-muted">
        {c.labels.marquee}
      </p>
      <div className="group relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <ul className="we-marquee-track flex w-max items-center gap-14 group-hover:[animation-play-state:paused]">
          {/* The list is rendered twice: the track slides exactly -50%, so
              the second copy is what makes the loop seamless. */}
          {[0, 1].flatMap((copy) =>
            names
              ? names.map((name) => (
                  <li
                    key={`${name}-${copy}`}
                    aria-hidden={copy === 1}
                    className="flex h-12 shrink-0 items-center"
                  >
                    <span className="whitespace-nowrap font-display text-lg font-semibold tracking-tight text-we-ink/35 transition-colors duration-300 hover:text-we-indigo">
                      {name}
                    </span>
                  </li>
                ))
              : clientLogos.map((logo) => (
                  <li
                    key={`${logo.src}-${copy}`}
                    aria-hidden={copy === 1}
                    className="flex h-12 shrink-0 items-center"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.name}
                      width={logo.width}
                      height={logo.height}
                      sizes="160px"
                      className="h-full w-auto max-w-[10rem] object-contain opacity-60 grayscale transition-all duration-500 hover:opacity-100 hover:grayscale-0"
                    />
                  </li>
                )),
          )}
        </ul>
      </div>
    </section>
  );
}
