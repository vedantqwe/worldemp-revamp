"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export type Heading = { id: string; text: string };

/**
 * The contents rail beside a long page.
 *
 * The migrated pages set their copy at a reading measure and the masthead
 * pins it to the left gutter, which on a wide screen left the right half of
 * the page empty - a column of white as tall as the article. The answer is not
 * to stretch the text across it; a 120-character line is worse than the gap.
 * It is to put something there that earns the room, and on a page with twenty
 * headings the obvious candidate is the headings.
 *
 * The marker tracks the heading you are reading. It moves with a spring rather
 * than a jump, which is the only motion here, and it is the position that
 * animates rather than anything appearing or disappearing - so under reduced
 * motion the marker still moves, it just arrives immediately.
 */
export function PageContents({ headings, label }: { headings: Heading[]; label: string }) {
  const [active, setActive] = useState(headings[0]?.id ?? "");
  const reduce = useReducedMotion();

  useEffect(() => {
    const seen = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting);
        // The topmost heading currently on screen, or the last one passed.
        const current = headings.find((h) => seen.get(h.id));
        if (current) setActive(current.id);
      },
      // A band across the upper third: a heading counts as "where you are"
      // once it reaches the top of the viewport, not when it first appears.
      { rootMargin: "-88px 0px -66% 0px", threshold: 0 },
    );

    for (const heading of headings) {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 4) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-we-muted">{label}</p>
      <ul className="mt-4 space-y-0.5 border-l border-we-line">
        {headings.map((heading) => {
          const current = heading.id === active;
          return (
            <li key={heading.id} className="relative">
              {current ? (
                <span
                  aria-hidden
                  className={`absolute -left-px top-0 h-full w-px bg-we-magenta ${
                    reduce ? "" : "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
                  }`}
                />
              ) : null}
              <a
                href={`#${heading.id}`}
                aria-current={current ? "location" : undefined}
                className={`block py-1.5 pl-4 leading-snug transition-colors duration-300 ${
                  current ? "text-we-indigo" : "text-we-muted hover:text-we-ink"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
