"use client";

import { RevealWords } from "@/components/ui/Reveal";
import { motion } from "framer-motion";

/**
 * Shared masthead for inner pages. Shorter than the homepage hero so the
 * content below starts above the fold, but on the same gradient mesh so the
 * pages read as one site.
 *
 * The top padding clears the 5rem fixed header with room to spare, so the eyebrow is
 * never tucked under the bar - on a long title the header goes to its solid
 * state as soon as the visitor scrolls, and the two never overlap.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  meta,
  tags,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  /** A date or other single line, shown under the title. */
  meta?: string;
  /** Content labels, shown beside the eyebrow. */
  tags?: string[];
}) {
  return (
    <section className="relative isolate overflow-hidden bg-we-indigo pb-14 pt-32 text-white sm:pb-20 sm:pt-36">
      <div aria-hidden className="we-mesh absolute inset-0 -z-10" />
      <div aria-hidden className="we-grid-lines absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap items-center gap-x-4 gap-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
            {eyebrow}
          </p>
          {tags?.length ? (
            <ul className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-white/25 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white/75"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </motion.div>
        <h1 className="mt-5 max-w-4xl text-balance font-display text-[clamp(2.1rem,5vw,3.75rem)] leading-[1.06]">
          <RevealWords text={title} delay={0.1} />
        </h1>
        {meta ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-5 text-sm text-white/55"
          >
            {meta}
          </motion.p>
        ) : null}
        {intro ? (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-white/65"
          >
            {intro}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
