"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { useContent } from "@/lib/content-context";
import { locales, localeNames, switchLocalePath } from "@/lib/i18n";

/**
 * Sticky header.
 *
 * Borrowed from Accenture: the sub-navigation is a full-width overlay panel
 * with grouped columns rather than a cramped dropdown, so a section with ten
 * children is as readable as one with two. Intent is tracked with a small
 * close delay so a diagonal mouse path to the panel does not dismiss it.
 *
 * Every page opens on a dark hero (Hero on the homepage, PageHero everywhere
 * else), so at the top of the page the bar is transparent and draws itself in
 * white. Once it has a surface under it - scrolled, or a panel open - it
 * flips to the brand logo and ink text. Both states are decided during
 * render, not in an effect, so the first paint is never dark-on-dark.
 */
export function Header() {
  const { c, t, href, locale } = useContent();
  const pathname = usePathname();
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

  // A route change should never leave a panel hanging open. Adjusted during
  // render rather than in an effect, so the new page never paints with the
  // previous page's menu still over it.
  const [renderedPath, setRenderedPath] = useState(pathname);
  if (renderedPath !== pathname) {
    setRenderedPath(pathname);
    setOpenMenu(null);
    setMobileOpen(false);
  }

  // Held in a ref: a plain local would be re-created each render, so the
  // pending timeout could never be cleared by a later cancelClose().
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const scheduleClose = () => {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };
  const cancelClose = () => clearTimeout(closeTimer.current);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const active = c.nav.find((item) => item.label === openMenu);
  /** True once the bar has its own background; false while it floats on the hero. */
  const onSurface = scrolled || Boolean(openMenu) || mobileOpen;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        onSurface
          ? "bg-white/85 text-we-ink shadow-[0_1px_0_rgba(20,25,31,0.08)] backdrop-blur-xl"
          : "bg-transparent text-white"
      }`}
      onMouseLeave={scheduleClose}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
        <Link
          href={href("/")}
          className="relative z-10 shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current"
          aria-label={`${c.site.name} - ${t.home}`}
          onMouseEnter={() => setOpenMenu(null)}
        >
          <Logo
            height={34}
            tone={onSurface ? "brand" : "inverse"}
            title={c.site.name}
            className="transition-opacity duration-300"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t.mainNav}>
          {c.nav.map((item) => {
            const isOpen = openMenu === item.label;
            return (
              <div
                key={item.label}
                onMouseEnter={() => {
                  cancelClose();
                  setOpenMenu(item.children ? item.label : null);
                }}
              >
                <Link
                  href={href(item.href)}
                  aria-expanded={item.children ? isOpen : undefined}
                  className={`relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors ${
                    isOpen
                      ? "text-we-magenta"
                      : onSurface
                        ? "text-we-ink hover:text-we-indigo"
                        : "text-white/85 hover:text-white"
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
          <LocaleSwitch pathname={pathname} onSurface={onSurface} label={t.language} />
          <a
            href={c.site.phoneHref}
            className={`text-sm font-medium transition-colors ${
              onSurface ? "text-we-muted hover:text-we-indigo" : "text-white/70 hover:text-white"
            }`}
          >
            {c.site.phone}
          </a>
          <Link
            href={href("/contact")}
            className={`group relative overflow-hidden rounded-full px-5 py-2.5 text-sm font-semibold transition-transform duration-300 hover:-translate-y-0.5 ${
              onSurface ? "bg-we-indigo text-white" : "bg-white text-we-indigo"
            }`}
          >
            <span className="relative z-10 transition-colors duration-500 group-hover:text-white">
              {t.scheduleMeeting}
            </span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </Link>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LocaleSwitch pathname={pathname} onSurface={onSurface} label={t.language} compact />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? t.closeMenu : t.openMenu}
            aria-expanded={mobileOpen}
            className={`relative z-10 flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-full border transition-colors ${
              onSurface ? "border-we-line" : "border-white/35"
            }`}
          >
            <span
              className={`block h-px w-5 bg-current transition-transform duration-300 ${
                mobileOpen ? "translate-y-[3px] rotate-45" : ""
              }`}
            />
            <span
              className={`block h-px w-5 bg-current transition-transform duration-300 ${
                mobileOpen ? "-translate-y-[3px] -rotate-45" : ""
              }`}
            />
          </button>
        </div>
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
            className="hidden border-t border-we-line/70 bg-white/95 text-we-ink backdrop-blur-xl lg:block"
            onMouseEnter={cancelClose}
          >
            <div className="mx-auto grid max-w-7xl gap-8 px-8 py-10 md:grid-cols-[minmax(0,1fr)_2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-we-magenta">
                  {active.label}
                </p>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-we-muted">
                  {c.site.mission}
                </p>
                <Link
                  href={href(active.href)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-we-indigo"
                >
                  {t.overview}
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
                      href={href(child.href)}
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
            className="fixed inset-0 top-20 overflow-y-auto bg-white px-5 pb-16 pt-6 text-we-ink lg:hidden"
          >
            <ul className="divide-y divide-we-line">
              {c.nav.map((item, i) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: reduce ? 0 : -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i, duration: 0.4 }}
                  className="py-4"
                >
                  <Link
                    href={href(item.href)}
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
                            href={href(child.href)}
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
              href={href("/contact")}
              onClick={() => setMobileOpen(false)}
              className="we-gradient mt-8 block rounded-full px-6 py-4 text-center font-semibold text-white"
            >
              {t.scheduleMeeting}
            </Link>
            <a href={c.site.phoneHref} className="mt-4 block text-center text-sm text-we-muted">
              {c.site.phone}
            </a>
            <p className="mt-8 text-center text-xs uppercase tracking-[0.18em] text-we-muted">
              {localeNames[locale].long}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

/**
 * NL / EN switch.
 *
 * The same page in the other language is the same route with a different
 * first segment, so this is a plain link - it keeps the visitor where they
 * were instead of dropping them on a translated homepage.
 */
function LocaleSwitch({
  pathname,
  onSurface,
  label,
  compact = false,
}: {
  pathname: string;
  onSurface: boolean;
  label: string;
  compact?: boolean;
}) {
  const { locale } = useContent();

  return (
    <div
      role="group"
      aria-label={label}
      className={`flex items-center rounded-full border p-0.5 text-xs font-semibold transition-colors ${
        onSurface ? "border-we-line" : "border-white/30"
      } ${compact ? "" : "mr-1"}`}
    >
      {locales.map((code) => {
        const isActive = code === locale;
        return (
          <Link
            key={code}
            href={switchLocalePath(pathname, code)}
            hrefLang={code}
            aria-current={isActive ? "true" : undefined}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              isActive
                ? onSurface
                  ? "bg-we-indigo text-white"
                  : "bg-white text-we-indigo"
                : onSurface
                  ? "text-we-muted hover:text-we-indigo"
                  : "text-white/70 hover:text-white"
            }`}
          >
            <span className="sr-only">{localeNames[code].long}</span>
            <span aria-hidden>{localeNames[code].short}</span>
          </Link>
        );
      })}
    </div>
  );
}
