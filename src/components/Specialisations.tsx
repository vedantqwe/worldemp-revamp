"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { useContent } from "@/lib/content-context";

/**
 * Four disciplines as expanding rows, after Accenture's toggle-card pattern:
 * a summary state that scans in one pass, and a detail state that opens in
 * place. One row is open at a time so the section never becomes a wall of
 * job titles. Rows are real buttons, so keyboard and screen-reader users get
 * the same behaviour as a pointer.
 *
 * Layout: the row and the panel below it share one grid, so the index, the
 * discipline name and the body copy all sit on the same three vertical
 * lines. Aligning the panel to the container instead left the body copy
 * hanging under the index number rather than under the name it describes.
 */

/** Index column, discipline, then the roles column. Shared by row and panel. */
const GRID = "grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 md:grid-cols-[3.5rem_minmax(0,22rem)_minmax(0,1fr)] md:gap-x-10";

export function Specialisations() {
  const { c, t, href } = useContent();
  const { specialisations, specialisationsIntro } = c;
  const [openId, setOpenId] = useState<string>(specialisations[0].id);
  const reduce = useReducedMotion();

  return (
    <section id="solutions" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
            {specialisationsIntro.eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
            {specialisationsIntro.heading}
          </h2>
        </Reveal>

        <div className="mt-14 divide-y divide-we-line border-y border-we-line">
          {specialisations.map((spec, i) => {
            const isOpen = openId === spec.id;
            const roleCount = `${spec.roles.length} ${
              spec.roles.length === 1 ? t.rolesOne : t.roles
            }`;

            return (
              <Reveal key={spec.id} delay={i * 0.05} y={16}>
                <div id={spec.id} className="scroll-mt-28">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? "" : spec.id)}
                      aria-expanded={isOpen}
                      aria-controls={`panel-${spec.id}`}
                      className={`group w-full py-7 text-left ${GRID} items-center`}
                    >
                      <span className="font-display text-xs font-semibold text-we-muted">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-none transition-colors duration-300 ${
                          isOpen
                            ? "we-gradient-text"
                            : "text-we-ink group-hover:text-we-indigo"
                        }`}
                      >
                        {spec.name}
                      </span>
                      {/* Sits in the roles column on desktop, so the count and
                          the toggle line up with the chips they control. */}
                      <span className="col-start-2 row-start-2 mt-3 flex items-center gap-4 md:col-start-3 md:row-start-1 md:mt-0 md:justify-end">
                        <span className="text-xs font-medium text-we-muted">{roleCount}</span>
                        <span
                          aria-hidden
                          className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-400 ${
                            isOpen
                              ? "border-transparent bg-we-indigo text-white"
                              : "border-we-line text-we-ink group-hover:border-we-indigo/40"
                          }`}
                        >
                          <span className="absolute h-px w-3.5 bg-current" />
                          <span
                            className={`absolute h-3.5 w-px bg-current transition-transform duration-400 ${
                              isOpen ? "scale-y-0" : "scale-y-100"
                            }`}
                          />
                        </span>
                      </span>
                    </button>
                  </h3>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        id={`panel-${spec.id}`}
                        key="panel"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduce ? 0.15 : 0.5,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className={`${GRID} pb-10`}>
                          {/* Empty index cell keeps the body copy under the
                              discipline name, not under the number. */}
                          <div aria-hidden className="hidden md:block" />
                          <div className="col-start-2 md:col-start-2">
                            <p className="text-sm leading-relaxed text-we-muted">{spec.body}</p>
                            <Link
                              href={href(`/solutions/${spec.id}`)}
                              className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-we-indigo"
                            >
                              {t.overview}
                              <span
                                aria-hidden
                                className="transition-transform duration-300 group-hover:translate-x-1"
                              >
                                &rarr;
                              </span>
                            </Link>
                          </div>
                          <ul className="col-start-2 mt-8 flex flex-wrap gap-2 self-start md:col-start-3 md:mt-0">
                            {spec.roles.map((role, r) => (
                              <motion.li
                                key={role}
                                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.35,
                                  delay: reduce ? 0 : 0.04 * r,
                                }}
                              >
                                <span className="inline-block cursor-default rounded-full border border-we-line bg-we-paper px-4 py-2 text-sm text-we-ink transition-all duration-300 hover:-translate-y-0.5 hover:border-we-magenta/40 hover:bg-white hover:text-we-magenta">
                                  {role}
                                </span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
