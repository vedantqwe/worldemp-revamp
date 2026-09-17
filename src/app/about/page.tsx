import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { FounderQuote } from "@/components/Proposition";
import { Testimonials } from "@/components/Testimonials";
import { CtaBand } from "@/components/CtaBand";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: site.mission,
};

const values = [
  {
    title: "Human first",
    body: "Every placement is a person joining a team, not a line on an invoice. Cultural fit is assessed as seriously as technical skill.",
  },
  {
    title: "No hidden economics",
    body: "One all-in rate. No placement fee, no margin buried in the small print, and no billing before someone starts.",
  },
  {
    title: "Genuinely global",
    body: "Twenty years of building talent pools outside the local market, so a scarce role is a search problem rather than a dead end.",
  },
  {
    title: "Accountable after day one",
    body: "Performance management, upskilling and HR support continue for as long as the colleague works with you.",
  },
];

const faqs = [
  {
    q: "How quickly can someone start?",
    a: "Two to six weeks from intake, depending on the scarcity of the role. You see a shortlist in week two.",
  },
  {
    q: "What does the all-in rate include?",
    a: "Recruitment, talent assessment, cultural and technical testing, a workplace in the WorldEmp office, performance management, the virtual working environment, and team outings.",
  },
  {
    q: "Do we pay a placement fee?",
    a: "No. Recruitment is included, and billing begins only when an employee actually starts with you.",
  },
  {
    q: "Who employs the colleague?",
    a: "We do. Employment, payroll and compliance sit with WorldEmp, so your entity does not carry that risk.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="We connect knowledge, capacity and demand"
        intro={site.mission}
      />

      <section id="mission" className="scroll-mt-28 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <h2 className="max-w-2xl text-balance font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.08]">
              Mission and core values
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {values.map((value, i) => (
              <Reveal key={value.title} delay={i * 0.06}>
                <div className="h-full rounded-3xl border border-we-line bg-we-paper p-8">
                  <h3 className="font-display text-xl text-we-ink">{value.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-we-muted">{value.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FounderQuote />

      <section id="faq" className="scroll-mt-28 bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <h2 className="text-balance font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.08]">
              Frequently asked questions
            </h2>
          </Reveal>
          <dl className="mt-12 divide-y divide-we-line border-y border-we-line">
            {faqs.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 0.05} y={14}>
                <div className="py-7">
                  <dt className="font-display text-lg text-we-ink">{faq.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-we-muted">{faq.a}</dd>
                </div>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <Testimonials />
      <CtaBand />
    </>
  );
}
