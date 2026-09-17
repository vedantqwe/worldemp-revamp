"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useContent } from "@/lib/content-context";

/**
 * The 2-6 week promise, drawn as a rail that fills as you scroll.
 *
 * This is the ScrollTrigger idea from the Webflow reference, done with
 * framer-motion's useScroll so we add no second animation library. The
 * spring keeps the fill from snapping on fast scrolls. Under reduced-motion
 * the rail is simply drawn full and the steps sit still.
 */
export function MethodTimeline() {
  const { c, href } = useContent();
  const { timeline } = c;
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 70%", "end 60%"],
  });
  const fill = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  return (
    <section id="method" className="relative overflow-hidden bg-we-indigo py-24 text-white sm:py-32">
      <div aria-hidden className="we-mesh absolute inset-0 opacity-70" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
              {c.mastheads.method.eyebrow}
            </p>
            <h2 className="mt-4 text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
              {timeline.heading}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-white/65">{timeline.body}</p>
          </Reveal>
        </div>

        <div ref={ref} className="relative mt-16 pl-8 sm:pl-0">
          {/* Rail track + scroll-driven fill */}
          <div
            aria-hidden
            className="absolute left-[7px] top-2 h-[calc(100%-1rem)] w-px bg-white/15 sm:left-1/2 sm:-translate-x-1/2"
          >
            <motion.div
              className="we-gradient h-full w-full origin-top"
              style={{ scaleY: reduce ? 1 : fill }}
            />
          </div>

          <ol className="space-y-12 sm:space-y-0">
            {timeline.steps.map((step, i) => {
              const left = i % 2 === 0;
              return (
                <li
                  key={step.week}
                  className={`relative sm:grid sm:grid-cols-2 sm:gap-12 ${
                    i > 0 ? "sm:-mt-6" : ""
                  }`}
                >
                  <span
                    aria-hidden
                    className="absolute -left-8 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-we-indigo bg-white sm:left-1/2 sm:-translate-x-1/2"
                  />
                  <motion.div
                    initial={{ opacity: 0, y: reduce ? 0 : 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-70px" }}
                    transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                    className={`pb-4 sm:pb-20 ${
                      left ? "sm:pr-12 sm:text-right" : "sm:col-start-2 sm:pl-12"
                    }`}
                  >
                    <p className="font-display text-sm font-semibold text-we-magenta">
                      {step.week}
                    </p>
                    <h3 className="mt-2 font-display text-xl text-white">{step.title}</h3>
                    <p
                      className={`mt-2 max-w-sm text-sm leading-relaxed text-white/60 ${
                        left ? "sm:ml-auto" : ""
                      }`}
                    >
                      {step.body}
                    </p>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>

        <Reveal className="mt-4 flex flex-wrap gap-4">
          <Link
            href={href(timeline.ctas[0].href)}
            className="group relative overflow-hidden rounded-full bg-white px-7 py-4 text-sm font-semibold text-we-indigo transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
              {timeline.ctas[0].label}
            </span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </Link>
          <Link
            href={href(timeline.ctas[1].href)}
            className="group inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-white transition-colors duration-300 hover:border-white/60 hover:bg-white/5"
          >
            {timeline.ctas[1].label}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
