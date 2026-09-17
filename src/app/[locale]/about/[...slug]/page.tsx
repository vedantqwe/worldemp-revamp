import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { CardGrid } from "@/components/content/CardGrid";
import { CtaBand } from "@/components/CtaBand";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { childrenOf, pagesOfKind, resolvePage } from "@/lib/pages";

/**
 * Everything under /about that came from the CMS: the company, the team, the
 * mission, CSR, the FAQ and the two compliance pages. A catch-all rather than
 * one route per page, because the depth varies (/about/team is one segment,
 * /about/compliance/iso-27001 is two).
 */
const ABOUT_ROUTES = pagesOfKind("page")
  .concat(pagesOfKind("index"))
  .map((page) => page.route)
  .filter((route) => route.startsWith("/about/"));

export function generateStaticParams() {
  const slugs = ABOUT_ROUTES.map((route) => route.slice("/about/".length).split("/"));
  // /about/compliance has children but no page of its own on the live site,
  // so it is generated here as a section index.
  slugs.push(["compliance"]);
  const unique = [...new Map(slugs.map((s) => [s.join("/"), s])).values()];
  return locales.flatMap((locale) => unique.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about/[...slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/about/${slug.join("/")}`, locale);
  if (page) return { title: page.edition.title, description: page.edition.description };
  if (slug.join("/") === "compliance") return { title: "Compliance" };
  return {};
}

export default async function AboutDetailPage({
  params,
}: PageProps<"/[locale]/about/[...slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/about/${slug.join("/")}`;
  const page = resolvePage(route, locale);
  const { mastheads } = getContent(locale);

  // Section index for a path that has children but no content of its own.
  if (!page) {
    const children = childrenOf(route, locale);
    if (!children.length) notFound();
    const title = slug[slug.length - 1].replace(/-/g, " ");
    return (
      <>
        <PageHero
          eyebrow={mastheads.about.eyebrow}
          title={title.charAt(0).toUpperCase() + title.slice(1)}
        />
        <section className="bg-white py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <CardGrid locale={locale} cards={children} columns={2} />
          </div>
        </section>
        <CtaBand />
      </>
    );
  }

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.about.eyebrow}
      backTo={{ label: mastheads.about.eyebrow, href: "/about" }}
      related={childrenOf("/about", locale).filter((c) => c.route !== route).slice(0, 3)}
      relatedHeading={mastheads.about.eyebrow}
    />
  );
}
