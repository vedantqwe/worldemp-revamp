import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { leadImage, relatedArticles, resolvePage, slugsOfKind } from "@/lib/pages";

/** Every article, in both editions, prerendered at build time. */
export function generateStaticParams() {
  return locales.flatMap((locale) =>
    slugsOfKind("article", "/insights").map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/insights/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/insights/${slug}`, locale);
  if (!page) return {};
  const image = leadImage(page.edition);

  return {
    title: page.edition.title,
    description: page.edition.description,
    openGraph: {
      title: page.edition.title,
      description: page.edition.description,
      type: "article",
      images: image ? [{ url: image.src, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/[locale]/insights/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/insights/${slug}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const { mastheads } = getContent(locale);

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.insights.eyebrow}
      backTo={{ label: mastheads.insights.eyebrow, href: "/insights" }}
      related={relatedArticles(route, locale, 3)}
    />
  );
}
