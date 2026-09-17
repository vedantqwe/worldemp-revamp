"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { RevealWords } from "@/components/ui/Reveal";
import { hero } from "@/lib/content";

/**
 * Text-forward hero, after Accenture: no stock photograph competing with the
 * headline. Depth comes from the brand gradient mesh and a slow parallax
 * drift, so the type stays the loudest thing on the screen.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const meshY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "26%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative isolate flex min-h-[92vh] items-center overflow-hidden bg-we-indigo pt-32 pb-24 text-white"
    >
      <motion.div
        aria-hidden
        style={{ y: reduce ? undefined : meshY }}
        className="we-mesh absolute inset-0 -z-10 scale-125"
      />
      <div aria-hidden className="we-grid-lines absolute inset-0 -z-10 opacity-60" />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-b from-transparent to-we-void/70"
      />

      <motion.div
        style={reduce ? undefined : { y: contentY, opacity: contentOpacity }}
        className="mx-auto w-full max-w-7xl px-5 sm:px-8"
      >
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-white/80 backdrop-blur-sm"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-we-magenta opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-we-magenta" />
          </span>
          {hero.eyebrow}
        </motion.p>

        <h1 className="mt-7 max-w-4xl text-balance font-display text-[clamp(2.5rem,6.5vw,5.25rem)] font-semibold leading-[1.02]">
          <RevealWords text={hero.heading} delay={0.15} />
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-xl text-lg leading-relaxed text-white/70"
        >
          {hero.body}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center gap-4"
        >
          <Link
            href={hero.primaryCta.href}
            className="group relative overflow-hidden rounded-full bg-white px-7 py-4 text-sm font-semibold text-we-indigo transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              {hero.primaryCta.label}
            </span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
          >
            {hero.secondaryCta.label}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </motion.div>

        <motion.dl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 border-t border-white/15 pt-8 sm:grid-cols-4"
        >
          {hero.stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.85 + i * 0.08 }}
            >
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  {stat.value}
                </span>
                <span className="ml-1 text-sm font-medium text-we-magenta">{stat.unit}</span>
                <span className="mt-1.5 block text-xs leading-snug text-white/55">
                  {stat.label}
                </span>
              </dd>
            </motion.div>
          ))}
        </motion.dl>
      </motion.div>
    </section>
  );
}
