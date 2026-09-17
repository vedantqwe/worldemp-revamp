@AGENTS.md

# WorldEmp Revamp

A visual and interaction rebuild of the public **worldemp.com** marketing site.
Next.js 16 (App Router) + React 19 + Tailwind v4 + framer-motion.

## The one hard rule: do not change the palette

The brief is to change how the site *looks and feels*, keeping the existing
brand colours exactly. Every colour token in `src/app/globals.css` was sampled
from the live site's own theme (the Dynamicweb CMS injects them inline as
`--BackgroundColor` / `--Color`):

| Token | Hex | Role on the live site |
| --- | --- | --- |
| `--color-we-indigo` | `#150958` | BrandColor1, primary, footer background |
| `--color-we-magenta` | `#9e1c50` | accent |
| `--color-we-blue` | `#2962b2` | secondary, footer text |
| `--color-we-crimson` | `#bd2230` | tag accent |
| `--color-we-violet` / `plum` / `purple` | `#3c0069` / `#631453` / `#4a1055` | gradient ramp |
| `--color-we-ink` | `#14191f` | body text |
| `--color-we-paper` | `#f9fafb` | section background |
| `--color-we-void` | `#060219` | footer |

Fonts are also the live site's: **Poppins** (display) and **Maven Pro** (body),
loaded via `next/font`. The live site also loads Pathway Extreme; it is not used
here.

## Where things live

- `src/lib/content.ts` — every string on the site, transcribed from the live
  English edition (`worldemp.com/en/homepage`). Edit copy here, not in JSX.
- `src/components/` — one file per section. `ui/Reveal.tsx` holds the two
  motion primitives (`Reveal`, `RevealWords`) that everything else uses.
- `src/app/` — routes. All static, all prerendered.

## Design decisions worth keeping

Borrowed deliberately, and why:

- **Mega-menu as a full-width overlay panel with grouped columns** (from
  Accenture) — a section with ten children stays as readable as one with two.
- **Text-forward hero, no stock photograph** (Accenture) — depth comes from the
  brand gradient mesh and parallax, so the headline stays loudest.
- **Expand/collapse discipline rows** (Accenture's toggle-card) — one open at a
  time, so 33 job titles never become a wall of text.
- **Scroll-driven timeline rail** (the GSAP ScrollTrigger idea from the Webflow
  reference, implemented with framer-motion's `useScroll` so there is no second
  animation library).
- **Carousel with an explicit play/pause** (Accenture) — motion that moves on
  its own must be stoppable. It also pauses on hover and focus.
- **Asymmetric bento grid** for the five pillars — unequal cells give the eye a
  reading order that five identical cards do not.

## Motion rules

- Every animation honours `prefers-reduced-motion` via `useReducedMotion()`,
  and `globals.css` additionally clamps durations under that media query.
- Word-reveal headings are SSR'd at `opacity: 0`. `RevealWords` therefore emits
  an `sr-only` copy of the full string for assistive tech, and `layout.tsx`
  carries a `<noscript>` rule that forces `.we-reveal-word` visible. **Do not
  remove either** without replacing the fallback.
- Only one number counts up on the page (the 40-70% claim). Used twice it reads
  as a gimmick.

## Known gaps (not yet done)

- **The contact form has no backend.** `src/components/ContactForm.tsx`
  validates and fakes a 700ms submit. Wire it to a real endpoint before launch.
- **`/privacy` is a placeholder.** The approved statement still needs migrating
  from `worldemp.com/nl/privacy-cookiestatement`.
- **English only.** The live site is Dutch-primary with an English edition; no
  locale routing here yet.
- **Client logos are set as wordmarks**, not images — the CMS originals are
  low-resolution thumbnails.
- Social URLs in `Footer.tsx` are guesses and need checking.

## Commands

```bash
npm run dev     # http://localhost:3000
npm run build   # all routes should prerender static
npx eslint src  # next lint is gone in Next 16
```
