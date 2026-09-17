"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Status = "idle" | "submitting" | "done";

const roles = ["IT", "Data", "Finance", "Engineering", "Something else"];

/**
 * NOTE: this form has no backend yet. It validates and shows the success
 * state, but nothing is sent anywhere - wire `submit()` to an API route,
 * a form service, or the existing CRM before this goes live.
 */
export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const next: Record<string, string> = {};

    if (!String(data.get("name") ?? "").trim()) next.name = "Please tell us your name.";
    const email = String(data.get("email") ?? "").trim();
    if (!email) next.email = "We need an email address to reply to.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "That address looks incomplete.";
    if (!String(data.get("message") ?? "").trim()) next.message = "A sentence or two is plenty.";

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
          <h2 className="mt-5 font-display text-2xl text-we-ink">Thank you</h2>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-we-muted">
            We will come back to you within one working day with a market analysis for
            the role you described.
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
                Name
              </label>
              <input id="name" name="name" className={field} placeholder="Your name" />
              {errors.name ? (
                <p className="mt-1.5 text-xs text-we-crimson">{errors.name}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium text-we-ink">
                Company
              </label>
              <input id="company" name="company" className={field} placeholder="Company name" />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-we-ink">
                Email
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
                Discipline
              </label>
              <select id="discipline" name="discipline" className={field} defaultValue={roles[0]}>
                {roles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-2 block text-sm font-medium text-we-ink">
              Which role are you looking to fill?
            </label>
            <textarea
              id="message"
              name="message"
              rows={5}
              className={`${field} resize-none`}
              placeholder="Tell us about the role, the team and the timeline."
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
              {status === "submitting" ? "Sending..." : "Send request"}
            </span>
            <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
