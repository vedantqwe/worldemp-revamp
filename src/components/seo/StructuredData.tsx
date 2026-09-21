import { getContent } from "@/lib/content";
import { absolute, siteUrl } from "@/lib/seo";
import type { Locale } from "@/lib/i18n";

/**
 * JSON-LD.
 *
 * This is the part of the page a machine reads rather than renders, and it is
 * the main lever for both search and the answer engines: a crawler that has
 * to infer the publisher, the date and the subject from prose will get some
 * of it wrong, while one handed schema.org gets it exactly. Nothing here
 * changes a pixel.
 *
 * Every graph is emitted with `@id`s so the nodes reference one another
 * rather than repeating themselves - one Organization, referred to by every
 * article as its publisher.
 */

const ORG_ID = `${siteUrl}/#organization`;
const SITE_ID = `${siteUrl}/#website`;

function Script({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // The payload is built here from our own content, not from anything a
      // visitor supplies, and JSON.stringify escapes what matters. `<` is
      // escaped as well so the string can never close the script element.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Who publishes this site. Emitted once, in the layout. */
export function OrganizationSchema({ locale }: { locale: Locale }) {
  const { site, footer } = getContent(locale);
  void footer;

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": ORG_ID,
            name: site.name,
            url: siteUrl,
            description: site.mission,
            logo: {
              "@type": "ImageObject",
              url: `${siteUrl}/brand/worldemp-logo.svg`,
            },
            telephone: site.phone,
            email: site.email,
            sameAs: [
              "https://www.linkedin.com/company/worldemp/",
              "https://www.youtube.com/channel/UCAoRcGoPd-gQj-LMAEnETMQ",
              "https://www.facebook.com/WorldEmpIndia/",
              "https://twitter.com/worldemp",
            ],
            contactPoint: {
              "@type": "ContactPoint",
              contactType: "sales",
              telephone: site.phone,
              email: site.email,
              availableLanguage: ["en", "nl"],
            },
          },
          {
            "@type": "WebSite",
            "@id": SITE_ID,
            url: siteUrl,
            name: site.name,
            inLanguage: locale,
            publisher: { "@id": ORG_ID },
          },
        ],
      }}
    />
  );
}

/**
 * The trail from the home page to this one.
 *
 * Search results show it in place of a raw URL, and an answer engine uses it
 * to say where in a site a fact came from.
 */
export function BreadcrumbSchema({
  locale,
  trail,
}: {
  locale: Locale;
  /** Ancestors then this page, each a label and a locale-less path. */
  trail: { name: string; path: string }[];
}) {
  const { site } = getContent(locale);
  const items = [{ name: site.name, path: "/" }, ...trail];

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: absolute(locale, item.path),
        })),
      }}
    />
  );
}

/** A knowledge-base piece or a client story. */
export function ArticleSchema({
  locale,
  path,
  headline,
  description,
  image,
  published,
  section,
}: {
  locale: Locale;
  path: string;
  headline: string;
  description?: string;
  image?: string | null;
  published?: string | null;
  section?: string;
}) {
  const url = absolute(locale, path);

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        "@id": `${url}#article`,
        headline,
        description,
        inLanguage: locale,
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        ...(image ? { image: [`${siteUrl}${image}`] } : {}),
        ...(published ? { datePublished: published, dateModified: published } : {}),
        ...(section ? { articleSection: section } : {}),
        publisher: { "@id": ORG_ID },
        author: { "@id": ORG_ID },
        isPartOf: { "@id": SITE_ID },
      }}
    />
  );
}

/**
 * A role, a discipline or a service: what WorldEmp offers, as a Service.
 *
 * `Service` rather than `JobPosting` deliberately - these pages describe a
 * capability a client can buy, not a vacancy, and marking them as vacancies
 * would put them in job search results under false pretences.
 */
export function ServiceSchema({
  locale,
  path,
  name,
  description,
  category,
}: {
  locale: Locale;
  path: string;
  name: string;
  description?: string;
  category?: string;
}) {
  const url = absolute(locale, path);

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "Service",
        "@id": `${url}#service`,
        name,
        description,
        url,
        inLanguage: locale,
        ...(category ? { serviceType: category } : {}),
        provider: { "@id": ORG_ID },
        areaServed: ["NL", "BE", "DE", "EU"],
      }}
    />
  );
}

/**
 * Questions and answers, where a page is actually a list of them.
 *
 * Only emitted when the page really is an FAQ - marking arbitrary
 * heading/paragraph pairs as an FAQPage is the kind of thing that gets
 * structured data ignored site-wide.
 */
export function FaqSchema({
  qa,
}: {
  qa: { question: string; answer: string }[];
}) {
  if (qa.length < 2) return null;

  return (
    <Script
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: qa.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }}
    />
  );
}
