"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { specialisations } from "@/lib/content";

/**
 * Four disciplines as expanding rows, after Accenture's toggle-card pattern:
 * a summary state that scans in one pass, and a detail state that opens in
 * place. One row is open at a time so the section never becomes a wall of
 * job titles. Rows are real buttons, so keyboard and screen-reader users get
 * the same behaviour as a pointer.
 */
export function Specialisations() {
  const [openId, setOpenId] = useState<string>(specialisations[0].id);
  const reduce = useReducedMotion();

  return (
    <section id="solutions" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
            Solutions
          </p>
          <h2 className="mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3.25rem)] leading-[1.08]">
            Which specialization is relevant for my company?
          </h2>
        </Reveal>

        <div className="mt-14 divide-y divide-we-line border-y border-we-line">
          {specialisations.map((spec, i) => {
            const isOpen = openId === spec.id;
            return (
              <Reveal key={spec.id} delay={i * 0.05} y={16}>
                <div id={spec.id} className="scroll-mt-28">
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? "" : spec.id)}
                      aria-expanded={isOpen}
                      aria-controls={`panel-${spec.id}`}
                      className="group flex w-full items-center justify-between gap-6 py-7 text-left"
                    >
                      <span className="flex items-baseline gap-5">
                        <span className="font-display text-xs font-semibold text-we-muted">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className={`font-display text-[clamp(1.5rem,3.2vw,2.5rem)] leading-none transition-colors duration-300 ${
                            isOpen ? "we-gradient-text" : "text-we-ink group-hover:text-we-indigo"
                          }`}
                        >
                          {spec.name}
                        </span>
                      </span>
                      <span className="flex items-center gap-4">
                        <span className="hidden text-xs font-medium text-we-muted sm:block">
                          {spec.roles.length} roles
                        </span>
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
                        <div className="grid gap-8 pb-10 md:grid-cols-[minmax(0,1fr)_1.25fr]">
                          <p className="max-w-md text-sm leading-relaxed text-we-muted">
                            {spec.body}
                          </p>
                          <ul className="flex flex-wrap gap-2 self-start">
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
