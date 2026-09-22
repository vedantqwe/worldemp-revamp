import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";

/**
 * One place that knows where this site lives and what to tell a crawler.
 *
 * Every page's metadata comes through `pageMetadata` so the canonical, the
 * hreflang set and the Open Graph block cannot drift apart from each other,
 * which is the usual way these go wrong: a canonical added on one template
 * and forgotten on the next.
 */

/**
 * The origin the site is served from, including any base path.
 *
 * Set NEXT_PUBLIC_SITE_URL when deploying anywhere real. It defaults to the
 * GitHub Pages preview, because that is where this build goes today and a
 * canonical has to point at a URL that actually resolves.
 */
export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vedantqwe.github.io/worldemp-revamp"
).replace(/\/$/, "");

/**
 * Whether crawlers should index this deployment.
 *
 * The preview is a rebuild of a site that is already published at
 * worldemp.com. Two copies of the same copy competing in search helps
 * nobody and would be the revamp cannibalising the client's own rankings, so
 * the preview asks not to be indexed. Point NEXT_PUBLIC_SITE_URL at the real
 * domain and it indexes; the markup is identical either way.
 */
export const indexable = !/github\.io|localhost|127\.0\.0\.1/.test(siteUrl);

/** An absolute URL for a locale-prefixed path. */
export function absolute(locale: Locale, path = ""): string {
  const clean = path === "/" ? "" : path.replace(/\/$/, "");
  return `${siteUrl}/${locale}${clean}`;
}

/**
 * hreflang for a path, in every locale plus x-default.
 *
 * The revamp keeps one slug per page behind a locale prefix, so the alternate
 * of any page is the same path under the other prefix - no lookup table, and
 * nothing to fall out of step when a route is added. Exported so the sitemap
 * can carry the same alternates as the page head rather than a thinner set
 * that only lists en/nl - a crawler that reads x-default from one and not the
 * other has no reason to trust either.
 */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = absolute(locale, path);
  // English is the edition served to anyone whose language we do not publish.
  languages["x-default"] = absolute("en", path);
  return languages;
}

export type PageSeo = {
  locale: Locale;
  /** Route without the locale prefix, e.g. "/insights/remote-working". */
  path: string;
  title: string;
  description?: string;
  /** Site-relative path of the social image, e.g. "/media/foo.webp". */
  image?: string | null;
  /** ISO date; makes an article eligible for a published date in search. */
  published?: string | null;
  type?: "website" | "article";
};

/**
 * The metadata block every page returns.
 *
 * Canonical is self-referencing and absolute. Open Graph and Twitter carry
 * the same title, description and picture rather than a second, thinner set,
 * because a social card that disagrees with the page is worse than none.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  image,
  published,
  type = "website",
}: PageSeo): Metadata {
  const url = absolute(locale, path);
  const images = image ? [{ url: image, alt: title }] : undefined;

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    robots: indexable
      ? undefined
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      type,
      url,
      title,
      description,
      images,
      locale: locale === "nl" ? "nl_NL" : "en_GB",
      alternateLocale: locale === "nl" ? "en_GB" : "nl_NL",
      ...(type === "article" && published ? { publishedTime: published } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}
