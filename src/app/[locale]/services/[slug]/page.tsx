import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { leadImage, resolvePage, slugsOfKind, summaries } from "@/lib/pages";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    slugsOfKind("service", "/services").map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/services/${slug}`, locale);
  if (!page) return {};
  return pageMetadata({
    locale,
    path: `/services/${slug}`,
    title: page.edition.title,
    description: page.edition.description,
    image: leadImage(page.edition)?.src,
  });
}

export default async function ServicePage({ params }: PageProps<"/[locale]/services/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/services/${slug}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const { mastheads } = getContent(locale);

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.services.eyebrow}
      backTo={{ label: mastheads.services.eyebrow, href: "/services" }}
      related={summaries("service", locale).filter((c) => c.route !== route).slice(0, 3)}
      relatedHeading={mastheads.services.eyebrow}
    />
  );
}
