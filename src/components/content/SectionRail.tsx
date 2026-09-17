import Link from "next/link";
import { CardGrid } from "@/components/content/CardGrid";
import type { CardSummary } from "@/lib/pages";
import { localeHref, ui, type Locale } from "@/lib/i18n";

/**
 * A band of cards under a designed section, listing the migrated pages that
 * sit beneath it.
 *
 * Without this the deeper pages - the nine way-of-working pages, the
 * compliance statements, the team page - would only be reachable by typing
 * the URL or finding them in the mega-menu.
 */
export function SectionRail({
  locale,
  heading,
  cards,
  more,
  columns = 3,
}: {
  locale: Locale;
  heading: string;
  cards: CardSummary[];
  /** Optional link to the full index. */
  more?: { label: string; href: string };
  columns?: 2 | 3 | 4;
}) {
  if (!cards.length) return null;
  const t = ui[locale];

  return (
    <section className="border-y border-we-line bg-we-paper py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-we-ink">
            {heading}
          </h2>
          {more ? (
            <Link
              href={localeHref(locale, more.href)}
              className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-we-indigo"
            >
              {more.label}
              <span
                aria-hidden
                className="transition-transform duration-300 group-hover:translate-x-1"
              >
                &rarr;
              </span>
            </Link>
          ) : null}
        </div>
        <div className="mt-10">
          <CardGrid locale={locale} cards={cards} columns={columns} />
        </div>
        <p className="sr-only">{t.inThisSection}</p>
      </div>
    </section>
  );
}
