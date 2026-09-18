"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useContent } from "@/lib/content-context";

/**
 * Oversized pull quote, closed as well as opened.
 *
 * Both marks are decorative and hidden from the accessibility tree - the
 * blockquote already carries the semantics, and a screen reader announcing
 * two stray quotation marks around it helps nobody. The closing one is the
 * same size, weight and gradient as the opening one, set on the trailing edge
 * so the quote reads as a closed shape rather than something left open.
 */
export function FounderQuote() {
  const { c, t } = useContent();
  const { founderQuote } = c;

  return (
    <section className="bg-we-paper py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
        <Reveal>
          <span
            aria-hidden
            className="we-gradient-text block font-display text-7xl leading-none"
          >
            &ldquo;
          </span>
          <blockquote className="mt-2 text-balance font-display text-[clamp(1.5rem,3.6vw,2.75rem)] leading-[1.18] text-we-ink">
            {founderQuote.quote}
          </blockquote>
          <span
            aria-hidden
            className="we-gradient-text mt-3 block font-display text-7xl leading-none"
          >
            &rdquo;
          </span>
          <figcaption className="mt-5 text-sm text-we-muted">
            <span className="font-semibold text-we-ink">{founderQuote.name}</span>
            <span className="mx-2 text-we-line">|</span>
            {founderQuote.role}
          </figcaption>
          {/* His own address, as the live team page publishes it - a quote from
              the founder invites a reply, and the reply should not have to go
              through the general inbox. */}
          <a
            href={`mailto:${founderQuote.email}`}
            className="group mt-5 inline-flex items-center gap-2 rounded-full border border-we-indigo/25 px-5 py-2.5 text-sm font-semibold text-we-indigo transition-colors duration-300 hover:bg-we-indigo hover:text-white"
          >
            {t.mailFounder} {founderQuote.name.split(" ")[0]}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5">
              &rarr;
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * The cost claim, with the headline number counting up once it is on screen.
 * The count is the only number that animates on the page - used twice it
 * would read as a gimmick.
 */
export function CostAndRate() {
  const { c } = useContent();
  const { allInRate, costs } = c;

  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const reduce = useReducedMotion();

  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div ref={ref}>
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
              {c.labels.propositionEyebrow}
            </p>
            <h2 className="mt-4 text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
              {costs.heading}
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-we-muted">{costs.body}</p>
          </Reveal>

          <div className="mt-12 flex items-end gap-3">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="we-gradient-text font-display text-[clamp(4rem,11vw,8rem)] font-semibold leading-none"
            >
              {reduce ? "40-70" : <CountUp to={70} from={40} active={inView} />}
            </motion.span>
            <span className="we-gradient-text pb-3 font-display text-3xl font-semibold">%</span>
            <span className="pb-4 text-sm leading-snug text-we-muted">
              lower
              <br />
              labour costs
            </span>
          </div>
        </div>

        <Reveal delay={0.12}>
          <div className="relative overflow-hidden rounded-3xl border border-we-line bg-we-paper p-8 sm:p-10">
            <span aria-hidden className="we-gradient absolute inset-x-0 top-0 h-1" />
            <h3 className="font-display text-2xl leading-snug text-we-ink">
              {allInRate.heading}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-we-muted">{allInRate.body}</p>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-we-indigo">
              What is included
            </p>
            <ul className="mt-4 space-y-2.5">
              {allInRate.includes.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-start gap-3 text-sm text-we-ink"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-we-indigo text-[9px] font-bold text-white"
                  >
                    &#10003;
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Counts both bounds of the "40-70" range up together, once, on entry.
 * Driven by requestAnimationFrame rather than a library so it costs nothing
 * extra, and it renders the final value immediately when inactive so the
 * number is correct with JS disabled or motion reduced.
 */
function CountUp({ from, to, active }: { from: number; to: number; active: boolean }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!active) return;

    let frame = 0;
    const duration = 1400;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      // easeOutExpo, matching the section's other transitions
      setProgress(t === 1 ? 1 : 1 - Math.pow(2, -10 * t));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active]);

  const lower = Math.round(from * progress);
  const upper = Math.round(to * progress);

  return (
    <span>
      {lower}-{upper}
    </span>
  );
}

/**
 * WorldEmp versus traditional hiring. A real <table> - this is tabular data,
 * and a grid of divs would lose the row/column relationship for screen
 * readers. Rows stagger in as the table enters the viewport.
 */
export function Comparison() {
  const { c } = useContent();
  const { comparison } = c;

  return (
    <section className="bg-we-paper py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-5 sm:px-8">
        <Reveal>
          <h2 className="max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
            {comparison.heading}
          </h2>
        </Reveal>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left">
            <caption className="sr-only">{comparison.heading}</caption>
            <thead>
              <tr className="border-b border-we-line">
                <th scope="col" className="py-4 pr-4 text-xs font-semibold uppercase tracking-[0.16em] text-we-muted">
                  &nbsp;
                </th>
                <th scope="col" className="py-4 pr-4 text-xs font-semibold uppercase tracking-[0.16em] text-we-indigo">
                  {comparison.columns.worldemp}
                </th>
                <th scope="col" className="py-4 text-xs font-semibold uppercase tracking-[0.16em] text-we-muted">
                  {comparison.columns.traditional}
                </th>
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, i) => (
                <motion.tr
                  key={row.point}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="border-b border-we-line align-top"
                >
                  <th scope="row" className="py-6 pr-4 font-display text-base font-semibold text-we-ink">
                    {row.point}
                  </th>
                  <td className="py-6 pr-4 text-sm leading-relaxed text-we-ink">
                    <span className="flex gap-2.5">
                      <span aria-hidden className="mt-0.5 text-we-indigo">&#10003;</span>
                      {row.worldemp}
                    </span>
                  </td>
                  <td className="py-6 text-sm leading-relaxed text-we-muted">
                    {row.traditional}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
