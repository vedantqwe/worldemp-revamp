import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { resolvePage, slugsOfKind, summaries } from "@/lib/pages";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    slugsOfKind("sector", "/sectors").map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sectors/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/sectors/${slug}`, locale);
  if (!page) return {};
  return { title: page.edition.title, description: page.edition.description };
}

export default async function SectorPage({ params }: PageProps<"/[locale]/sectors/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/sectors/${slug}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const { mastheads } = getContent(locale);

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.sectors.eyebrow}
      backTo={{ label: mastheads.sectors.eyebrow, href: "/sectors" }}
      related={summaries("sector", locale).filter((c) => c.route !== route)}
      relatedHeading={mastheads.sectors.eyebrow}
    />
  );
}
