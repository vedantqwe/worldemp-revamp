# content/

Written by people. Everything in `src/content/` is written by the scraper.

`tools/scraper` rewrites `src/content/pages.json` wholesale on every
`npm run sync`, so anything typed into it disappears at the next crawl. These
files sit on top of it instead and survive, which is what lets "re-scrape the
live site" and "fix this headline" both be true at once.

| File | Lays over | Edited at |
| --- | --- | --- |
| `copy.json` | the defaults in `src/lib/content.ts` | `/admin` -> Site copy |
| `pages.json` | the crawled editions in `src/content/pages.json` | `/admin` -> Page overrides |

A field left blank is treated as *not set*, not as *set to nothing*, so a
half-filled form cannot blank the copy underneath it. To genuinely empty
something, edit the default in source.

`node tools/cms/check-overrides.mjs` checks these files parse and that every
route named in `pages.json` is a route that exists.
