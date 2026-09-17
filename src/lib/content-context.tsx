"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteContent } from "./content";
import { defaultLocale, ui, type Locale, type UiStrings, localeHref } from "./i18n";

type ContentValue = {
  locale: Locale;
  /** Page copy for the active locale. */
  c: SiteContent;
  /** Interface strings for the active locale. */
  t: UiStrings;
  /** Prefixes an app href with the active locale. */
  href: (href: string) => string;
};

const ContentContext = createContext<ContentValue | null>(null);

/**
 * Carries the active locale's copy down to the section components.
 *
 * The sections are all client components, and threading two objects through
 * a dozen of them as props was the alternative. The value is set once per
 * request by the locale layout, so it never changes underneath a render.
 */
export function ContentProvider({
  locale,
  content,
  children,
}: {
  locale: Locale;
  content: SiteContent;
  children: ReactNode;
}) {
  const value: ContentValue = {
    locale,
    c: content,
    t: ui[locale],
    href: (href: string) => localeHref(locale, href),
  };
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent(): ContentValue {
  const value = useContext(ContentContext);
  if (!value) {
    throw new Error("useContent must be used inside a ContentProvider");
  }
  return value;
}

/** For the rare client component rendered outside a locale route. */
export function useLocaleSafe(): Locale {
  return useContext(ContentContext)?.locale ?? defaultLocale;
}
