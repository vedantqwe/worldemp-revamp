import { Hero } from "@/components/Hero";
import { LogoMarquee } from "@/components/LogoMarquee";
import { AllInConcept } from "@/components/AllInConcept";
import { MethodTimeline } from "@/components/MethodTimeline";
import { Specialisations } from "@/components/Specialisations";
import { FounderQuote, CostAndRate, Comparison } from "@/components/Proposition";
import { Testimonials } from "@/components/Testimonials";
import { CtaBand } from "@/components/CtaBand";

/**
 * Section order deliberately alternates dark/light and full-bleed/contained,
 * so the page has a rhythm rather than one long scroll of cards. Every dark
 * block is a claim; every light block is the evidence for it.
 */
export default function Home() {
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
      <CtaBand />
    </>
  );
}
