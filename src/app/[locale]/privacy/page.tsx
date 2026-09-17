import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { getContent } from "@/lib/content";
import { isLocale } from "@/lib/i18n";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { title: getContent(locale).pages.privacy.title };
}

/**
 * PLACEHOLDER. The live site's legal text has not been migrated - copy the
 * approved statement from worldemp.com/nl/privacy-cookiestatement before
 * this page is published.
 */
export default async function PrivacyPage({ params }: PageProps<"/[locale]/privacy">) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const { privacy } = getContent(locale).pages;

  return (
    <>
      <PageHero eyebrow={privacy.eyebrow} title={privacy.title} />
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <p className="rounded-2xl border border-we-line bg-we-paper p-6 text-sm leading-relaxed text-we-muted">
            {privacy.placeholder}
          </p>
        </div>
      </section>
    </>
  );
}
