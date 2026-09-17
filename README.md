# WorldEmp Revamp

A visual and interaction rebuild of the public [worldemp.com](https://worldemp.com)
marketing site, on Next.js 16 (App Router), React 19, Tailwind v4 and framer-motion.

The brief: change how the site **looks and feels**, keep the brand colours exactly.
Every colour token in `src/app/globals.css` was sampled from the live site's own
theme, and the typefaces (Poppins, Maven Pro) are the ones the live site loads.
See [CLAUDE.md](CLAUDE.md) for the palette table and the design decisions.

## Running it

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build    # every route prerenders static
npx eslint src   # `next lint` was removed in Next 16
```

## Structure

| Path | What it holds |
| --- | --- |
| `src/lib/content.ts` | Every string on the site, transcribed from the live English edition. Edit copy here. |
| `src/components/` | One file per section; `ui/Reveal.tsx` has the shared motion primitives. |
| `src/app/` | Routes: `/`, `/services`, `/solutions`, `/method`, `/about`, `/contact`, `/sitemap`, `/privacy`. |

## Before this goes live

- **The contact form has no backend** — it validates and fakes a submit.
- **`/privacy` is a placeholder** — migrate the approved statement.
- **English only** — the live site is Dutch-primary with an English edition.
- Footer social URLs are guesses and need checking.
