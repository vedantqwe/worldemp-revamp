import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { isLocale, locales } from "@/lib/i18n";
import { childrenOf, pagesOfKind, resolvePage } from "@/lib/pages";

export function generateStaticParams() {
  const roles = pagesOfKind("role").map((page) => {
    const [, , discipline, role] = page.route.split("/");
    return { discipline, role };
  });
  return locales.flatMap((locale) => roles.map((r) => ({ locale, ...r })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/solutions/[discipline]/[role]">): Promise<Metadata> {
  const { locale, discipline, role } = await params;
  if (!isLocale(locale)) return {};
  const page = resolvePage(`/solutions/${discipline}/${role}`, locale);
  if (!page) return {};
  return { title: page.edition.title, description: page.edition.description };
}

export default async function RolePage({
  params,
}: PageProps<"/[locale]/solutions/[discipline]/[role]">) {
  const { locale, discipline, role } = await params;
  if (!isLocale(locale)) notFound();

  const route = `/solutions/${discipline}/${role}`;
  const page = resolvePage(route, locale);
  if (!page) notFound();

  const parent = resolvePage(`/solutions/${discipline}`, locale);

  return (
    <ContentPage
      locale={locale}
      page={page}
      eyebrow={parent?.edition.title ?? discipline}
      backTo={{
        label: parent?.edition.title ?? discipline,
        href: `/solutions/${discipline}`,
      }}
      related={childrenOf(`/solutions/${discipline}`, locale)
        .filter((c) => c.route !== route)
        .slice(0, 3)}
      relatedHeading={parent?.edition.title ?? discipline}
    />
  );
}
