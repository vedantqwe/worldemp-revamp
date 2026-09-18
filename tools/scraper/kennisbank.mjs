#!/usr/bin/env node
/**
 * Reads the live knowledge-base index, page by page, and records which
 * articles it actually lists.
 *
 *     node tools/scraper/kennisbank.mjs
 *
 * The crawl finds articles by following links, which turns up every URL the
 * CMS will serve - including the copies. worldemp.com publishes the same
 * article at several addresses (`/vervolg-op-ons-iso-42001-traject` and
 * `-traject-1`, `/kubo-80` and `/kubo-80-jaar`), and it publishes some of them
 * a second time in the other language under its own slug. Followed blindly,
 * that is what puts the same piece on the index three times with three
 * different photographs.
 *
 * The index itself is the answer: it is paginated, it is what a visitor sees,
 * and it lists each article once. This records that list - the order, the card
 * image and the labels - and src/content/kennisbank.json becomes the authority
 * on which articles exist and what picture belongs to each.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'src/content/kennisbank.json');

const INDEXES = {
  nl: 'https://worldemp.com/nl/over-ons/kennisbank',
  en: 'https://worldemp.com/en/about-us/knowledge-base',
};

/** The resizer hands out thumbnails; the original is in its query string. */
function originalImage(src) {
  if (!src) return null;
  try {
    const url = new URL(src, 'https://worldemp.com');
    const image = url.searchParams.get('Image');
    return image ? `https://worldemp.com${image}` : url.href;
  } catch {
    return null;
  }
}

const browser = await chromium.launch();
const page = await browser.newPage();
const listed = {};

for (const [locale, base] of Object.entries(INDEXES)) {
  const seen = new Map();

  for (let pageNum = 1; pageNum <= 12; pageNum += 1) {
    const url = pageNum === 1 ? base : `${base}?PageNum=${pageNum}`;
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1200);

    const cards = await page.evaluate(() =>
      [...document.querySelectorAll('.news-grid-overview__list > li')].map((li) => {
        // Everything is read from inside the card's own link. Querying the
        // <li> instead paired headings with the wrong cards - the English
        // index came back with every title shifted one row down.
        const link = li.querySelector('a[href]');
        if (!link) return { href: null };
        const img = link.querySelector('img');
        const heading = link.querySelector('h2, h3, .news-grid-list-item__title');
        return {
          href: link.getAttribute('href'),
          title: (heading?.textContent ?? '').trim(),
          image: img?.getAttribute('src') ?? null,
          labels: [...link.querySelectorAll('.news-grid-list-item__label-wrapper, .news-grid-list-item__label')]
            .map((l) => l.textContent.trim())
            .filter(Boolean),
        };
      }),
    );

    const fresh = cards.filter((c) => c.href && !seen.has(c.href));
    for (const card of fresh) {
      seen.set(card.href, {
        path: card.href.split('#')[0].replace(/\/$/, ''),
        title: card.title,
        image: originalImage(card.image),
        labels: [...new Set(card.labels)],
        position: seen.size,
      });
    }

    console.log(`${locale} page ${pageNum}: ${cards.length} cards, ${fresh.length} new`);
    // The CMS serves the last page again for any page past the end, so a page
    // that adds nothing is the end of the list.
    if (!fresh.length) break;
  }

  listed[locale] = [...seen.values()];
}

await browser.close();

await fs.writeFile(OUT, `${JSON.stringify(listed, null, 1)}\n`);
console.log(
  `\nwrote src/content/kennisbank.json ` +
    `(${listed.nl?.length ?? 0} nl, ${listed.en?.length ?? 0} en articles listed)`,
);
