import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactForm } from "@/components/ContactForm";
import { Reveal } from "@/components/ui/Reveal";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Tell us the role you need to fill and we will come back with a market analysis and a shortlist.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Tell us the role"
        intro="We reply within one working day with a market analysis on how quickly it can be filled."
      />

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
          <Reveal>
            <h2 className="font-display text-2xl leading-snug text-we-ink">
              Rather talk it through?
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-we-muted">
              A fifteen-minute call is usually enough for us to tell you whether the
              role is realistic, and how long it is likely to take.
            </p>
            <a
              href={site.phoneHref}
              className="mt-8 block font-display text-2xl font-semibold text-we-indigo transition-colors hover:text-we-magenta"
            >
              {site.phone}
            </a>
            <dl className="mt-10 space-y-6 border-t border-we-line pt-8 text-sm">
              <div>
                <dt className="font-semibold text-we-ink">Response time</dt>
                <dd className="mt-1 text-we-muted">Within one working day</dd>
              </div>
              <div>
                <dt className="font-semibold text-we-ink">Shortlist</dt>
                <dd className="mt-1 text-we-muted">Typically week two</dd>
              </div>
              <div>
                <dt className="font-semibold text-we-ink">Cost to enquire</dt>
                <dd className="mt-1 text-we-muted">None - billing starts when someone starts</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal delay={0.1}>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
