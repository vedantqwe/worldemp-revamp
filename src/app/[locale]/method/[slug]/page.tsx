import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { getContent } from "@/lib/content";
import { isLocale, locales } from "@/lib/i18n";
import { childrenOf, resolvePage, slugsOfKind } from "@/lib/pages";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    slugsOfKind("page", "/method").map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/method/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/method/${slug}`, locale);
  if (!page) return {};
  return { title: page.edition.title, description: page.edition.description };
}

export default async function MethodDetailPage({
  params,
}: PageProps<"/[locale]/method/[slug]">) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/method/${slug}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const { mastheads } = getContent(locale);

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={mastheads.method.eyebrow}
      backTo={{ label: mastheads.method.eyebrow, href: "/method" }}
      related={childrenOf("/method", locale).filter((c) => c.route !== route).slice(0, 3)}
      relatedHeading={mastheads.method.eyebrow}
    />
  );
}
