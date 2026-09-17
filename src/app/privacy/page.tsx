import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Privacy & cookie statement",
};

/**
 * PLACEHOLDER. The live site's legal text has not been migrated - copy the
 * approved statement from worldemp.com/nl/privacy-cookiestatement before
 * this page is published.
 */
export default function PrivacyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy & cookie statement" />
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-5 sm:px-8">
          <p className="rounded-2xl border border-we-line bg-we-paper p-6 text-sm leading-relaxed text-we-muted">
            This page is a placeholder. The approved privacy and cookie statement
            still needs to be migrated from the current site before launch.
          </p>
        </div>
      </section>
    </>
  );
}
