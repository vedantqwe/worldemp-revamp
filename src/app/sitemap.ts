import type { MetadataRoute } from "next";
import { absolute } from "@/lib/seo";
import { locales } from "@/lib/i18n";
import { allRoutes } from "@/lib/pages";

/**
 * sitemap.xml, both editions of every page.
 *
 * Each entry lists its own URL and its hreflang alternates, so a crawler
 * learns the language pairing from the sitemap as well as from the page - the
 * two agree because both come from the same route list.
 *
 * Priorities are relative and deliberately coarse: the homepage, then the
 * section indexes, then everything else. Articles carry their publication
 * date as lastModified where the CMS gave us one.
 */
// A static export has no server to generate this per request.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const { path, published } of allRoutes()) {
    const depth = path === "/" ? 0 : path.split("/").length - 1;
    for (const locale of locales) {
      entries.push({
        url: absolute(locale, path),
        lastModified: published ? new Date(published) : undefined,
        changeFrequency: depth === 0 ? "weekly" : "monthly",
        priority: depth === 0 ? 1 : depth === 1 ? 0.8 : 0.6,
        alternates: {
          languages: Object.fromEntries(
            locales.map((other) => [other, absolute(other, path)]),
          ),
        },
      });
    }
  }

  return entries;
}
