import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Maven_Pro, Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Newsletter } from "@/components/Newsletter";
import { getContent } from "@/lib/content";
import { ContentProvider } from "@/lib/content-context";
import { isLocale, locales, ui } from "@/lib/i18n";
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
    metadataBase: new URL("https://worldemp.com"),
    title: {
      default: `${site.name} | ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: site.mission,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", nl: "/nl" },
    },
    openGraph: {
      title: `${site.name} | ${site.tagline}`,
      description: site.mission,
      type: "website",
      siteName: site.name,
      locale: locale === "nl" ? "nl_NL" : "en_GB",
    },
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
