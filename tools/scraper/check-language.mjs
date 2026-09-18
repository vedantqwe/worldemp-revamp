#!/usr/bin/env node
/**
 * Finds text that is in the wrong language for the edition it sits in.
 *
 *     node tools/scraper/check-language.mjs           a summary
 *     node tools/scraper/check-language.mjs --blocks  every offending block
 *
 * The live site publishes an English edition of most pages, but a good number
 * of them were never actually translated: the English URL exists, the English
 * page renders, and the words on it are Dutch. The crawl carries that
 * faithfully, which is correct of the crawl and no use to a reader who has
 * just clicked EN.
 *
 * Detection is a stop-word vote. Dutch and English share too much vocabulary
 * to judge a sentence on any single word, but across a paragraph the function
 * words separate cleanly - "het/een/van/zijn/niet" against
 * "the/and/of/with/your" - and a paragraph is the unit that gets translated.
 * Anything under a dozen words is left alone: a heading like "Finance" or a
 * name like "Barry Tempelaar" is neither language and guessing at it only
 * produces noise.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');

/** Function words that only one of the two languages actually uses. */
const NL = new Set([
  'het', 'een', 'van', 'zijn', 'wordt', 'worden', 'niet', 'maar', 'ook', 'deze',
  'bij', 'naar', 'uit', 'hun', 'jouw', 'jij', 'wij', 'graag', 'veel', 'voor',
  'met', 'om', 'te', 'dat', 'die', 'als', 'aan', 'door', 'over', 'geen',
  'heeft', 'hebben', 'kunnen', 'kan', 'zo', 'nog', 'wel', 'onze', 'ons', 'je',
  'er', 'waar', 'wat', 'hoe', 'binnen', 'tussen', 'samen', 'altijd', 'zeer',
]);
const EN = new Set([
  'the', 'and', 'of', 'with', 'your', 'our', 'are', 'is', 'this', 'that',
  'they', 'have', 'has', 'from', 'by', 'for', 'you', 'we', 'their', 'these',
  'which', 'will', 'can', 'more', 'also', 'not', 'but', 'about', 'into',
  'within', 'between', 'together', 'always', 'very', 'how', 'what', 'where',
]);

/** 'nl', 'en', or null when the text is too short or too even to call. */
export function detect(text) {
  const words = String(text).toLowerCase().match(/[a-zà-ÿ']+/g) ?? [];
  if (words.length < 12) return null;
  let nl = 0;
  let en = 0;
  for (const w of words) {
    if (NL.has(w)) nl += 1;
    if (EN.has(w)) en += 1;
  }
  if (nl + en < 4) return null;
  // A clear majority, not a hair's breadth: mixed quotes and brand names
  // otherwise flip a paragraph on one word.
  if (nl >= en * 2) return 'nl';
  if (en >= nl * 2) return 'en';
  return null;
}

const pages = JSON.parse(
  await fs.readFile(path.join(ROOT, 'src/content/pages.json'), 'utf8'),
);

const showBlocks = process.argv.includes('--blocks');
const offenders = [];
let checked = 0;

for (const entry of pages) {
  for (const locale of ['en', 'nl']) {
    const edition = entry[locale];
    if (!edition) continue;
    const wrong = [];
    for (const [i, block] of edition.blocks.entries()) {
      const text =
        block.type === 'text' || block.type === 'heading' || block.type === 'quote'
          ? block.text
          : block.type === 'list'
            ? block.items.join(' ')
            : null;
      if (!text) continue;
      checked += 1;
      const found = detect(text);
      if (found && found !== locale) wrong.push({ i, type: block.type, text, found });
    }
    if (wrong.length) offenders.push({ route: entry.route, locale, wrong, total: edition.blocks.length });
  }
}

offenders.sort((a, b) => b.wrong.length - a.wrong.length);

const byKind = {};
for (const o of offenders) {
  const kind = pages.find((p) => p.route === o.route).kind;
  byKind[kind] = (byKind[kind] ?? 0) + 1;
}

console.log(`${checked} text blocks checked across ${pages.length} routes`);
console.log(`${offenders.length} editions carry text in the other language`);
console.log('by kind:', byKind);
console.log(
  `worst offenders:\n` +
    offenders
      .slice(0, 12)
      .map((o) => `  ${o.wrong.length}/${o.total} blocks  ${o.locale}  ${o.route}`)
      .join('\n'),
);

if (showBlocks) {
  for (const o of offenders) {
    console.log(`\n=== ${o.locale} ${o.route}`);
    for (const w of o.wrong) console.log(`  [${w.i}] ${w.type} (${w.found}) ${w.text.slice(0, 110)}`);
  }
}

process.exit(offenders.length ? 1 : 0);
