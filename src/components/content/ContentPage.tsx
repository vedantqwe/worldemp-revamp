import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { CtaBand } from "@/components/CtaBand";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { CardGrid } from "@/components/content/CardGrid";
import type { CardSummary, ResolvedPage } from "@/lib/pages";
import { localeHref, ui, type Locale } from "@/lib/i18n";

/**
 * The shell every migrated page renders in: the same masthead as the designed
 * sections, then the content blocks, then whatever sits alongside it.
 *
 * Keeping one shell means an article, a role page and a sector page differ
 * only in their eyebrow and what follows the body - not in their type scale
 * or their rhythm.
 */
export function ContentPage({
  locale,
  page,
  eyebrow,
  backTo,
  related,
  relatedHeading,
}: {
  locale: Locale;
  page: ResolvedPage;
  eyebrow: string;
  /** Breadcrumb back up to the section index. */
  backTo?: { label: string; href: string };
  related?: CardSummary[];
  relatedHeading?: string;
}) {
  const t = ui[locale];
  const { edition, fallbackFrom } = page;

  return (
    <>
      <PageHero
        eyebrow={eyebrow}
        title={edition.title}
        intro={edition.description || undefined}
        meta={
          edition.published
            ? new Date(edition.published).toLocaleDateString(
                locale === "nl" ? "nl-NL" : "en-GB",
                { year: "numeric", month: "long", day: "numeric" },
              )
            : undefined
        }
        // The labels the live site tags each article with, carried through so
        // a reader can see what kind of piece they have landed on.
        tags={edition.categories}
      />

      <article className="bg-white py-20 sm:py-28">
        {backTo ? (
          <nav className="mx-auto mb-12 max-w-7xl px-5 sm:px-8">
            <Link
              href={localeHref(locale, backTo.href)}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-we-indigo"
            >
              <span aria-hidden className="transition-transform duration-300 group-hover:-translate-x-1">
                &larr;
              </span>
              {t.backTo} {backTo.label.toLowerCase()}
            </Link>
          </nav>
        ) : null}

        {/* A few pages exist in one language only on the live site. Saying so
            is better than silently serving the other language. */}
        {fallbackFrom ? (
          <p className="mx-auto mb-10 max-w-7xl px-5 sm:px-8">
            <span className="block max-w-[42rem] rounded-2xl border border-we-line bg-we-paper px-5 py-4 text-sm leading-relaxed text-we-muted sm:px-6">
              {fallbackFrom === "en"
                ? "Dit artikel is alleen in het Engels gepubliceerd."
                : "This page is published in Dutch only."}
            </span>
          </p>
        ) : null}

        <ContentBlocks blocks={edition.blocks} locale={locale} />
      </article>

      {related?.length ? (
        <section className="border-t border-we-line bg-we-paper py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-we-ink">
              {relatedHeading ?? t.relatedArticles}
            </h2>
            <div className="mt-10">
              <CardGrid locale={locale} cards={related} columns={3} />
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
