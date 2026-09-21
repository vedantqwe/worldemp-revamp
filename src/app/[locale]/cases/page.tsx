import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CardGrid } from "@/components/content/CardGrid";
import { CtaBand } from "@/components/CtaBand";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { summaries } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/cases">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { cases } = getContent(locale).mastheads;
  return pageMetadata({
    locale,
    path: "/cases",
    title: cases.eyebrow,
    description: cases.intro,
  });
}

export default async function CasesPage({ params }: PageProps<"/[locale]/cases">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <>
      <PageHero {...getContent(locale).mastheads.cases} />
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <CardGrid locale={locale} cards={summaries("case", locale)} columns={3} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
