import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CtaBand } from "@/components/CtaBand";
import { services } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Digital knowledge migrants, outsourcing, secondment, recruitment and our applicant tracking system.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Five ways to work with us"
        intro="Every engagement runs on the same all-in rate: recruitment, assessment, workplace and performance management included, billed only once someone starts."
      />

      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-5 md:grid-cols-2">
            {services.map((service, i) => (
              <Reveal key={service.id} delay={i * 0.06}>
                <article
                  id={service.id}
                  className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-we-line bg-we-paper p-8 transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:bg-white hover:shadow-[0_20px_60px_-24px_rgba(21,9,88,0.35)] sm:p-10"
                >
                  <span
                    aria-hidden
                    className="we-gradient absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
                  />
                  <span className="font-display text-sm font-semibold text-we-magenta">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h2 className="mt-6 font-display text-2xl leading-snug text-we-ink">
                    {service.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-we-muted">{service.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <CtaBand />
    </>
  );
}
