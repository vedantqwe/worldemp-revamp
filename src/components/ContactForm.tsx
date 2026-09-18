"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/lib/content-context";

type Status = "idle" | "submitting" | "done";

/**
 * The enquiry form.
 *
 * There is no backend to POST to, so rather than validate the form and then
 * quietly drop it - a button that pretends - it composes the enquiry as an
 * email and hands it to the visitor's mail client. The message really does
 * reach WorldEmp, and the confirmation says what actually happened instead of
 * claiming a request was received.
 *
 * Replace `submit()` with a POST when an endpoint exists; the success panel's
 * fallback line can go at the same time.
 */
export function ContactForm() {
  const { c } = useContent();
  const f = c.pages.form;
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent<HTMLFormElement>) {
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

    // Long labels rather than bare values, because this arrives as an email a
    // person reads, not as a payload something parses.
    const lines = [
      `${f.name}: ${String(data.get("name") ?? "").trim()}`,
      `${f.company}: ${String(data.get("company") ?? "").trim() || "-"}`,
      `${f.email}: ${email}`,
      `${f.discipline}: ${String(data.get("discipline") ?? "").trim()}`,
      "",
      String(data.get("message") ?? "").trim(),
    ];
    const subject = `${f.submit} - ${String(data.get("discipline") ?? "").trim()}`;
    window.location.href =
      `mailto:${c.site.email}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(lines.join("\r\n"))}`;

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
          {/* A mail client is not a given - on a shared machine or a locked-down
              browser nothing opens at all, and the visitor is left holding a
              message they cannot send. */}
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-we-muted">
            {f.successFallback}{" "}
            <a
              href={`mailto:${c.site.email}`}
              className="font-semibold text-we-indigo underline underline-offset-4"
            >
              {c.site.email}
            </a>{" "}
            &middot;{" "}
            <a
              href={c.site.phoneHref}
              className="font-semibold text-we-indigo underline underline-offset-4"
            >
              {c.site.phone}
            </a>
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
