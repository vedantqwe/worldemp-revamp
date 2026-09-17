import Image from "next/image";
import Link from "next/link";
import { nav, site } from "@/lib/content";

const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/worldemp" },
  { label: "YouTube", href: "https://www.youtube.com/@worldemp" },
  { label: "Facebook", href: "https://www.facebook.com/worldemp" },
  { label: "X", href: "https://x.com/worldemp" },
];

export function Footer() {
  return (
    <footer className="bg-we-void text-white">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Image
              src="/brand/worldemp-logo-white.png"
              alt={site.name}
              width={199}
              height={93}
              className="h-10 w-auto"
            />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/55">
              {site.mission}
            </p>
            <p className="mt-6 text-sm text-white/45">
              Within 2 to 6 weeks, a qualified, fitting colleague.
            </p>
            <a
              href={site.phoneHref}
              className="mt-6 inline-block font-display text-lg font-semibold transition-colors hover:text-we-magenta"
            >
              {site.phone}
            </a>
          </div>

          <div className="grid gap-10 sm:grid-cols-3">
            {nav
              .filter((item) => item.children)
              .map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-we-magenta">
                    {item.label}
                  </p>
                  <ul className="mt-4 space-y-2.5">
                    {item.children?.map((child) => (
                      <li key={child.href}>
                        <Link
                          href={child.href}
                          className="text-sm text-white/55 transition-colors hover:text-white"
                        >
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-we-magenta">
                Follow
              </p>
              <ul className="mt-4 space-y-2.5">
                {social.map((s) => (
                  <li key={s.label}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-flex items-center gap-1.5 text-sm text-white/55 transition-colors hover:text-white"
                    >
                      {s.label}
                      <span
                        aria-hidden
                        className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                      >
                        &#8599;
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy &amp; cookie statement
            </Link>
            <Link href="/sitemap" className="transition-colors hover:text-white">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
