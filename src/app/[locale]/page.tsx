import { notFound } from "next/navigation";
import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { AllInConcept } from "@/components/AllInConcept";
import { MethodTimeline } from "@/components/MethodTimeline";
import { Specialisations } from "@/components/Specialisations";
import { FounderQuote, CostAndRate, Comparison } from "@/components/Proposition";
import { Testimonials } from "@/components/Testimonials";
import { CtaBand } from "@/components/CtaBand";
import { SectionRail } from "@/components/content/SectionRail";
import { getContent } from "@/lib/content";
import { isLocale, ui } from "@/lib/i18n";
import { summaries } from "@/lib/pages";

/**
 * Section order deliberately alternates dark/light and full-bleed/contained,
 * so the page has a rhythm rather than one long scroll of cards. Every dark
 * block is a claim; every light block is the evidence for it.
 */
export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const { mastheads } = getContent(locale);
  const t = ui[locale];

  return (
    <>
      <Hero />
      <LogoMarquee />
      <AllInConcept />
      <MethodTimeline />
      <Specialisations />
      <FounderQuote />
      <CostAndRate />
      <Comparison />
      <Testimonials />
      {/* The live homepage carries a news and blogs band; the three most
          recent articles stand in for it, and give the knowledge base a way
          in from the homepage. */}
      <SectionRail
        locale={locale}
        heading={mastheads.insights.eyebrow}
        cards={summaries("article", locale).slice(0, 3)}
        more={{ label: t.allArticles, href: "/insights" }}
      />
      <CtaBand />
    </>
  );
}
