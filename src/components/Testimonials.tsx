"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useContent } from "@/lib/content-context";
import { testimonialsFor, type Testimonial } from "@/lib/site";

const INTERVAL = 6000;

/**
 * Client stories as a sliding rail of cards, after the live site: portrait,
 * quote, attribution, several in view at once so the wall of quotes reads as
 * a body of evidence rather than one testimonial at a time.
 *
 * It advances on its own, and the Accenture rule still holds - motion that
 * moves by itself must be stoppable - so there is an explicit play/pause
 * alongside the arrows, and it halts on hover and on keyboard focus. Under
 * reduced-motion it never starts, and the track jumps instead of sliding.
 */
export function Testimonials() {
  const { c, t, locale } = useContent();
  const reduce = useReducedMotion();

  // Migrated quotes carry portraits; the hand-authored ones in content.ts are
  // the fallback for a locale the crawl found none for.
  const items = useMemo<Testimonial[]>(() => {
    const crawled = testimonialsFor(locale);
    if (crawled.length) return crawled;
    return c.testimonials.map((quote) => ({ ...quote, portrait: null }));
  }, [c.testimonials, locale]);

  const perView = usePerView();
  const maxIndex = Math.max(0, items.length - perView);
  const [rawIndex, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);

  // A narrower viewport shows fewer cards, so a stored index can fall off the
  // end of the track. Clamped on read rather than corrected in an effect, so
  // a resize never costs a second render.
  const index = Math.min(rawIndex, maxIndex);

  const go = useCallback(
    (next: number) => {
      if (maxIndex === 0) return;
      setIndex(((next % (maxIndex + 1)) + maxIndex + 1) % (maxIndex + 1));
    },
    [maxIndex],
  );

  const running = playing && !paused && !reduce && maxIndex > 0;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setIndex((i) => (i >= maxIndex ? 0 : i + 1));
    }, INTERVAL);
    return () => clearInterval(id);
  }, [running, maxIndex]);

  if (!items.length) return null;

  return (
    <section
      className="overflow-hidden bg-we-paper py-24 sm:py-32"
      aria-roledescription="carousel"
      aria-label={c.testimonialsIntro.heading}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
            {c.testimonialsIntro.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
            {c.testimonialsIntro.heading}
          </h2>
        </Reveal>

        <div className="relative mt-14">
          {/* The track is wider than the frame; only the frame clips. */}
          <div className="overflow-hidden">
            <motion.ul
              className="flex items-stretch"
              animate={{ x: `-${index * (100 / perView)}%` }}
              transition={
                reduce
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 60, damping: 18, mass: 0.9 }
              }
            >
              {items.map((item, i) => (
                <li
                  key={`${item.name}-${i}`}
                  className="w-full shrink-0 px-3 first:pl-0 last:pr-0 sm:w-1/2 lg:w-1/3"
                  aria-hidden={i < index || i >= index + perView}
                >
                  <TestimonialCard item={item} />
                </li>
              ))}
            </motion.ul>
          </div>

          {maxIndex > 0 ? (
            <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-we-line pt-6">
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-label={`${playing ? "Pause" : "Play"} - ${c.testimonialsIntro.heading}`}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-we-line bg-white text-we-ink transition-colors duration-300 hover:border-we-indigo hover:text-we-indigo"
              >
                <span aria-hidden className="text-xs">
                  {playing ? "‖" : "▶"}
                </span>
              </button>

              <div className="flex items-center gap-2" role="tablist" aria-label={c.testimonialsIntro.heading}>
                {Array.from({ length: maxIndex + 1 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === index}
                    aria-label={`${i + 1} / ${maxIndex + 1}`}
                    onClick={() => go(i)}
                    className="group h-8 px-1"
                  >
                    <span
                      className={`block h-0.5 rounded-full transition-all duration-500 ${
                        i === index ? "w-10 bg-we-indigo" : "w-5 bg-we-line group-hover:bg-we-muted"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-3">
                <Arrow direction="prev" onClick={() => go(index - 1)} label={t.previous} />
                <Arrow direction="next" onClick={() => go(index + 1)} label={t.next} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-we-line bg-white p-8 transition-shadow duration-500 hover:shadow-[0_20px_60px_-24px_rgba(21,9,88,0.3)]">
      {item.portrait ? (
        <Image
          src={item.portrait.src}
          alt=""
          width={item.portrait.width}
          height={item.portrait.height}
          sizes="112px"
          className="h-28 w-28 rounded-2xl object-cover"
        />
      ) : (
        <span
          aria-hidden
          className="we-gradient flex h-28 w-28 items-center justify-center rounded-2xl font-display text-2xl font-semibold text-white"
        >
          {item.name.charAt(0)}
        </span>
      )}
      {/* Opened and closed, like every other quotation on the site. Both
          marks are decorative - the blockquote carries the semantics, and a
          screen reader announcing two stray quotation marks helps nobody. */}
      <blockquote className="mt-7 flex-1 text-[0.975rem] leading-relaxed text-we-ink/80">
        <span aria-hidden className="we-gradient-text mr-1 align-[-0.3em] font-display text-2xl leading-none">
          &ldquo;
        </span>
        {item.quote}
        <span aria-hidden className="we-gradient-text ml-1 align-[-0.35em] font-display text-2xl leading-none">
          &rdquo;
        </span>
      </blockquote>
      <figcaption className="mt-7 border-t border-we-line pt-5 text-sm">
        <span className="block font-display font-semibold text-we-ink">{item.name}</span>
        {item.role ? <span className="mt-0.5 block text-we-muted">{item.role}</span> : null}
      </figcaption>
    </figure>
  );
}

function Arrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="group flex h-11 w-11 items-center justify-center rounded-full border border-we-line bg-white text-we-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-we-indigo hover:text-white"
    >
      <span
        aria-hidden
        className={`transition-transform duration-300 ${
          direction === "next" ? "group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
        }`}
      >
        {direction === "next" ? "→" : "←"}
      </span>
    </button>
  );
}

/** 1 card on phones, 2 on tablets, 3 on desktop. */
function usePerView(): number {
  const [perView, setPerView] = useState(1);

  useEffect(() => {
    const queries = [
      { mq: window.matchMedia("(min-width: 1024px)"), value: 3 },
      { mq: window.matchMedia("(min-width: 640px)"), value: 2 },
    ];
    const update = () => setPerView(queries.find((q) => q.mq.matches)?.value ?? 1);
    update();
    queries.forEach((q) => q.mq.addEventListener("change", update));
    return () => queries.forEach((q) => q.mq.removeEventListener("change", update));
  }, []);

  return perView;
}

