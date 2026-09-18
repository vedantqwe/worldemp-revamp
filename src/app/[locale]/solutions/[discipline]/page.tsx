import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { CardGrid } from "@/components/content/CardGrid";
import { CtaBand } from "@/components/CtaBand";
import { ContentBlocks, headingsOf } from "@/components/content/ContentBlocks";
import { PageAside } from "@/components/content/PageAside";
import { Reveal, RevealFigure } from "@/components/ui/Reveal";
import { getContent } from "@/lib/content";
import { isLocale, locales, ui } from "@/lib/i18n";
import { childrenOf, leadImage, pullQuote, resolvePage, slugsOfKind } from "@/lib/pages";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    slugsOfKind("discipline", "/solutions").map((discipline) => ({ locale, discipline })),
  );
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions/[discipline]">): Promise<Metadata> {
  const { locale, discipline } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/solutions/${discipline}`, locale);
  if (!page) return {};
  return { title: page.edition.title, description: page.edition.description };
}

export default async function DisciplinePage({
  params,
}: PageProps<"/[locale]/solutions/[discipline]">) {
  const { locale, discipline } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/solutions/${discipline}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const t = ui[locale];
  const roles = childrenOf(route, locale);
  const content = getContent(locale);
  const { mastheads } = content;

  /*
   * The discipline's own positioning, written for the homepage's solutions
   * section and reused here rather than restated: it is the one paragraph on
   * the site that says what this field needs and what WorldEmp does about it,
   * and it is already in both languages.
   */
  const spec = content.specialisations.find((s) => s.id === discipline);

  /*
   * Two things move out of the body and into the lead section: the picture,
   * and the paragraph.
   *
   * The paragraph is the interesting one. The homepage's solutions copy was
   * written from this page's own opening line, so showing both puts the same
   * sentence on the page twice, forty pixels apart. Whichever is rendered
   * second is the one that looks like a mistake, so the body drops it.
   */
  const lead = leadImage(page.edition);
  const opening = spec ? spec.body.slice(0, 60).toLowerCase() : null;
  const body = page.edition.blocks.filter(
    (block) =>
      block !== lead &&
      !(
        opening &&
        block.type === "text" &&
        block.text.slice(0, 60).toLowerCase() === opening
      ),
  );

  return (
    <>
      <PageHero
        eyebrow={mastheads.solutions.eyebrow}
        title={page.edition.title}
        intro={page.edition.description || undefined}
      />

      {/* What this discipline is, and what having one of these people changes.
          A landing page for a field should answer that before it lists jobs. */}
      {spec || lead ? (
        <section className="bg-white pt-20 sm:pt-28">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-16">
            <Reveal className="max-w-[34rem]" y={24}>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-we-magenta">
                {content.specialisationsIntro.eyebrow}
              </p>
              <h2 className="mt-4 text-balance font-display text-[clamp(1.5rem,2.8vw,2.2rem)] leading-[1.12] text-we-ink">
                {spec?.name ?? page.edition.title}
              </h2>
              {spec ? (
                <p className="mt-5 text-[1.0625rem] leading-[1.75] text-we-ink/80">{spec.body}</p>
              ) : null}
              <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-5">
                <div>
                  <dt className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none text-we-indigo">
                    {roles.length}
                  </dt>
                  <dd className="mt-1.5 text-sm text-we-muted">
                    {roles.length === 1 ? t.rolesOne : t.roles}
                  </dd>
                </div>
                {content.hero.stats.slice(0, 2).map((stat) => (
                  <div key={stat.label}>
                    <dt className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-none text-we-indigo">
                      {stat.value}
                      <span className="text-we-magenta">{stat.unit}</span>
                    </dt>
                    <dd className="mt-1.5 text-sm text-we-muted">{stat.label}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>

            {lead ? (
              <RevealFigure delay={0.12}>
                <span className="block overflow-hidden rounded-3xl border border-we-line bg-we-paper">
                  <Image
                    src={lead.src}
                    alt=""
                    width={lead.width}
                    height={lead.height}
                    sizes="(min-width: 64rem) 36rem, 100vw"
                    priority
                    className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:scale-100"
                  />
                </span>
              </RevealFigure>
            ) : null}
          </div>
        </section>
      ) : null}

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_13rem] lg:gap-x-12">
            <ContentBlocks blocks={body} locale={locale} className="" />
            <PageAside
              locale={locale}
              headings={headingsOf(body)}
              quote={pullQuote(page.edition)}
              route={route}
            />
          </div>
        </div>
      </section>

      {roles.length ? (
        <section className="border-t border-we-line bg-we-paper py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <h2 className="font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-we-ink">
              {roles.length} {roles.length === 1 ? t.rolesOne : t.roles}
            </h2>
            <div className="mt-10">
              <CardGrid locale={locale} cards={roles} columns={3} />
            </div>
          </div>
        </section>
      ) : null}

      <CtaBand />
    </>
  );
}
