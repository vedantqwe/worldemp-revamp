/**
 * Locale plumbing.
 *
 * The live site is Dutch-primary with an English edition, and translates its
 * slugs too (/nl/over-ons vs /en/about-us). The revamp keeps one set of
 * English slugs behind a locale prefix (/nl/about, /en/about) so a page is
 * one route with two content sources, and the language switcher is a segment
 * swap rather than a lookup table that has to be kept in step by hand.
 */

export const locales = ["en", "nl"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "nl";
}

/** Reads the locale out of a pathname, falling back to the default. */
export function localeFromPath(pathname: string): Locale {
  const first = pathname.split("/")[1];
  return isLocale(first) ? first : defaultLocale;
}

/** Prefixes an app-relative href with a locale. `/about` -> `/nl/about`. */
export function localeHref(locale: Locale, href: string): string {
  if (/^(https?:|mailto:|tel:|#)/.test(href)) return href;
  const clean = href.startsWith("/") ? href : `/${href}`;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

/** The same page in the other language: swap the first segment. */
export function switchLocalePath(pathname: string, next: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (isLocale(segments[0])) segments[0] = next;
  else segments.unshift(next);
  return `/${segments.join("/")}`;
}

export const localeNames: Record<Locale, { short: string; long: string }> = {
  en: { short: "EN", long: "English" },
  nl: { short: "NL", long: "Nederlands" },
};

/**
 * Chrome strings: everything that is part of the interface rather than the
 * page content. Page content comes from the scraped dataset instead.
 */
export const ui = {
  en: {
    skipToContent: "Skip to content",
    mainNav: "Main",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    overview: "Overview",
    home: "Home",
    scheduleMeeting: "Schedule a meeting",
    callUs: "Call us",
    language: "Language",
    switchTo: "Bekijk deze pagina in het Nederlands",
    readMore: "Read more",
    previous: "Previous",
    next: "Next",
    newsletterHeading: "Your top employee may be one newsletter away",
    newsletterBody: "Don't miss out - sign up and upgrade your recruitment game.",
    newsletterPlaceholder: "Email address",
    newsletterSubmit: "Sign up",
    newsletterDone: "Your sign-up is ready in your email app - send it and you are on the list.",
    newsletterInvalid: "That address looks incomplete.",
    readArticle: "Read article",
    allArticles: "All articles",
    backTo: "Back to",
    relatedArticles: "Related reading",
    published: "Published",
    roles: "roles",
    rolesOne: "role",
    inThisSection: "In this section",
    onThisPage: "On this page",
    noResults: "Nothing here yet.",
    knowledgeBase: "Knowledge base",
    cases: "Client stories",
    sectors: "Sectors",
    services: "Services",
    solutions: "Solutions",
    method: "Method",
    about: "About",
    contact: "Contact",
  },
  nl: {
    skipToContent: "Naar de inhoud",
    mainNav: "Hoofdmenu",
    openMenu: "Menu openen",
    closeMenu: "Menu sluiten",
    overview: "Overzicht",
    home: "Home",
    scheduleMeeting: "Plan een afspraak",
    callUs: "Bel ons",
    language: "Taal",
    switchTo: "View this page in English",
    readMore: "Lees meer",
    previous: "Vorige",
    next: "Volgende",
    newsletterHeading: "Jouw topmedewerker kan slechts één nieuwsbrief weg zijn",
    newsletterBody: "Mis het niet - schrijf je in en upgrade je wervingsgame.",
    newsletterPlaceholder: "E-mailadres",
    newsletterSubmit: "Inschrijven",
    newsletterDone: "Je aanmelding staat klaar in je mailprogramma - verstuur hem en je staat op de lijst.",
    newsletterInvalid: "Dat adres lijkt niet compleet.",
    readArticle: "Lees het artikel",
    allArticles: "Alle artikelen",
    backTo: "Terug naar",
    relatedArticles: "Meer lezen",
    published: "Gepubliceerd",
    roles: "functies",
    rolesOne: "functie",
    inThisSection: "In dit onderdeel",
    onThisPage: "Op deze pagina",
    noResults: "Hier staat nog niets.",
    knowledgeBase: "Kennisbank",
    cases: "Klantverhalen",
    sectors: "Sectoren",
    services: "Diensten",
    solutions: "Oplossingen",
    method: "Werkwijze",
    about: "Over ons",
    contact: "Contact",
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type UiStrings = (typeof ui)[Locale];
