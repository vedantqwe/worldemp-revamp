import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
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
  return {
    title: page.edition.title,
    description: page.edition.description,
    openGraph: {
      title: page.edition.title,
      description: page.edition.description,
      images: image ? [{ url: image.src, width: image.width, height: image.height }] : undefined,
    },
  };
}

export default async function CasePage({ params }: PageProps<"/[locale]/cases/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/cases/${slug}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const { mastheads } = getContent(locale);

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.cases.eyebrow}
      backTo={{ label: mastheads.cases.eyebrow, href: "/cases" }}
      related={summaries("case", locale).filter((c) => c.route !== route).slice(0, 3)}
      relatedHeading={mastheads.cases.eyebrow}
    />
  );
}
