import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { nav } from "@/lib/content";

export const metadata: Metadata = {
  title: "Sitemap",
};

export default function SitemapPage() {
  return (
    <>
      <PageHero eyebrow="Sitemap" title="Everything on this site" />
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {nav.map((item) => (
            <div key={item.label}>
              <Link
                href={item.href}
                className="font-display text-lg font-semibold text-we-ink transition-colors hover:text-we-indigo"
              >
                {item.label}
              </Link>
              {item.children ? (
                <ul className="mt-3 space-y-2">
                  {item.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        className="text-sm text-we-muted transition-colors hover:text-we-indigo"
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
