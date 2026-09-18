import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";
import { resolvePage } from "@/lib/pages";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage("/privacy", locale);
  return {
    title: page?.edition.title ?? getContent(locale).pages.privacy.title,
    description: page?.edition.description,
  };
}

/**
 * The privacy and cookie statement, migrated from the live site like any other
 * long-form page.
 *
 * It is the one page in the crawl the content build used to skip, which left a
 * placeholder behind a link in the footer and the cookie notice - a legal page
 * that says nothing is worse than no link at all. The Dutch edition needed the
 * hreflang fallback in the content build: the CMS omits the English alternate
 * on this page only.
 */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const { privacy } = getContent(locale).pages;
  const page = resolvePage("/privacy", locale);

  return (
    <>
      <PageHero
        eyebrow={privacy.eyebrow}
        title={page?.edition.title ?? privacy.title}
        intro={page?.edition.description || undefined}
      />
      <section className="bg-white py-20 sm:py-28">
        {page ? (
          <ContentBlocks blocks={page.edition.blocks} locale={locale} />
        ) : (
          <div className="mx-auto max-w-2xl px-5 sm:px-8">
            <p className="rounded-2xl border border-we-line bg-we-paper p-6 text-sm leading-relaxed text-we-muted">
              {privacy.placeholder}
            </p>
          </div>
        )}
      </section>
    </>
  );
}
