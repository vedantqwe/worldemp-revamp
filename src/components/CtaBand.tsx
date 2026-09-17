"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useContent } from "@/lib/content-context";

/**
 * Closing conversion band. The gradient drifts slightly against the scroll
 * so the block feels anchored rather than pasted on.
 */
export function CtaBand() {
  const { c, href } = useContent();
  const { site, ctaBand } = c;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-we-indigo py-24 text-white sm:py-32">
      <motion.div
        aria-hidden
        style={{ y: reduce ? undefined : y }}
        className="we-mesh absolute inset-0 -z-10 scale-125"
      />
      <div className="mx-auto max-w-5xl px-5 text-center sm:px-8">
        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-balance font-display text-[clamp(2rem,5vw,3.75rem)] leading-[1.06]"
        >
          {ctaBand.heading}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65"
        >
          {ctaBand.body}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href={href("/contact")}
            className="group relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold text-we-indigo transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              {ctaBand.primary}
            </span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </Link>
          <a
            href={site.phoneHref}
            className="rounded-full border border-white/25 px-8 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
          >
            {site.phone}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
