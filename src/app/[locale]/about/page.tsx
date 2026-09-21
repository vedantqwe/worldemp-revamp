import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { FounderQuote } from "@/components/Proposition";
import { Testimonials } from "@/components/Testimonials";
import { CtaBand } from "@/components/CtaBand";
import { SectionRail } from "@/components/content/SectionRail";
import { getContent } from "@/lib/content";
import { isLocale, ui } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { childrenOf } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { about } = getContent(locale).mastheads;
  return pageMetadata({
    locale,
    path: "/about",
    title: about.eyebrow,
    description: about.intro,
  });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const { mastheads, pages } = getContent(locale);
  const { about } = pages;

  return (
    <>
      <PageHero {...mastheads.about} />

      <section id="mission" className="scroll-mt-28 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.08]">
              {about.valuesHeading}
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {about.values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-we-line bg-we-paper p-8">
                  <h3 className="font-display text-xl text-we-ink">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-we-muted">{value.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <SectionRail
        locale={locale}
        heading={ui[locale].inThisSection}
        cards={childrenOf("/about", locale)}
      />

      <FounderQuote />

      <section id="faq" className="scroll-mt-28 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <h2 className="text-balance font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.08]">
              {about.faqHeading}
            </h2>
          </Reveal>
          <dl className="mt-12 divide-y divide-we-line border-y border-we-line">
            {about.faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.05} y={14}>
                <div className="py-7">
                  <dt className="font-display text-lg text-we-ink">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-we-muted">{faq.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Testimonials />
      <CtaBand />
    </>
  );
}
