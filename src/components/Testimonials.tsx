"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { testimonials } from "@/lib/content";

const INTERVAL = 7000;

/**
 * Auto-rotating testimonials with an explicit play/pause control, the one
 * Accenture pattern worth copying wholesale: motion that moves on its own
 * must be stoppable. Rotation also halts on hover and on keyboard focus,
 * and never starts at all under reduced-motion.
 */
export function Testimonials() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);

  const go = useCallback((next: number) => {
    setIndex((next + testimonials.length) % testimonials.length);
  }, []);

  const running = playing && !paused && !reduce;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, INTERVAL);
    return () => clearInterval(id);
  }, [running]);

  const current = testimonials[index];

  return (
    <section
      className="bg-white py-24 sm:py-32"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
            Clients
          </p>
        </Reveal>

        <div className="relative mt-8 min-h-[16rem]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={index}
              initial={{ opacity: 0, y: reduce ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduce ? 0 : -18 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              aria-live="polite"
            >
              <blockquote className="text-balance font-display text-[clamp(1.35rem,3.2vw,2.35rem)] leading-[1.22] text-we-ink">
                {current.quote}
              </blockquote>
              <figcaption className="mt-8 text-sm text-we-muted">
                <span className="font-semibold text-we-ink">{current.name}</span>
                <span className="mx-2 text-we-line">|</span>
                {current.role}
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-5 border-t border-we-line pt-6">
          <button
            type="button"
            onClick={() => setPlaying((p) => !p)}
            aria-label={playing ? "Pause testimonials" : "Play testimonials"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-we-line text-we-ink transition-colors duration-300 hover:border-we-indigo hover:text-we-indigo"
          >
            <span aria-hidden className="text-xs">
              {playing ? "‖" : "▶"}
            </span>
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choose testimonial">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Testimonial ${i + 1} of ${testimonials.length}: ${t.name}`}
                onClick={() => go(i)}
                className="group relative h-8 px-1"
              >
                <span
                  className={`block h-0.5 rounded-full transition-all duration-500 ${
                    i === index ? "w-10 bg-we-indigo" : "w-5 bg-we-line group-hover:bg-we-muted"
                  }`}
                />
                {i === index && running ? (
                  <motion.span
                    key={`progress-${index}`}
                    aria-hidden
                    className="we-gradient absolute left-1 top-[15px] h-0.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "2.5rem" }}
                    transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                  />
                ) : null}
              </button>
            ))}
          </div>

          <span className="ml-auto text-xs tabular-nums text-we-muted">
            {String(index + 1).padStart(2, "0")} / {String(testimonials.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
