import type { Metadata } from "next";
import { Maven_Pro, Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/lib/content";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://worldemp.com"),
  title: {
    default: `${site.name} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.mission,
  openGraph: {
    title: `${site.name} | ${site.tagline}`,
    description: site.mission,
    type: "website",
    siteName: site.name,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${maven.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-white">
        {/* Word-reveal headings are server-rendered at opacity 0 by
            framer-motion. Without JS they would never animate in, leaving the
            H1 blank, so force them visible in that case. */}
        <noscript>
          <style>{`.we-reveal-word{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
