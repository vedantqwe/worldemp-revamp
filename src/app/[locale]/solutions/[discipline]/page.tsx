import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { CardGrid } from "@/components/content/CardGrid";
import { CtaBand } from "@/components/CtaBand";
import { ContentBlocks } from "@/components/content/ContentBlocks";
import { getContent } from "@/lib/content";
import { isLocale, locales, ui } from "@/lib/i18n";
import { childrenOf, resolvePage, slugsOfKind } from "@/lib/pages";

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
  const { mastheads } = getContent(locale);

  return (
    <>
      <PageHero
        eyebrow={mastheads.solutions.eyebrow}
        title={page.edition.title}
        intro={page.edition.description || undefined}
      />

      <section className="bg-white py-20 sm:py-28">
        <ContentBlocks blocks={page.edition.blocks} locale={locale} />
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
