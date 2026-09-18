import Image from "next/image";
import Link from "next/link";
import { PageContents, type Heading } from "@/components/content/PageContents";
import { getContent } from "@/lib/content";
import { localeHref, ui, type Locale } from "@/lib/i18n";
import { testimonialsFor } from "@/lib/site";

/**
 * The margin column.
 *
 * The prose is set at a reading measure and pinned to the left gutter, which
 * on a wide screen leaves the right half of the page empty. Stretching the
 * text across it would be worse - a 120-character line reads badly - so the
 * room goes to three things the page can use, in the order a reader wants
 * them: where am I, what does someone say about this, and who do I talk to.
 *
 * Each is skipped when there is nothing to show, so a short page with no
 * quote gets no rail at all rather than an empty column with headings in it.
 */
export function PageAside({
  locale,
  headings,
  quote,
  route,
}: {
  locale: Locale;
  headings: Heading[];
  /** A sentence lifted from the page, if it has a quotable one. */
  quote?: string | null;
  /** Used to pick a stable testimonial when the page has no quote of its own. */
  route: string;
}) {
  const t = ui[locale];
  const c = getContent(locale);

  /*
   * A page with nothing quotable borrows one. The client quotes belong to the
   * site rather than to any page, so which one appears is chosen by the route
   * - the same page always shows the same person, which a random pick would
   * not, and a reader moving between pages sees the set rather than one.
   */
  const testimonials = testimonialsFor(locale);
  const borrowed =
    quote || !testimonials.length
      ? null
      : testimonials[
          [...route].reduce((n, ch) => (n * 31 + ch.charCodeAt(0)) >>> 0, 7) % testimonials.length
        ];

  // Clipped at a word, not mid-syllable: CSS line-clamp cuts wherever the
  // line happens to end, which left the card reading "WorldEmp has mad...".
  const shown = borrowed && borrowed.quote.length > 190
    ? `${borrowed.quote.slice(0, 190).replace(/\s+\S*$/, "")}\u2026`
    : borrowed?.quote;

  const hasContents = headings.length >= 4;
  if (!hasContents && !quote && !borrowed) return null;

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28 space-y-10">
        {hasContents ? (
          <div className="max-h-[52vh] overflow-y-auto pr-1">
            <PageContents headings={headings} label={t.onThisPage} />
          </div>
        ) : null}

        {quote ? (
          <figure className="border-l-2 border-we-magenta pl-4">
            <span aria-hidden className="we-gradient-text font-display text-3xl leading-none">
              &ldquo;
            </span>
            <blockquote className="mt-1 font-display text-base leading-snug text-we-ink">
              {quote}
            </blockquote>
          </figure>
        ) : borrowed ? (
          <figure className="rounded-2xl border border-we-line bg-we-paper p-5">
            <span aria-hidden className="we-gradient-text font-display text-3xl leading-none">
              &ldquo;
            </span>
            <blockquote className="mt-1 font-display text-[0.9375rem] leading-snug text-we-ink">
              {shown}
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              {borrowed.portrait ? (
                <Image
                  src={borrowed.portrait.src}
                  alt=""
                  width={borrowed.portrait.width}
                  height={borrowed.portrait.height}
                  sizes="40px"
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : null}
              <span className="text-xs leading-snug text-we-muted">
                <span className="block font-semibold text-we-ink">{borrowed.name}</span>
                {borrowed.role}
              </span>
            </figcaption>
          </figure>
        ) : null}

        {/* Not the page's call to action - that band is already at the foot of
            every page - but the two ways to reach a person directly. */}
        <div className="border-t border-we-line pt-5 text-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-we-muted">
            {t.talkToUs}
          </p>
          <a
            href={c.site.phoneHref}
            className="mt-3 block font-semibold text-we-indigo transition-colors hover:text-we-magenta"
          >
            {c.site.phone}
          </a>
          <a
            href={`mailto:${c.site.email}`}
            className="mt-1 block text-we-muted transition-colors hover:text-we-ink"
          >
            {c.site.email}
          </a>
          <Link
            href={localeHref(locale, "/contact")}
            className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-we-indigo"
          >
            {c.nav.find((item) => item.href === "/contact")?.label ?? "Contact"}
            <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
              &rarr;
            </span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
