import type { MetadataRoute } from "next";
import { indexable, siteUrl } from "@/lib/seo";

/**
 * robots.txt.
 *
 * The preview asks not to be indexed - it is a rebuild of a site already
 * published at worldemp.com, and two copies of the same copy competing in
 * search would be the revamp cannibalising the client's own rankings. Set
 * NEXT_PUBLIC_SITE_URL to the real domain and this opens up.
 *
 * The sitemap is declared either way: a crawler that is told not to index
 * still benefits from knowing the shape of the site, and so does anything
 * reading the file to find the content rather than to rank it.
 */
// A static export has no server to generate this per request.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: indexable
      ? [{ userAgent: "*", allow: "/" }]
      : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
