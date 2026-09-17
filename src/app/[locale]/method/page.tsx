import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { MethodTimeline } from "@/components/MethodTimeline";
import { CostAndRate, Comparison } from "@/components/Proposition";
import { CtaBand } from "@/components/CtaBand";
import { SectionRail } from "@/components/content/SectionRail";
import { getContent } from "@/lib/content";
import { isLocale, ui } from "@/lib/i18n";
import { childrenOf } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/method">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { method } = getContent(locale).mastheads;
  return { title: method.eyebrow, description: method.intro };
}

export default async function MethodPage({ params }: PageProps<"/[locale]/method">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  return (
    <>
      <PageHero {...getContent(locale).mastheads.method} />
      <MethodTimeline />
      <SectionRail
        locale={locale}
        heading={ui[locale].inThisSection}
        cards={childrenOf("/method", locale)}
      />
      <CostAndRate />
      <Comparison />
      <CtaBand />
    </>
  );
}
