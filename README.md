# WorldEmp Revamp

A visual and interaction rebuild of the public [worldemp.com](https://worldemp.com)
marketing site, on Next.js 16 (App Router), React 19, Tailwind v4 and framer-motion.

The brief: change how the site **looks and feels**, keep the brand colours exactly.
Every colour token in `src/app/globals.css` was sampled from the live site's own
theme, and the typefaces (Poppins, Maven Pro) are the ones the live site loads.
See [CLAUDE.md](CLAUDE.md) for the palette table and the design decisions.

The site is bilingual (`/en`, `/nl`) and carries the live site's full public
content: 129 migrated pages, including 61 knowledge-base articles, six client
stories, 33 role pages and the images that go with them.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # every route prerenders static (286 pages)
npx eslint src   # `next lint` was removed in Next 16
```

## Structure

| Path | What it holds |
| --- | --- |
| `src/lib/content.ts` | Hand-authored copy for the designed sections, per locale. Edit copy here. |
| `src/content/pages.json` | Generated. The migrated long-form content, one entry per route with an `en` and `nl` side. |
| `src/content/site.json` | Generated. Client logos and testimonial cards from the live homepage. |
| `src/lib/pages.ts` | Server-only read access to the migrated pages. |
| `src/lib/site.ts` | Read access to the client logos and testimonials. |
| `src/lib/i18n.ts` | Locales, interface strings, locale-prefixed hrefs. |
| `src/components/` | One file per designed section; `ui/Reveal.tsx` has the shared motion primitives. |
| `src/components/content/` | The templates every migrated page renders through. |
| `src/components/brand/` | The logo, drawn as vectors. |
| `public/roles/` | Generated. One picture per role and per discipline, CC0 from Openverse and duotoned, in place of the live site's staff photography. `manifest.json` holds the provenance. |
| `src/app/[locale]/` | All routes. `/` redirects to `/en`. |
| `tools/scraper/` | Crawlee + Playwright crawler and the content build. |
| `tools/brand/` | Vectorises the logo master into `public/brand/*.svg` and path data. |

## Re-syncing content from the live site

```bash
cd tools/scraper
npm install && npx playwright install chromium
npm run sync          # crawl, then rebuild src/content + public/media
```

Stop `next dev` first: the crawler writes into `tools/scraper/storage/`, and
the dev server's file watcher reloads the browser on every write.

## Deploying

Any host that runs a Node server takes `npm run build` as-is. On Vercel the
repo needs no configuration - import it and the defaults are right.

GitHub Pages is a file host, so it gets its own target:

```bash
npm run build:pages     # writes out/, ready to upload
```

`.github/workflows/pages.yml` runs exactly that on every push to `main`.
The differences from the server build live in `next.config.ts` behind
`GITHUB_PAGES=1`: no redirects, a subdirectory base path, and a custom image
loader, because `basePath` does not reach an image `src` when there is no
optimiser to route it through. `tools/pages/build.mjs` then adds the three
things a file host cannot work out for itself - the root redirect to `/en`,
`.nojekyll`, and a flat copy of each router prefetch payload, which the export
writes as a directory path but the router asks for as a dotted filename.

Verified against a `next start` build: same routes, same images, no failed
requests on either.

## Before this goes live

- **Neither form has a backend.** Both compose the submission as an email and
  hand it to the visitor's mail client, which works but is not a pipeline —
  wire `submit()` in `ContactForm.tsx` and `Newsletter.tsx` to a real endpoint.
- **`/en/privacy` is in Dutch on purpose.** Every other page is now in its own
  language (`node tools/scraper/check-language.mjs` checks this), but an
  English rendering of a privacy statement is not something to publish as the
  company's own. Drop in an approved translation when there is one.
- **Eleven pages exist in one language upstream** and carry a translation made
  here, labelled as such on the page. `src/content/translations.{en,nl}.json`.
- **The role pictures are found, not commissioned.** They are public-domain
  photographs chosen by keyword from Openverse and duotoned to the brand by
  `tools/brand/build-role-art.mjs` — good enough to ship, not art-directed.
  Drop a file into `public/roles/` to replace any of them and the build leaves
  it alone.
- **Every page is `noindex` until `NEXT_PUBLIC_SITE_URL` points at a real
  domain.** Canonical URLs, hreflang, sitemap, robots.txt and llms.txt (see
  [CLAUDE.md](CLAUDE.md#findable---by-search-engines-and-by-answer-engines))
  are all in place, but the preview should not compete with worldemp.com in
  search while it is still a preview. Set the env var and it flips on.
