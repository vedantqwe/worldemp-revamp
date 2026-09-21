import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { CardGrid } from "@/components/content/CardGrid";
import { CtaBand } from "@/components/CtaBand";
import { Specialisations } from "@/components/Specialisations";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { summaries } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/sectors">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { sectors } = getContent(locale).mastheads;
  return pageMetadata({
    locale,
    path: "/sectors",
    title: sectors.eyebrow,
    description: sectors.intro,
  });
}

export default async function SectorsPage({ params }: PageProps<"/[locale]/sectors">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <>
      <PageHero {...getContent(locale).mastheads.sectors} />
      <section className="bg-white pt-20 sm:pt-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <CardGrid locale={locale} cards={summaries("sector", locale)} columns={2} />
        </div>
      </section>
      {/* The four disciplines are the other half of the answer to "which
          sector are you in" - the live site's sectors page links straight
          through to them. */}
      <Specialisations />
      <CtaBand />
    </>
  );
}
