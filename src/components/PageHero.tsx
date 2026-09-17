"use client";

import { RevealWords } from "@/components/ui/Reveal";
import { motion } from "framer-motion";

/**
 * Shared masthead for inner pages. Shorter than the homepage hero so the
 * content below starts above the fold, but on the same gradient mesh so the
 * pages read as one site.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-we-indigo pb-20 pt-40 text-white sm:pb-24 sm:pt-48">
      <div aria-hidden className="we-mesh absolute inset-0 -z-10" />
      <div aria-hidden className="we-grid-lines absolute inset-0 -z-10 opacity-50" />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta"
        >
          {eyebrow}
        </motion.p>
        <h1 className="mt-5 max-w-3xl text-balance font-display text-[clamp(2.2rem,5.5vw,4rem)] leading-[1.05]">
          <RevealWords text={title} delay={0.1} />
        </h1>
        {intro ? (
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-white/65"
          >
            {intro}
          </motion.p>
        ) : null}
      </div>
    </section>
  );
}
