"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useContent } from "@/lib/content-context";

/**
 * Newsletter sign-up band, as the live site carries above its footer.
 *
 * NOTE: like the contact form, this has no backend. It validates the address
 * and shows the confirmed state, but nothing is sent - wire `submit()` to the
 * mailing list before launch.
 */
export function Newsletter() {
  const { t } = useContent();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t.newsletterInvalid);
      return;
    }
    setError(null);
    setState("sending");
    // TODO: replace with a real POST once the endpoint exists.
    await new Promise((resolve) => setTimeout(resolve, 600));
    setState("done");
  }

  return (
    <section className="border-t border-we-line bg-we-paper py-14">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className="text-balance font-display text-[clamp(1.15rem,2.2vw,1.6rem)] leading-snug text-we-indigo">
            {t.newsletterHeading}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-we-muted">{t.newsletterBody}</p>
        </div>

        <AnimatePresence mode="wait">
          {state === "done" ? (
            <motion.p
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-sm font-semibold text-we-indigo"
            >
              <span
                aria-hidden
                className="we-gradient flex h-9 w-9 items-center justify-center rounded-full text-white"
              >
                &#10003;
              </span>
              {t.newsletterDone}
            </motion.p>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col gap-2"
            >
              <div className="flex gap-2">
                <label htmlFor="newsletter-email" className="sr-only">
                  {t.newsletterPlaceholder}
                </label>
                <input
                  id="newsletter-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={t.newsletterPlaceholder}
                  aria-invalid={error ? true : undefined}
                  className="min-w-0 flex-1 rounded-full border border-we-line bg-white px-5 py-3.5 text-sm text-we-ink outline-none transition-all duration-300 placeholder:text-we-muted/70 focus:border-we-indigo focus:ring-4 focus:ring-we-indigo/10"
                />
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="group relative shrink-0 overflow-hidden rounded-full bg-we-indigo px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70"
                >
                  <span className="relative z-10">{t.newsletterSubmit}</span>
                  <span className="we-gradient absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                </button>
              </div>
              {error ? <p className="px-5 text-xs text-we-crimson">{error}</p> : null}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
