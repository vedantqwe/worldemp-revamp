import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Specialisations } from "@/components/Specialisations";
import { CtaBand } from "@/components/CtaBand";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { solutions } = getContent(locale).mastheads;
  return pageMetadata({
    locale,
    path: "/solutions",
    title: solutions.eyebrow,
    description: solutions.intro,
  });
}

export default async function SolutionsPage({ params }: PageProps<"/[locale]/solutions">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <>
      <PageHero {...getContent(locale).mastheads.solutions} />
      <Specialisations />
      <CtaBand />
    </>
  );
}
