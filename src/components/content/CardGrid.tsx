import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import type { CardSummary } from "@/lib/pages";
import { localeHref, ui, type Locale } from "@/lib/i18n";

/**
 * Index listing for articles, cases, roles and section children.
 *
 * Cards with art and cards without have to sit in the same grid - a good half
 * of the migrated pages have no image - so the image is a fixed-ratio band
 * that is simply absent when there is nothing to show, rather than a
 * placeholder standing in for one.
 */
export function CardGrid({
  locale,
  cards,
  columns = 3,
}: {
  locale: Locale;
  cards: CardSummary[];
  columns?: 2 | 3 | 4;
}) {
  const t = ui[locale];
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  if (!cards.length) {
    return <p className="text-sm text-we-muted">{t.noResults}</p>;
  }

  return (
    <ul className={`grid gap-5 ${cols}`}>
      {cards.map((card, i) => (
        <Reveal key={card.route} delay={Math.min(i, 6) * 0.05} y={18}>
          <li className="h-full list-none">
            <Link
              href={localeHref(locale, card.route)}
              className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-we-line bg-white transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:shadow-[0_20px_60px_-24px_rgba(21,9,88,0.35)]"
            >
              {card.image ? (
                <span className="relative block aspect-[16/10] overflow-hidden bg-we-paper">
                  <Image
                    src={card.image.src}
                    alt=""
                    width={card.image.width}
                    height={card.image.height}
                    sizes="(min-width: 64rem) 24rem, (min-width: 40rem) 45vw, 100vw"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </span>
              ) : null}

              {/* The live site labels each card with its content type; the
                  labels ride along on the card image, as they do there. */}
              {card.categories.length ? (
                <span className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-1.5">
                  {card.categories.slice(0, 2).map((category) => (
                    <span
                      key={category}
                      className="rounded-full bg-we-indigo/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm"
                    >
                      {category}
                    </span>
                  ))}
                </span>
              ) : null}

              <span className="flex flex-1 flex-col p-6 sm:p-7">
                {card.published || card.translated ? (
                  <span className="mb-3 flex items-center gap-3 text-xs font-medium text-we-muted">
                    {card.published ? (
                      <time dateTime={card.published}>
                        {new Date(card.published).toLocaleDateString(
                          locale === "nl" ? "nl-NL" : "en-GB",
                          { year: "numeric", month: "short", day: "numeric" },
                        )}
                      </time>
                    ) : null}
                    {card.translated ? (
                      <span className="rounded-full border border-we-line px-2 py-0.5 uppercase tracking-wide">
                        {locale === "nl" ? "EN" : "NL"}
                      </span>
                    ) : null}
                  </span>
                ) : null}

                <span className="font-display text-lg leading-snug text-we-ink transition-colors duration-300 group-hover:text-we-indigo">
                  {card.title}
                </span>

                {card.excerpt ? (
                  <span className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-we-muted">
                    {card.excerpt}
                  </span>
                ) : null}

                <span className="mt-auto pt-5 text-sm font-semibold text-we-indigo">
                  {t.readMore}
                  <span
                    aria-hidden
                    className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </span>
            </Link>
          </li>
        </Reveal>
      ))}
    </ul>
  );
}
