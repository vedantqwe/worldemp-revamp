import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Maven_Pro, Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/lib/content-context";
import { isLocale, locales, ui } from "@/lib/i18n";
import { absolute, indexable, siteUrl } from "@/lib/seo";
import { OrganizationSchema } from "@/components/seo/StructuredData";
import "../globals.css";

/**
 * Poppins and Maven Pro are the faces the live worldemp.com loads. Keeping
 * them preserves the brand voice while the layout around them changes.
 */
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const maven = Maven_Pro({
  variable: "--font-maven",
  subsets: ["latin"],
  display: "swap",
});

/**
 * The root layout sits under the locale segment so `<html lang>` is right for
 * each edition, which Next supports explicitly for internationalised apps.
 * Both locales are enumerated here, so every route still prerenders.
 */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { site } = getContent(locale);

  return {
    // Absolute URLs everywhere downstream: relative Open Graph images are a
    // common way for a card to break once it leaves the site.
    metadataBase: new URL(siteUrl),
    title: {
      default: `${site.name} | ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: site.mission,
    applicationName: site.name,
    authors: [{ name: site.name, url: siteUrl }],
    creator: site.name,
    publisher: site.name,
    alternates: {
      canonical: absolute(locale),
      languages: {
        en: absolute("en"),
        nl: absolute("nl"),
        "x-default": absolute("en"),
      },
    },
    robots: indexable
      ? { index: true, follow: true }
      : { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      title: `${site.name} | ${site.tagline}`,
      description: site.mission,
      type: "website",
      url: absolute(locale),
      siteName: site.name,
      locale: locale === "nl" ? "nl_NL" : "en_GB",
      alternateLocale: locale === "nl" ? "en_GB" : "nl_NL",
    },
    twitter: { card: "summary_large_image", title: site.name, description: site.mission },
    formatDetection: { telephone: false },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const content = getContent(locale);

  return (
    <html
      lang={locale}
      className={`${poppins.variable} ${maven.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        {/* Who publishes this site, once per page. Nothing renders. */}
        <OrganizationSchema locale={locale} />
        {/* Word-reveal headings are server-rendered at opacity 0 by
            framer-motion. Without JS they would never animate in, leaving the
            H1 blank, so force them visible in that case. */}
        <noscript>
          <style>{`.we-reveal-word{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <ContentProvider locale={locale} content={content}>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-we-indigo focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-white"
          >
            {ui[locale].skipToContent}
          </a>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Newsletter />
          <Footer />
        </ContentProvider>
      </body>
    </html>
  );
}
