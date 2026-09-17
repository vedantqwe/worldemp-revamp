"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { nav, site } from "@/lib/content";

/**
 * Sticky header.
 *
 * Borrowed from Accenture: the sub-navigation is a full-width overlay panel
 * with grouped columns rather than a cramped dropdown, so a section with ten
 * children is as readable as one with two. Intent is tracked with a small
 * close delay so a diagonal mouse path to the panel does not dismiss it.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes whichever layer is open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Lock the page behind the mobile sheet.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Held in a ref: a plain local would be re-created each render, so the
  // pending timeout could never be cleared by a later cancelClose().
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };
  const cancelClose = () => clearTimeout(closeTimer.current);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const active = nav.find((item) => item.label === openMenu);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled || openMenu
          ? "bg-white/85 shadow-[0_1px_0_rgba(20,25,31,0.08)] backdrop-blur-xl"
          : "bg-transparent"
      }`}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href="/"
          className="relative z-10 shrink-0"
          aria-label={`${site.name} home`}
          onMouseEnter={() => setOpenMenu(null)}
        >
          <Image
            src="/brand/worldemp-logo.png"
            alt={site.name}
            width={298}
            height={137}
            priority
            className="h-9 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {nav.map((item) => {
            const isOpen = openMenu === item.label;
            return (
              <div key={item.label} onMouseEnter={() => { cancelClose(); setOpenMenu(item.children ? item.label : null); }}>
                <Link
                  href={item.href}
                  aria-expanded={item.children ? isOpen : undefined}
                  className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    isOpen ? "text-we-magenta" : "text-we-ink hover:text-we-indigo"
                  }`}
                >
                  {item.label}
                  {item.children ? (
                    <span
                      aria-hidden
                      className={`ml-1.5 inline-block text-[0.6rem] transition-transform duration-300 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    >
                      &#9662;
                    </span>
                  ) : null}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={site.phoneHref}
            className="text-sm font-medium text-we-muted transition-colors hover:text-we-indigo"
          >
            {site.phone}
          </a>
          <Link
            href="/contact"
            className="group relative overflow-hidden rounded-full bg-we-indigo px-5 py-2.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Schedule a meeting</span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          className="relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border border-we-line lg:hidden"
        >
          <span
            className={`block h-px w-5 bg-we-ink transition-transform duration-300 ${
              mobileOpen ? "translate-y-[3px] rotate-45" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-we-ink transition-transform duration-300 ${
              mobileOpen ? "-translate-y-[3px] -rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {/* Desktop mega-panel */}
      <AnimatePresence>
        {active?.children ? (
          <motion.div
            key={active.label}
            initial={{ opacity: 0, y: reduce ? 0 : -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: reduce ? 0 : -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="hidden border-t border-we-line/70 bg-white/95 backdrop-blur-xl lg:block"
            onMouseEnter={cancelClose}
          >
            <div className="mx-auto grid max-w-7xl gap-8 px-8 py-10 md:grid-cols-[minmax(0,1fr)_2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-we-magenta">
                  {active.label}
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-we-muted">
                  {site.mission}
                </p>
                <Link
                  href={active.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-we-indigo"
                >
                  Overview
                  <span aria-hidden>&rarr;</span>
                </Link>
              </div>
              <ul className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
                {active.children.map((child, i) => (
                  <motion.li
                    key={child.href}
                    initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.04 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Link
                      href={child.href}
                      className="group block rounded-2xl px-4 py-3 transition-colors hover:bg-we-paper"
                      onClick={() => setOpenMenu(null)}
                    >
                      <span className="flex items-center gap-2 text-sm font-semibold text-we-ink group-hover:text-we-indigo">
                        {child.label}
                        <span
                          aria-hidden
                          className="translate-x-0 text-we-magenta opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
                        >
                          &rarr;
                        </span>
                      </span>
                      {child.blurb ? (
                        <span className="mt-0.5 block text-xs leading-relaxed text-we-muted">
                          {child.blurb}
                        </span>
                      ) : null}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Mobile sheet */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-20 overflow-y-auto bg-white px-5 pb-16 pt-6 lg:hidden"
          >
            <ul className="divide-y divide-we-line">
              {nav.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="py-4"
                >
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="font-display text-xl font-semibold text-we-ink"
                  >
                    {item.label}
                  </Link>
                  {item.children ? (
                    <ul className="mt-2 space-y-1.5 pl-1">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="text-sm text-we-muted"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </motion.li>
              ))}
            </ul>
            <Link
              href="/contact"
              onClick={() => setMobileOpen(false)}
              className="we-gradient mt-8 block rounded-full px-6 py-4 text-center font-semibold text-white"
            >
              Schedule a meeting
            </Link>
            <a
              href={site.phoneHref}
              className="mt-4 block text-center text-sm text-we-muted"
            >
              {site.phone}
            </a>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
