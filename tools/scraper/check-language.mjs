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
 *
 * Headings are voted on separately and at a much lower bar. "De juiste Finance
 * expert voor jouw uitdaging" is six words and was the first thing on the page
 * a reader saw; a twelve-word minimum sailed straight past it and the tool
 * reported the page clean. Two or more words and a Dutch majority is enough,
 * which does mean a name has to be ruled out explicitly - "Chris van der
 * Deijl" is three Dutch function words and a surname.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');

/*
 * Function words that only one of the two languages actually uses.
 *
 * "only" is doing real work in that sentence. The obvious candidates are not
 * all safe: is, we, over, door, in, me and been are spelled the same in both,
 * and each one on its own flipped a heading the wrong way - "Vooruitdenken is
 * vooruitkomen" read as English on the strength of "is" alone. They are left
 * out, and what remains is words that only ever belong to one side.
 */
const NL = new Set([
  'het', 'een', 'van', 'zijn', 'wordt', 'worden', 'niet', 'maar', 'ook', 'deze',
  'bij', 'naar', 'uit', 'hun', 'jouw', 'jij', 'wij', 'graag', 'veel', 'voor',
  'met', 'om', 'te', 'dat', 'die', 'als', 'aan', 'geen', 'heeft', 'hebben',
  'kunnen', 'kan', 'zo', 'nog', 'wel', 'onze', 'ons', 'je', 'er', 'waar',
  'wat', 'hoe', 'binnen', 'tussen', 'samen', 'altijd', 'zeer', 'waarom',
  'welke', 'zonder', 'tot', 'bijvoorbeeld', 'echter', 'daarom', 'omdat',
]);
const EN = new Set([
  'the', 'and', 'of', 'with', 'your', 'our', 'are', 'this', 'that',
  'they', 'have', 'has', 'from', 'by', 'for', 'you', 'their', 'these',
  'which', 'will', 'more', 'also', 'but', 'about', 'into', 'within',
  'between', 'together', 'always', 'very', 'where', 'why', 'because',
  'without', 'through', 'each', 'both', 'been', 'than', 'when',
]);

/** Words that are a person's name rather than a language. */
const NAMES = /^(([A-Z][\wà-ÿ'-]*|van|de|der|den|het|te|ter|-)\s*)+$/;

/** 'nl', 'en', or null when the text is too short or too even to call. */
export function detect(text, { heading = false } = {}) {
  const trimmed = String(text).trim();
  if (heading && NAMES.test(trimmed)) return null;
  // "Judith van Doren, General Director of Van Lent Systems" is an English
  // line with two Dutch surname particles in it, and voting on it as written
  // calls the whole heading Dutch. A particle sitting between two capitalised
  // words is part of a name, not evidence of a language.
  const words = trimmed
    .replace(/(?<=\b[A-Z][\wà-ÿ'-]*\s)(van|de|der|den|ter|te)(?=\s[A-Z])/g, ' ')
    .toLowerCase()
    .match(/[a-zà-ÿ']+/g) ?? [];
  if (words.length < (heading ? 2 : 12)) return null;
  let nl = 0;
  let en = 0;
  for (const w of words) {
    if (NL.has(w)) nl += 1;
    if (EN.has(w)) en += 1;
  }
  if (nl + en < (heading ? 1 : 4)) return null;
  // A clear majority, not a hair's breadth: mixed quotes and brand names
  // otherwise flip a paragraph on one word. A heading has fewer words to go
  // on, so a plain majority has to do.
  if (heading) {
    if (nl > en) return 'nl';
    if (en > nl) return 'en';
    return null;
  }
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
      const found = detect(text, { heading: block.type === 'heading' });
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
