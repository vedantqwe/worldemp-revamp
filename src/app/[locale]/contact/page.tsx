import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { contact } = getContent(locale).mastheads;
  return pageMetadata({
    locale,
    path: "/contact",
    title: contact.eyebrow,
    description: contact.intro,
  });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const { site, mastheads, pages } = getContent(locale);
  const { contact } = pages;

  return (
    <>
      <PageHero {...mastheads.contact} />

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-2xl leading-snug text-we-ink">
              {contact.asideHeading}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-we-muted">
              {contact.asideBody}
            </p>
            <a
              href={site.phoneHref}
              className="mt-8 block font-display text-2xl font-semibold text-we-indigo transition-colors hover:text-we-magenta"
            >
              {site.phone}
            </a>
            <a
              href={`mailto:${site.email}`}
              className="mt-2 block text-sm text-we-muted transition-colors hover:text-we-indigo"
            >
              {site.email}
            </a>
            <dl className="mt-10 space-y-6 border-t border-we-line pt-8 text-sm">
              {contact.facts.map((fact) => (
                <div key={fact.term}>
                  <dt className="font-semibold text-we-ink">{fact.term}</dt>
                  <dd className="mt-1 text-we-muted">{fact.detail}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
