import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { ServiceGrid } from "@/components/ServiceGrid";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/services">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { services } = getContent(locale).mastheads;
  return { title: services.eyebrow, description: services.intro };
}

export default async function ServicesPage({ params }: PageProps<"/[locale]/services">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const masthead = getContent(locale).mastheads.services;

  return (
    <>
      <PageHero {...masthead} />
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <ServiceGrid />
          </Reveal>
        </div>
      </section>
      <CtaBand />
    </>
  );
}
