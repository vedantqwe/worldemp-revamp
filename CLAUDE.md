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
- `src/app/[locale]/` — routes. All static, all prerendered (286 pages). `/`
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

## The role pages are pictured, not populated

The live site illustrates all 33 role pages with the same eleven stock
photographs of WorldEmp staff, so a Data Engineer and a Compliance Specialist
are introduced by the same man at the same desk. They are pictures of
identifiable people used as decoration, which is a poor fit for a role page and
a consent question nobody needs to have.

`tools/brand/build-role-art.mjs` gives each role and each discipline a subject
of its own: a bridge, a shipyard, a server hall, a whiteboard full of sprints.
Things rather than people - a photograph of a *different* stranger is the same
mistake with better lighting, and thirty-three pictures of someone at a laptop
say nothing the other thirty-two do not.

The pictures come from **Openverse, filtered to CC0 and public domain**, so
there is nothing to attribute and nothing to license. `public/roles/manifest.json`
records creator, source, licence and id for each, and the id pins the choice so
a rerun reproduces this set rather than whatever the index holds that day. The
subjects are curated in `role-art.queries.mjs`: search on an open archive
returns a 1905 newspaper as readily as a shipyard, so the terms and the result
index are chosen by eye from `-- --candidates` contact sheets. Six picks were
replaced after review because they had a person or a pair of hands in them.

Openverse over the illustration libraries on licence grounds: unDraw's terms
forbid downloading or scraping its assets programmatically, and Storyset,
Humaaans and IRA Design all want visible attribution, which does not belong on
a corporate marketing page.

Each is then **duotoned** into one indigo ramp. A translucent brand wash was
tried first at three strengths and does not work: weak, it leaves the yellow
cable yellow and the green door green; strong enough to unify, it fogs every
subject into mush. A duotone throws the original colour away instead, so
thirty-seven archive photographs read as one set at full contrast. Exposure is
levelled first, so a high-key photograph and a dark one arrive at the same
weight, and the discipline's accent sits in one corner to keep the four
sections apart.

`role-scenes.mjs` still draws the flat workspace scene, now as the fallback for
anything the archive cannot picture. Nothing needed it in the end. Anything in
`public/roles/` that the script did not write is left alone, so commissioned
artwork can be dropped in per role.

    cd tools/brand && npm run build-role-art
    cd tools/brand && npm run build-role-art -- --candidates   # contact sheets
    cd tools/brand && npm run build-role-art -- civil-engineer # just that one

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
- **The knowledge-base index is the authority on which articles exist.** The
  crawl follows links, so it finds every address the CMS will serve, copies
  included: worldemp.com publishes the same article at `/vervolg-op-ons-iso-42001-traject`
  and `-traject-1`, and publishes some a second time in the other language
  under their own slug. That is why the index showed the same piece three
  times with three different photographs. `tools/scraper/kennisbank.mjs` reads
  the paginated index (65 nl, 57 en) and `src/content/kennisbank.json` becomes
  the record of what is listed and which card image belongs to each. Two
  duplicate routes are dropped by the content build: exact body matches by
  hash, and language twins by their signature - one route whose English was
  translated here paired with another whose Dutch was, under near-identical
  titles.
- **Two runs of English URLs serve the wrong article.** `/en/.../kubo-80`
  returns the Offshore Energy recap; the real KUBO anniversary piece sits one
  slug further along, at `/en/.../kubo-80-jaar`. It is not a hreflang mixup -
  the English *page itself* is the wrong one, so the crawl faithfully carries
  the wrong body across. The hreflang alternates still point at the right
  pair, though, and give the shift away: two Dutch articles end up pointing at
  one English URL between them. Where that shows up, the route is named after
  the Dutch slug rather than the shifted English one, so a page still reads as
  the article it actually is.
- **Several articles share a `<title>`** - seven were called "Digitale
  kennismigranten: buitenlandse accountants duurzaam inzetten", which on an
  index is seven identical cards. Where a title is not unique the article's own
  first heading is used, skipping bylines ("Door: Peter van Londen, COO
  WorldEmp" became the name of two pieces on the first attempt), and where that
  still collides, the slug - the one name the CMS gives each page that is
  unique by construction. The index is then read for a better name still: it
  carries the editor's full headline rather than a truncated `<title>`, unless
  it repeats there too, or is in the wrong language for the edition - the live
  English index is half native, half the Dutch headline left untranslated, and
  taking those would put Dutch back on a page that already read correctly.
- **The same placeholder sits in the meta description as often as the
  `<title>`.** Where a description repeats across articles it is dropped for
  the article's own opening paragraph instead - not an edited summary, but an
  honest one.
- **The card image comes from the index**, not from the article. An article's
  first in-body picture is as often a logo or a chart as a photograph.
- The case pages set their figures as heading/paragraph pairs ("Start" /
  "Samenwerking gestart in 2019"). A run of three or more is folded into one
  `stats` block, so they render as a figure row rather than as stray
  subheadings. A label whose figure the editor left blank still counts - Saman
  Groep's "Start" has no year against it - as long as two in the run carry one,
  because an empty cell in the row beats three stray subheadings back in the
  prose.
- The CMS builds its "related pages" grids as a `<ul>` whose every `<li>` is
  one big link - image, title, summary and a "Read more" label, all inside a
  single `<a>`. Read as text, that became a bullet point naming the brand
  twice and ending in the dead words "Read more": 598 of them across 103
  pages. Such a list is captured as its links instead (`cardlinks`), and the
  content build resolves them to routes (`cards`) so the page renders the
  site's own cards. A grid whose links all point outside the migration falls
  back to the plain list, so nothing is lost to the rewrite.
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
- **A discipline page opens on the discipline** - its positioning paragraph,
  the count of roles under it, two of the brand's figures and its own picture,
  before any list of jobs. The paragraph is the homepage's solutions copy,
  reused rather than restated, and the body's opening line is dropped when it
  is the same sentence, which it usually is.
- **Pictures set beside their text, alternating sides** (the house style of the
  large consultancies) — the CMS emits an image as a sibling of the paragraphs
  around it, which renders as a column of text interrupted by full-width
  slabs. `ContentBlocks` runs a grouping pass first (`layout()`): a picture
  takes up to three of the paragraphs it belongs to into a two-column split and
  the side flips each time, pictures the CMS put back to back become a pair,
  and one with no prose to sit beside keeps the full measure. Nothing is
  cropped to a house ratio - a diagram survives letterboxing far worse than a
  photograph survives being its own shape - so what is shared is the frame, the
  radius, the entrance and the slow lift on hover. The exceptions are the
  extremes and the pairs: a portrait or a panorama is cropped to the frame the
  layout needs, and in a two-up band every tile is cropped regardless, because
  an even row is the whole reason for putting them side by side.
- **A margin column on every long page** - articles, cases, roles, services,
  disciplines, sectors and the privacy statement. The measure is set for
  reading and the masthead pins it to the left gutter, which on a wide screen
  left the right half empty: a column of white as tall as the article.
  Stretching the text across it would be worse - a 120-character line is harder
  to read than the gap - so the room goes to three things, in the order a
  reader wants them. Where am I: the page's own headings, with a marker that
  follows what you are reading. What does someone say about this: a sentence
  lifted out of the page when it has a quotable one, and a client quote with
  their portrait when it does not, picked by a hash of the route so the same
  page always shows the same person. Who do I talk to: the phone number and
  the address, live links, not a repeat of the CTA band already at the foot of
  the page. Each part is skipped when it has nothing to show, and a page with
  none of them gets no column at all - the prose centres instead of sitting
  against a void.
- **The pillar grid varies width, not height.** A double-height cell is the
  obvious way to build a bento and the wrong one here: all five pillars carry
  two lines of copy, so the tall card spent half its height empty with its
  title stranded at the bottom. Two wide cards over three narrow ones give the
  same reading order out of rows that end where the words do.
- **Every quotation is opened and closed.** Both marks are decorative and
  hidden from the accessibility tree - the blockquote carries the semantics -
  but a quote opened and never closed reads as cut off, which made complete
  sentences look truncated in the margin and in the carousel. The margin quote
  is also excerpted by sentence rather than by character count, and a quote
  whose first sentence cannot fit is not offered for that slot at all rather
  than being interrupted into one.
- **A picture is not paired with a heading that introduces what follows it.**
  A heading immediately before an image opens the section the image belongs
  to; dragging it into the column beside the image stranded it at the bottom
  of a short column against a tall photograph. It keeps its own full-width
  line and the picture pairs with what comes after.
- **A picture arrives a beat after the words beside it**, and settles back from
  a slight enlargement rather than appearing at rest (`RevealFigure`). It is
  the only motion on a content page, which is why it can afford to be slower
  than the text. Reduced motion collapses it to a fade.

## Motion rules

- Every animation honours `prefers-reduced-motion` via `useReducedMotion()`,
  and `globals.css` additionally clamps durations under that media query.
- Word-reveal headings are SSR'd at `opacity: 0`. `RevealWords` therefore emits
  an `sr-only` copy of the full string for assistive tech, and `layout.tsx`
  carries a `<noscript>` rule that forces `.we-reveal-word` visible. **Do not
  remove either** without replacing the fallback.
- Only one number counts up on the page (the 40-70% claim). Used twice it reads
  as a gimmick.

## Every control does something

A button that validates and then silently drops the input, a "Read more" that
is not a link, a nav item to a placeholder - each of those is worse than not
being there, because the visitor spends a click finding out. So:

- **Neither form has a backend, and neither pretends to.** `ContactForm.tsx`
  and `Newsletter.tsx` compose the submission as an email and hand it to the
  visitor's mail client, and the confirmation says so rather than claiming the
  message was received. The success panel carries the address and the phone
  number as well, because a mail client is not a given. Replace `submit()`
  with a POST when there is an endpoint.
- **`/privacy` carries the real statement**, migrated like any other page.
- **The footer's social links** are the four the live site's own footer uses -
  two of them are not what you would guess from the brand name.
- **`node tools/pages/check-links.mjs`** walks the built export and fails if
  any internal link or asset does not resolve. 20k links across 284 pages, so
  the claim that nothing is dead is checked rather than asserted.

Still open: the privacy statement, below.

## Both languages are actually the language they claim

The live site publishes an English edition of most pages, but a good number
were never translated: the English URL exists, the page renders, and the words
on it are Dutch. `/en/solutions/finance` opened with "De juiste Finance expert
voor jouw uitdaging". Nine further pages had no English edition at all, and two
had no Dutch one.

`src/content/translations.en.json` and `.nl.json` hold the missing side, keyed
by a **hash of the source string** rather than by route and position, so a
re-crawl that reorders or repeats a paragraph still finds its translation, and
a paragraph the live site rewrites shows up as missing rather than silently
keeping the old text. The content build swaps them in, and builds a whole
edition by translation where one is absent - flagged `translated: true`, which
the page says out loud, because a translation made here is not the same thing
as copy the company wrote and approved.

`node tools/scraper/check-language.mjs` runs two tests. The first votes on
stop words, per paragraph and, at a much lower bar, per heading. The second
catches what the vote cannot: "Infrastructuur & beheer" has no function words
in it at all, so nothing is countable - but the English page and the Dutch page
carry that string identically, and since the two editions are separate pages on
the live site, a sentence appearing byte for byte in both was either never
translated or is language-neutral. Around fifty legitimately are - names, phone
numbers, job titles Dutch uses unchanged - so that test reports rather than
fails. Read it after a crawl.

286 built pages, 285 in their own language.

The one exception is **`/en/privacy`**, deliberately. Publishing our own
English rendering of a privacy and cookie statement as the company's own is not
a build step's decision, so the English reader gets the Dutch text and is told
why. Translate it properly and drop it in when there is an approved version.

## Findable - by search engines and by answer engines

This layer only adds structure; it changes no pixel. Every page already had a
`<title>` and a description - what follows makes both machine-readable in the
ways a crawler and a language model each expect, without touching layout,
copy shown on the page, or the palette.

- **`src/lib/seo.ts`** is the one place that builds a page's `<head>` metadata.
  `pageMetadata({ locale, path, title, description, image, published, type })`
  returns canonical + hreflang (`en`, `nl`, and `x-default` pointing at `en`,
  since the two editions are one route with two content sources, never two
  different pages), Open Graph, and a Twitter card. All 19 `generateMetadata`
  functions across `src/app/[locale]/**` call it rather than building their
  own `Metadata` object, so a page cannot silently drift out of the pattern.
- **Structured data lives in `src/components/seo/StructuredData.tsx`**, one
  component per schema.org type actually justified by the content: an
  `Organization`+`WebSite` graph in the locale layout (every page), `Article`
  on insights and client stories, `Service` on the 33 role pages (`Service`,
  not `JobPosting` - these describe a capability a client can buy, and listing
  them as vacancies would put them in job search results under false
  pretences), and `BreadcrumbList` wherever a page sits under a section. Each
  renders a `<script type="application/ld+json">` that no visitor sees.
  **`FaqSchema` exists but is not used anywhere** - the FAQ page's questions
  were lost in extraction (two headings covering seventeen answers), and
  inventing the missing structure would be fabricating content, not
  describing it. Wire it up if the FAQ page is ever rebuilt with real Q/A
  pairs.
- **`src/app/robots.ts` and `src/app/sitemap.ts`** are generated, not static
  files, so they can carry `alternates.languages` per URL. Both need
  `export const dynamic = "force-static"` - the one Next 16 requirement that
  is easy to miss under `output: "export"`. `allRoutes()` in `src/lib/pages.ts`
  is the shared source both read.
- **`out/llms.txt`**, written by `tools/pages/build.mjs` alongside the root
  `index.html`, is the convention answer engines are converging on: a plain
  one-line-per-page map of the site with its description, generated from the
  same content the sitemap uses so the two cannot disagree.
- **The preview is `noindex`** until it has a real domain.
  `NEXT_PUBLIC_SITE_URL` defaults to the GitHub Pages URL; `indexable` in
  `seo.ts` is false whenever the site URL is a `github.io`, `localhost` or
  `127.0.0.1` address, which sets `robots: { index: false }` on every page and
  `Disallow: /` in `robots.txt`. Set the env var to the real domain to flip it
  on - nothing else changes.

Nothing here invents copy: a title or description a page did not already have
is not given one, and no schema is populated from a guess.

## Commands

```bash
npm run dev       # http://localhost:3000
npm run build     # all routes should prerender static (286 pages)
npx eslint src tools   # next lint is gone in Next 16
npm run build:pages    # static export for GitHub Pages -> out/
node tools/pages/check-links.mjs      # every internal link in out/ resolves
node tools/scraper/check-language.mjs # no edition carries the other language

cd tools/scraper && npm run sync        # re-migrate content from the live site
cd tools/brand   && npm run build-logo      # re-vectorise the logo
cd tools/brand   && npm run build-role-art  # redraw the role illustrations
```
