import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CardGrid } from "@/components/content/CardGrid";
import { CtaBand } from "@/components/CtaBand";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { summaries } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/insights">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { insights } = getContent(locale).mastheads;
  return { title: insights.eyebrow, description: insights.intro };
}

export default async function InsightsPage({ params }: PageProps<"/[locale]/insights">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const cards = summaries("article", locale);

  return (
    <>
      <PageHero {...getContent(locale).mastheads.insights} />
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <CardGrid locale={locale} cards={cards} columns={3} />
        </div>
      </section>
      <CtaBand />
    </>
  );
}
