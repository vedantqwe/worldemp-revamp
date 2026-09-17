import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Specialisations } from "@/components/Specialisations";
import { CtaBand } from "@/components/CtaBand";

export const metadata: Metadata = {
  title: "Solutions",
  description:
    "Specialists across IT, Data, Finance and Engineering - more than thirty roles, recruited and assessed by WorldEmp.",
};

export default function SolutionsPage() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        title="Specialists across four disciplines"
        intro="Open a discipline to see the roles we recruit for. If the role you need is not listed, it usually still sits inside our network - ask."
      />
      <Specialisations />
      <CtaBand />
    </>
  );
}
