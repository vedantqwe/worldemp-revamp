import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ContentPage } from "@/components/content/ContentPage";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { BreadcrumbSchema, ServiceSchema } from "@/components/seo/StructuredData";
import { childrenOf, leadImage, pagesOfKind, resolvePage } from "@/lib/pages";

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
  return pageMetadata({
    locale,
    path: `/solutions/${discipline}/${role}`,
    title: page.edition.title,
    description: page.edition.description,
    image: leadImage(page.edition)?.src,
  });
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
    <>
      {/* Service, not JobPosting: these pages describe a capability a client
          can buy, and listing them as vacancies would put them in job search
          results under false pretences. */}
      <ServiceSchema
        locale={locale}
        path={route}
        name={page.edition.title}
        description={page.edition.description}
        category={parent?.edition.title ?? discipline}
      />
      <BreadcrumbSchema
        locale={locale}
        trail={[
          { name: "Solutions", path: "/solutions" },
          { name: parent?.edition.title ?? discipline, path: `/solutions/${discipline}` },
          { name: page.edition.title, path: route },
        ]}
      />
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
    </>
  );
}
