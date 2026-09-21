import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { ArticleSchema, BreadcrumbSchema } from "@/components/seo/StructuredData";
import { leadImage, resolvePage, slugsOfKind, summaries } from "@/lib/pages";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    slugsOfKind("case", "/cases").map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cases/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/cases/${slug}`, locale);
  if (!page) return {};
  const image = leadImage(page.edition);
  return pageMetadata({
    locale,
    path: `/cases/${slug}`,
    title: page.edition.title,
    description: page.edition.description,
    image: image?.src,
    published: page.edition.published,
    type: "article",
  });
}

export default async function CasePage({ params }: PageProps<"/[locale]/cases/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/cases/${slug}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const { mastheads } = getContent(locale);

  return (
    <>
      <ArticleSchema
        locale={locale}
        path={route}
        headline={page.edition.title}
        description={page.edition.description}
        image={leadImage(page.edition)?.src}
        published={page.edition.published}
        section={mastheads.cases.eyebrow}
      />
      <BreadcrumbSchema
        locale={locale}
        trail={[
          { name: mastheads.cases.eyebrow, path: "/cases" },
          { name: page.edition.title, path: route },
        ]}
      />
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.cases.eyebrow}
      backTo={{ label: mastheads.cases.eyebrow, href: "/cases" }}
      related={summaries("case", locale).filter((c) => c.route !== route).slice(0, 3)}
      relatedHeading={mastheads.cases.eyebrow}
    />
    </>
  );
}
