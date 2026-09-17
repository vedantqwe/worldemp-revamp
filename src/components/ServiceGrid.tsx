"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useContent } from "@/lib/content-context";

/**
 * The five services as cards. Split out of the services page so the copy can
 * come from the locale context rather than being threaded through a server
 * component as props.
 */
export function ServiceGrid() {
  const { c, href } = useContent();

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {c.services.map((service, i) => (
        <motion.article
          key={service.id}
          id={service.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
          className="group relative flex h-full scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-we-line bg-we-paper p-8 transition-all duration-500 hover:-translate-y-1 hover:border-transparent hover:bg-white hover:shadow-[0_20px_60px_-24px_rgba(21,9,88,0.35)] sm:p-10"
        >
          <span
            aria-hidden
            className="we-gradient absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100"
          />
          <span className="font-display text-sm font-semibold text-we-magenta">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h2 className="mt-6 font-display text-2xl leading-snug text-we-ink">{service.name}</h2>
          <p className="mt-3 text-sm leading-relaxed text-we-muted">{service.body}</p>
          <Link
            href={href(`/services/${service.id}`)}
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-we-indigo"
          >
            {c.mastheads.services.eyebrow}
            <span
              aria-hidden
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              &rarr;
            </span>
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
