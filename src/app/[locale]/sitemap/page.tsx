import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { getContent } from "@/lib/content";
import { isLocale, localeHref, ui } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { summaries, type PageKind } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sitemap">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({
    locale,
    path: "/sitemap",
    title: getContent(locale).pages.sitemap.title,
  });
}

export default async function SitemapPage({ params }: PageProps<"/[locale]/sitemap">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const { nav, pages, mastheads } = getContent(locale);
  const t = ui[locale];

  /** The migrated sections, listed in full rather than summarised. */
  const sections: { heading: string; kind: PageKind }[] = [
    { heading: mastheads.insights.eyebrow, kind: "article" },
    { heading: mastheads.cases.eyebrow, kind: "case" },
    { heading: mastheads.sectors.eyebrow, kind: "sector" },
    { heading: t.roles, kind: "role" },
  ];

  return (
    <>
      <PageHero eyebrow={pages.sitemap.eyebrow} title={pages.sitemap.title} />

      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          {/* Multi-column rather than a grid: the sections have wildly
              different child counts, and grid rows would leave a hole under
              every short one instead of letting the next section pack up. */}
          <div className="columns-1 gap-10 sm:columns-2 lg:columns-4">
            {nav.map((item) => (
              <div key={item.label} className="mb-10 break-inside-avoid">
                <Link
                  href={localeHref(locale, item.href)}
                  className="font-display text-lg font-semibold text-we-ink transition-colors hover:text-we-indigo"
                >
                  {item.label}
                </Link>
                {item.children ? (
                  <ul className="mt-3 space-y-2">
                    {item.children.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={localeHref(locale, child.href)}
                          className="text-sm text-we-muted transition-colors hover:text-we-indigo"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          {sections.map((section) => {
            const entries = summaries(section.kind, locale);
            if (!entries.length) return null;
            return (
              <div key={section.kind} className="mt-16 border-t border-we-line pt-10">
                <h2 className="font-display text-lg font-semibold text-we-ink">
                  {section.heading}
                  <span className="ml-2 text-sm font-normal text-we-muted">{entries.length}</span>
                </h2>
                <ul className="mt-4 grid gap-x-10 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <li key={entry.route}>
                      <Link
                        href={localeHref(locale, entry.route)}
                        className="text-sm text-we-muted transition-colors hover:text-we-indigo"
                      >
                        {entry.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
