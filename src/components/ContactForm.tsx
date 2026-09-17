"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/lib/content-context";

type Status = "idle" | "submitting" | "done";

/**
 * NOTE: this form has no backend yet. It validates and shows the success
 * state, but nothing is sent anywhere - wire `submit()` to an API route,
 * a form service, or the existing CRM before this goes live.
 */
export function ContactForm() {
  const { c } = useContent();
  const f = c.pages.form;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};

    if (!String(data.get("name") ?? "").trim()) next.name = f.errors.name;
    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = f.errors.emailMissing;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = f.errors.emailInvalid;
    if (!String(data.get("message") ?? "").trim()) next.message = f.errors.message;

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setStatus("submitting");
    // TODO: replace with a real POST once the endpoint exists.
    await new Promise((r) => setTimeout(r, 700));
    setStatus("done");
  }

  const field =
    "w-full rounded-2xl border border-we-line bg-white px-5 py-3.5 text-sm text-we-ink outline-none transition-all duration-300 placeholder:text-we-muted/70 focus:border-we-indigo focus:ring-4 focus:ring-we-indigo/10";

  return (
    <AnimatePresence mode="wait">
      {status === "done" ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-we-line bg-we-paper p-10 text-center"
        >
          <span
            aria-hidden
            className="we-gradient mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white"
          >
            &#10003;
          </span>
          <h2 className="mt-5 font-display text-2xl text-we-ink">{f.successHeading}</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-we-muted">
            {f.successBody}
          </p>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          onSubmit={submit}
          noValidate
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-we-ink">
                {f.name}
              </label>
              <input id="name" name="name" className={field} placeholder={f.namePlaceholder} />
              {errors.name ? (
                <p className="mt-1.5 text-xs text-we-crimson">{errors.name}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium text-we-ink">
                {f.company}
              </label>
              <input id="company" name="company" className={field} placeholder={f.companyPlaceholder} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-we-ink">
                {f.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className={field}
                placeholder="you@company.com"
              />
              {errors.email ? (
                <p className="mt-1.5 text-xs text-we-crimson">{errors.email}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="discipline" className="mb-2 block text-sm font-medium text-we-ink">
                {f.discipline}
              </label>
              <select
                id="discipline"
                name="discipline"
                className={field}
                defaultValue={f.disciplines[0]}
              >
                {f.disciplines.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-we-ink">
              {f.legend}
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className={`${field} resize-none`}
              placeholder={f.messagePlaceholder}
            />
            {errors.message ? (
              <p className="mt-1.5 text-xs text-we-crimson">{errors.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={status === "submitting"}
            className="group relative w-full overflow-hidden rounded-full bg-we-indigo px-8 py-4 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 sm:w-auto"
          >
            <span className="relative z-10">
              {status === "submitting" ? f.submitting : f.submit}
            </span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
