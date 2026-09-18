"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useContent } from "@/lib/content-context";

/**
 * The five pillars as an asymmetric bento grid rather than five identical
 * cards. Unequal cells give the eye an order to read in, which a uniform row
 * of five does not. Each card lifts and reveals a hairline gradient edge on
 * hover - the only decoration it gets.
 *
 * The asymmetry is in the width and not the height. A double-height cell was
 * the obvious way to build a bento and the wrong one here: all five pillars
 * carry two lines of copy, so the tall card spent half its height empty with
 * its title stranded at the bottom. Two wide cards over three narrow ones
 * gives the same reading order out of rows that end where the words do.
 */

const spans = [
  "md:col-span-3",
  "md:col-span-3",
  "md:col-span-2",
  "md:col-span-2",
  "md:col-span-2",
];

export function AllInConcept() {
  const { c, href } = useContent();
  const { allInConcept } = c;

  return (
    <section id="concept" className="bg-we-paper py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
              {c.labels.allInConceptEyebrow}
            </p>
            <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
              {allInConcept.heading}
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <Link
              href={href(allInConcept.cta.href)}
              className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-we-indigo/25 px-6 py-3 text-sm font-semibold text-we-indigo transition-colors duration-300 hover:bg-we-indigo hover:text-white"
            >
              {allInConcept.cta.label}
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </Reveal>
        </div>

        {/* auto-rows-fr so the cards in a row match each other, rather than
            every row matching the tallest card on the page. */}
        <div className="mt-14 grid auto-rows-fr grid-cols-1 gap-4 md:grid-cols-6">
          {allInConcept.pillars.map((pillar, i) => (
            <motion.article
              key={pillar.title}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.65, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              className={`group relative flex flex-col overflow-hidden rounded-3xl border border-we-line bg-white p-7 transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_60px_-24px_rgba(21,9,88,0.35)] ${spans[i] ?? ""}`}
            >
              <span
                aria-hidden
                className="we-gradient absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
              />
              <span className="font-display text-sm font-semibold text-we-magenta">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-6">
                <h3 className="font-display text-xl leading-snug text-we-ink">{pillar.title}</h3>
                <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-we-muted">
                  {pillar.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
