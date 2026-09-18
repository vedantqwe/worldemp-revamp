"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  /** Seconds of delay, for staggering siblings. */
  delay?: number;
  /** Distance travelled on entry, in px. */
  y?: number;
  className?: string;
};

/**
 * Scroll-triggered entrance. Fires once, and collapses to a plain fade
 * when the visitor has asked for reduced motion.
 */
export function Reveal({ children, delay = 0, y = 24, className }: RevealProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: reduce ? 0.2 : 0.7,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * A picture arriving.
 *
 * The frame slides and fades like anything else, but the image inside it also
 * settles back from a slight enlargement, so the picture resolves into its
 * frame rather than appearing in it. It is the one piece of motion on a
 * content page, which is why it can afford to be a little slower than the
 * text it sits beside.
 *
 * Under reduced motion it is a plain fade: no travel, no scale.
 */
export function RevealFigure({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: reduce ? 0.2 : 0.9,
        delay: reduce ? 0 : delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        initial={{ scale: reduce ? 1 : 1.06 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{
          duration: reduce ? 0 : 1.2,
          delay: reduce ? 0 : delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * Splits a heading into words and lifts them in sequence. Used sparingly -
 * once per page at most, on the element the eye lands on first.
 */
export function RevealWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  if (reduce) {
    return <span className={className}>{text}</span>;
  }

  return (
    <>
      {/* The animated copy is split across per-word spans, which is awkward to
          announce. Assistive tech gets the whole string once, instead. */}
      <span className="sr-only">{text}</span>
      <span className={className} aria-hidden>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
            <motion.span
              // Server-rendered at opacity 0; the no-JS rule in layout.tsx
              // forces these visible so the headline is never blank.
              className="we-reveal-word inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: delay + i * 0.06,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {word}
              {i < words.length - 1 ? " " : ""}
            </motion.span>
          </span>
        ))}
      </span>
    </>
  );
}
