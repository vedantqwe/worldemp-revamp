import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { MethodTimeline } from "@/components/MethodTimeline";
import { CostAndRate, Comparison } from "@/components/Proposition";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Method",
  description:
    "How WorldEmp gets you a qualified, fitting colleague in two to six weeks, on one all-in rate.",
};

export default function MethodPage() {
  return (
    <>
      <PageHero
        eyebrow="Method"
        title="What actually happens, week by week"
        intro="No placement fee, no surprises in the small print, and no invoice until your new colleague starts."
      />
      <MethodTimeline />
      <CostAndRate />
      <Comparison />
      <CtaBand />
    </>
  );
}
