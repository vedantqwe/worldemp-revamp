@AGENTS.md

# WorldEmp Revamp

A visual and interaction rebuild of the public **worldemp.com** marketing site.
Next.js 16 (App Router) + React 19 + Tailwind v4 + framer-motion.

Bilingual (`/en`, `/nl`), and carrying the live site's full public content -
125 migrated pages, crawled rather than retyped.

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

Two kinds of copy, kept apart on purpose:

- `src/lib/content.ts` — **hand-authored** copy for the designed sections: the
  homepage, the section mastheads, the navigation, the form. Keyed by locale
  (`en` from the live English edition, `nl` from the Dutch one, which is the
  live site's primary language). Edit copy here, not in JSX.
- `src/content/pages.json` — **generated**. Every long-form page migrated from
  the live site, one entry per route with an `en` and an `nl` side. Never edit
  by hand; re-run the scraper. Read it only through `src/lib/pages.ts`, which
  is server-only - the file is ~2.7 MB and would otherwise ship to the browser.
- `src/content/site.json` — **generated**. The client logo rail and the
  testimonial cards: site-wide assets that belong to the designed homepage
  rather than to any one page. Read through `src/lib/site.ts`. Small enough to
  import into a client component, which the marquee and the carousel are.

Everything else:

- `src/lib/i18n.ts` — locales, interface strings, `localeHref`,
  `switchLocalePath`.
- `src/lib/content-context.tsx` — carries the active locale's copy to the
  client sections, which would otherwise need two objects threaded through a
  dozen components as props.
- `src/components/` — one file per designed section. `ui/Reveal.tsx` holds the
  two motion primitives (`Reveal`, `RevealWords`) that everything else uses.
- `src/components/content/` — the templates the migrated pages render through:
  `ContentPage` (the shell), `ContentBlocks` (the block renderer), `CardGrid`,
  `SectionRail`.
- `src/components/brand/` — the logo. `logo-paths.ts` is generated.
- `src/app/[locale]/` — routes. All static, all prerendered (277 pages). `/`
  redirects to `/en` via `next.config.ts`.
- `tools/scraper/` — the Crawlee + Playwright crawler and the content build.
- `tools/brand/` — vectorises the logo master.

## The logo is drawn, not loaded

The only master the CMS holds is a 298x137 PNG, which was being scaled down to
a 34px header logo - soft on any screen, obviously so on a retina one. It is
traced once into outlines by `tools/brand/build-logo.mjs`
(alpha → upscale → blur → threshold → potrace), giving ~97% pixel agreement
with the original and identical shapes by eye.

`<Logo>` renders those paths inline, so the tone can flip between the
transparent-on-hero header and the solid one with no second request and no
swap flicker. The gradient runs `--color-we-indigo` → `--color-we-crimson`,
which is what the master's own gradient was sampled as, so the palette rule
holds. The one deliberate change from the master: the wordmark is nudged 5px
up, to sit optically centred on the monogram's bowl rather than on the
diagonal stroke, which overshoots the letterforms.

Regenerate with `npm install && npm run build-logo` in `tools/brand`.

## Content is crawled, not retyped

`tools/scraper` runs a `PlaywrightCrawler`, so Crawlee owns link discovery,
the queue, retries and concurrency, and the only bespoke part is
`extract.mjs`. Playwright rather than plain HTTP because the Dynamicweb
templates lazy-load images and build parts of the navigation client-side.

```bash
cd tools/scraper
npm install && npx playwright install chromium
npm run sync            # crawl, then rebuild src/content + public/media
```

**Stop `next dev` before crawling.** The crawler writes into
`tools/scraper/storage/`, inside the project, and the dev server's watcher
turns every write into a browser reload.

Things worth knowing about the migration:

- The live site translates its slugs (`/nl/over-ons` vs `/en/about-us`). The
  revamp keeps **one English slug per page behind a locale prefix**, so a page
  is one route with two content sources and the language switcher is a segment
  swap rather than a lookup table someone has to keep in step. The two
  editions are paired through the `hreflang` alternates the CMS emits.
- Images are pulled from the CMS *originals*, not the resizer thumbnails the
  pages reference, then re-encoded to webp at max 1600px into `public/media/`.
- Two sector pages are published but linked from nowhere on the live site, so
  they are seeded by hand in `main.mjs`.
- 25 image references on the live site are dead (the file 404s through both
  the resizer and its original path). They are dropped, and reported.
- Three things on the page are not prose and are captured separately: the
  **client logo rail** (`.we-logoslider-greyscale`), the **testimonial cards**
  (`section.cta-paragraph.carousel-cell`), and the **category labels**. The
  labels only ever appear on the listing pages, never on the article itself,
  so they are collected against the link they point at and stitched together
  across pages by the content build.
- The case pages set their figures as heading/paragraph pairs ("Start" /
  "Samenwerking gestart in 2019"). A run of three or more is folded into one
  `stats` block, so they render as a figure row rather than as stray
  subheadings.
- Attribution lines come out of the CMS shouted ("BARRY TEMPELAAR, CEO
  BLUEDESK"). They are re-cased, with a short list of brand spellings
  (`myShop`, `Data2Performance`, `KUBO`) that a generic title-caser destroys.

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

- **Neither form has a backend.** `ContactForm.tsx` and `Newsletter.tsx` both
  validate and fake a submit. Wire them to real endpoints before launch.
- **`/privacy` is a placeholder.** The approved statement still needs migrating
  from `worldemp.com/nl/privacy-cookiestatement`.
- **Some knowledge-base articles are Dutch under `/en`.** That is the live
  site's own state: the English edition of those pages exists but was never
  translated, so the crawl faithfully carries Dutch text. Pages missing an
  edition entirely fall back to the other language with a visible note; these
  cannot be detected that way.
- Social URLs in `Footer.tsx` are guesses and need checking.

## Commands

```bash
npm run dev       # http://localhost:3000
npm run build     # all routes should prerender static (277 pages)
npx eslint src tools   # next lint is gone in Next 16
npm run build:pages    # static export for GitHub Pages -> out/

cd tools/scraper && npm run sync        # re-migrate content from the live site
cd tools/brand   && npm run build-logo  # re-vectorise the logo
```
