/**
 * Turns the Crawlee dataset into the content the site renders.
 *
 *   npm run build-content
 *
 * Reads storage/datasets/default/*.json and writes:
 *   src/content/pages.json   one entry per route, with an `en` and `nl` side
 *   public/media/*           every content image, resized and re-encoded
 *
 * The live site translates its slugs (/nl/over-ons vs /en/about-us). The
 * revamp keeps one English slug per page behind a locale prefix, so the two
 * editions of a page are paired here, through the hreflang alternates the
 * CMS emits, and stored under a single route.
 */
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const ROOT = path.resolve(import.meta.dirname, '../..');
const DATASET = path.join(import.meta.dirname, 'storage/datasets/default');
const CONTENT_DIR = path.join(ROOT, 'src/content');
const MEDIA_DIR = path.join(ROOT, 'public/media');

/** Sections of the live site that are not part of the marketing site. */
const SKIP = [
  /\/(test-author|tabs-page|product-compare|webwinkel|demo-werkwijze|werkwijze-1)/,
  /\/nieuws\//,          // duplicated knowledge-base entries under an old path
  /\/(sitemap-2|schedule-an-appointment|demo|advice)$/,
  /\/(homepage|contact-us|contact)$/,
];

/** Canonical EN path -> revamp route + the template that renders it. */
function toRoute(enPath) {
  const parts = enPath.split('/').filter(Boolean).slice(1); // drop the locale
  const [a, b, c] = parts;

  if (a === 'privacy-cookiestatement') return { route: '/privacy', kind: 'page' };

  if (a === 'about-us' && b === 'knowledge-base' && c) return { route: `/insights/${c}`, kind: 'article' };
  if (a === 'about-us' && b === 'cases' && c) return { route: `/cases/${c}`, kind: 'case' };
  if (a === 'about-us' && b === 'compliance' && c) return { route: `/about/compliance/${c}`, kind: 'page' };
  if (a === 'about-us' && b === 'compliance') return { route: '/about/compliance', kind: 'index' };
  if (a === 'about-us' && b && b !== 'knowledge-base' && b !== 'cases') return { route: `/about/${b}`, kind: 'page' };
  if (a === 'service-provision' && b) return { route: `/services/${b}`, kind: 'service' };
  if (a === 'solutions' && b && c) return { route: `/solutions/${b}/${c}`, kind: 'role' };
  if (a === 'solutions' && b) return { route: `/solutions/${b}`, kind: 'discipline' };
  if (a === 'way-of-working' && b) return { route: `/method/${b}`, kind: 'page' };
  // The sector pages' English alternates kept the Dutch slug in the CMS, so
  // normalise them to the English one the revamp routes on.
  if (a === 'sectors' && b) return { route: `/sectors/${SECTOR_SLUGS[b] ?? b}`, kind: 'sector' };
  return null;
}

/**
 * Pages published in Dutch only, whose path the English rules cannot read.
 *
 * The knowledge base is the case that matters: six articles - one of them
 * 99 blocks long - exist under /nl/over-ons/kennisbank with no English
 * edition and no English alternate, so nothing mapped them and they were
 * dropped from the migration entirely. They keep their Dutch slug, because
 * inventing an English one for a page that has no English edition helps
 * nobody, and the page itself carries the "Dutch only" note.
 */
function toRouteNl(nlPath) {
  const [a, b, c] = nlPath.split('/').filter(Boolean).slice(1);
  if (a === 'over-ons' && b === 'kennisbank' && c) return { route: `/insights/${c}`, kind: 'article' };
  if (a === 'over-ons' && b === 'cases' && c) return { route: `/cases/${c}`, kind: 'case' };
  return null;
}

/** Dutch sector slugs the CMS also serves under /en. */
const SECTOR_SLUGS = {
  energietransitie: 'energy-transition',
  'semiconductor-industrie': 'semiconductor-industry',
};

/**
 * The two sector pages are published in Dutch only and are not linked from
 * anywhere, so they get their English slugs assigned by hand.
 */
const NL_ONLY_SECTORS = {
  '/nl/sectoren/energietransitie': '/sectors/energy-transition',
  '/nl/sectoren/semiconductor-industrie': '/sectors/semiconductor-industry',
};

/* ---------------------------------------------------------------- i18n -- */

/**
 * English pages that are not in English.
 *
 * The live site publishes an English edition of most pages, but a good number
 * were never actually translated: the English URL exists, the page renders,
 * and the words on it are Dutch. /en/solutions/finance opens with "De juiste
 * Finance expert voor jouw uitdaging". The crawl carries that faithfully,
 * which is right of the crawl and no use to a reader who has just clicked EN.
 *
 * src/content/translations.en.json holds the English for each of those
 * strings, keyed by a hash of the Dutch rather than by route and position, so
 * a re-crawl that reorders or repeats a paragraph still finds its translation,
 * and a paragraph the live site rewrites shows up as missing rather than
 * silently keeping the old text.
 *
 * What is not in there is the privacy and cookie statement. Translating a
 * legal text and publishing it as the company's own is not a build step's
 * decision to make, so that page keeps its Dutch and says so - see
 * NO_ENGLISH_EDITION.
 */
const TRANSLATIONS = {
  en: JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/translations.en.json'), 'utf8')),
  nl: JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/translations.nl.json'), 'utf8')),
};

const textHash = (text) =>
  crypto.createHash('sha1').update(text).digest('hex').slice(0, 10);

/** Routes whose English edition is dropped rather than shown in Dutch. */
const NO_ENGLISH_EDITION = new Set(['/privacy']);

/** Swaps translated strings into one edition's blocks; returns what it did. */
function translateBlocks(blocks, into) {
  const map = TRANSLATIONS[into];
  let applied = 0;
  const out = blocks.map((block) => {
    if (block.type === 'text' || block.type === 'heading' || block.type === 'quote') {
      const swapped = map[textHash(block.text)];
      if (!swapped) return block;
      applied += 1;
      // The inline html mirrors the original and would contradict the swap.
      const { html, ...rest } = block;
      void html;
      return { ...rest, text: swapped };
    }
    if (block.type === 'list') {
      let touched = false;
      const items = block.items.map((item) => {
        const swapped = map[textHash(item)];
        if (!swapped) return item;
        touched = true;
        applied += 1;
        return swapped;
      });
      return touched ? { ...block, items } : block;
    }
    return block;
  });
  return { blocks: out, applied };
}

/* -------------------------------------------------------------------- art */

/**
 * The drawing that stands in for the role pages' photographs.
 *
 * The live site illustrates all 33 roles with the same eleven stock photos of
 * WorldEmp staff, so most role pages show the same stranger at the same desk,
 * whatever the role. tools/brand/build-role-art.mjs draws one scene per role
 * instead; this points the page at it and drops the photographs.
 *
 * Only the lead image is kept. The rest of a role page's pictures are those
 * same few photos again further down, and one illustration per page is the
 * point - repeating it three times would be the old mistake in a new style.
 */
const ART_DIR = path.join(ROOT, 'public/roles');

const ILLUSTRATED = new Set(['role', 'discipline']);

function sectionArt(kind, route) {
  if (!ILLUSTRATED.has(kind)) return null;
  const [, , discipline, slug] = route.split('/');
  const name = kind === 'role' ? `${discipline}-${slug}.webp` : `${discipline}.webp`;
  if (!existsSync(path.join(ART_DIR, name))) return null;
  return { src: `/roles/${name}`, width: 1200, height: 750 };
}

/* ------------------------------------------------------------------ media */

const MAX_WIDTH = 1600;
const downloaded = new Map(); // source url -> media record

/** Downloads, resizes and re-encodes one image; returns its public record. */
async function fetchImage(src) {
  if (downloaded.has(src)) return downloaded.get(src);

  const hash = crypto.createHash('sha1').update(src).digest('hex').slice(0, 10);
  const base = decodeURIComponent(src.split('/').pop() ?? 'image')
    .replace(/\.[a-z0-9]+$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'image';
  const name = `${base}-${hash}.webp`;
  const file = path.join(MEDIA_DIR, name);

  let record = null;
  try {
    if (existsSync(file)) {
      const meta = await sharp(file).metadata();
      record = { src: `/media/${name}`, width: meta.width, height: meta.height };
    } else {
      const res = await fetch(src, { headers: { 'user-agent': 'worldemp-revamp/content-sync' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      const image = sharp(buffer, { animated: false });
      const meta = await image.metadata();
      const out = await image
        .rotate()
        .resize({ width: Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH), withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer({ resolveWithObject: true });
      await fs.writeFile(file, out.data);
      record = { src: `/media/${name}`, width: out.info.width, height: out.info.height };
    }
  } catch (error) {
    console.warn(`  ! image skipped ${src}: ${error.message}`);
    record = null;
  }

  downloaded.set(src, record);
  return record;
}

/* ---------------------------------------------------------------- content */

/**
 * The CMS pages open with a breadcrumb list and repeat the H1 in the body;
 * neither belongs in the rendered article. Everything after the last real
 * paragraph is chrome that slipped past the selector filter.
 */
function tidyBlocks(blocks, title) {
  const out = [];
  for (const block of blocks) {
    if (block.type === 'list' && block.items.length <= 6 &&
        block.items.some((i) => /^(home|homepage)$/i.test(i))) continue;
    if (block.type === 'heading' && block.level === 1) continue;
    if (block.type === 'heading' && !block.text) continue;
    if (block.type === 'text' && title && block.text === title) continue;
    // Newsletter and "to top" chrome.
    if (/nieuwsbrief|newsletter|to top|naar boven|schrijf je in|sign up and upgrade/i
        .test(block.text ?? '')) continue;
    out.push(block);
  }
  // Trim leading/trailing empties.
  while (out.length && out[0].type === 'image' && out.length > 1 && out[1].type === 'image') out.shift();
  return out;
}

function firstParagraph(blocks) {
  const p = blocks.find((b) => b.type === 'text' && (b.text?.length ?? 0) > 60);
  return p?.text ?? '';
}

/**
 * The case pages carry a row of figures set as heading/paragraph pairs
 * ("Start" / "Samenwerking gestart in 2019"). Rendered as prose they read as
 * three stray subheadings, so a run of them is folded into one `stats` block
 * the renderer can lay out as a row.
 */
const STAT_LABEL_MAX = 24;
const STAT_VALUE_MAX = 60;

function foldStats(blocks) {
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const run = [];
    let j = i;
    let withValue = 0;
    while (j < blocks.length && blocks[j].type === 'heading') {
      const label = blocks[j].text ?? '';
      if (label.length > STAT_LABEL_MAX) break;

      // The figure under the label, when the editor filled it in. Some are
      // left empty - Saman Groep's "Start" has no year against it - and a
      // blank cell in the row is a truer rendering than dropping the whole
      // row back into the page as three stray subheadings.
      const next = blocks[j + 1];
      const hasValue =
        next?.type === 'text' && (next.text?.length ?? 0) <= STAT_VALUE_MAX;

      run.push({ label, value: hasValue ? next.text : '' });
      if (hasValue) withValue += 1;
      j += hasValue ? 2 : 1;
    }

    // Two is a coincidence in prose; three in a row is a figure row. At least
    // two of them have to carry a figure, or this is just a run of headings.
    if (run.length >= 3 && withValue >= 2) {
      out.push({ type: 'stats', items: run });
      i = j - 1;
      continue;
    }
    out.push(blocks[i]);
  }
  return out;
}

/**
 * The listing pages tag each card ("Blog", "Kennisartikel"); the article
 * itself carries no tags. Collected here against the live path they point at.
 */
function collectLabels(records) {
  const byPath = new Map();
  for (const record of records) {
    for (const [path, labels] of Object.entries(record.cardLabels ?? {})) {
      const existing = byPath.get(path) ?? new Set();
      labels.forEach((l) => existing.add(l));
      byPath.set(path, existing);
    }
  }
  return byPath;
}

async function main() {
  const files = await fs.readdir(DATASET);
  const records = [];
  for (const file of files) {
    records.push(JSON.parse(await fs.readFile(path.join(DATASET, file), 'utf8')));
  }
  console.log(`read ${records.length} crawled pages`);

  await fs.mkdir(MEDIA_DIR, { recursive: true });
  await fs.mkdir(CONTENT_DIR, { recursive: true });

  const labelsByPath = collectLabels(records);
  console.log(`collected labels for ${labelsByPath.size} paths`);

  /** route -> { kind, en, nl } */
  const pages = new Map();
  let translationsApplied = 0;

  for (const record of records) {
    if (!record.blocks?.length) continue;
    if (SKIP.some((re) => re.test(record.path))) continue;

    // Canonical EN path: a page's own if it is the English edition, the
    // hreflang alternate otherwise.
    // A handful of pages omit the English alternate from their hreflang -
    // the privacy statement is one, which is why it was missing in Dutch.
    // Where the Dutch slug is the same word, the English rule still resolves
    // it; where it is not, toRoute simply returns null as before.
    const enPath =
      record.locale === 'en'
        ? record.path
        : (record.alternates?.en ?? `/en/${record.path.split('/').slice(2).join('/')}`);
    const mapped =
      (enPath ? toRoute(enPath) : null) ??
      (record.locale === 'nl' ? toRouteNl(record.path) : null);
    const route = mapped?.route ?? NL_ONLY_SECTORS[record.path] ?? null;
    if (!route) continue;

    const kind = mapped?.kind ?? 'sector';
    if (!pages.has(route)) pages.set(route, { route, kind, en: null, nl: null });
    const entry = pages.get(route);

    let blocks = foldStats(tidyBlocks(record.blocks, record.title));
    {
      const translated = translateBlocks(blocks, record.locale);
      blocks = translated.blocks;
      translationsApplied += translated.applied;
    }
    // The page furniture needs translating too: the <title> and the meta
    // description are as often Dutch on an English page as the body is, and
    // they are what the masthead and the cards show.
    const here = TRANSLATIONS[record.locale];
    const title = here[textHash(record.title)] ?? record.title;
    const rawDescription = record.description || firstParagraph(blocks).slice(0, 180);
    const description = here[textHash(rawDescription)] ?? rawDescription;

    entry[record.locale] = {
      title,
      description,
      sourcePath: record.path,
      published: record.published,
      categories: [...(labelsByPath.get(record.path) ?? [])],
      blocks,
      images: record.images ?? [],
    };
  }

  console.log(`mapped ${pages.size} routes`);

  // Download every image once, then rewrite the blocks to point at /media.
  const sources = new Set();
  for (const entry of pages.values()) {
    // Role pages are illustrated instead, so their photographs are not worth
    // fetching - any that another page also uses is added by that page.
    if (ILLUSTRATED.has(entry.kind)) continue;
    for (const side of ['en', 'nl']) {
      for (const block of entry[side]?.blocks ?? []) {
        if (block.type === 'image') sources.add(block.src);
      }
    }
  }
  console.log(`downloading ${sources.size} images...`);
  let done = 0;
  for (const src of sources) {
    await fetchImage(src);
    if (++done % 25 === 0) console.log(`  ${done}/${sources.size}`);
  }

  let rewritten = 0;
  let dropped = 0;
  let illustrated = 0;
  let photosReplaced = 0;
  const artMissing = new Set();
  for (const entry of pages.values()) {
    const art = sectionArt(entry.kind, entry.route);
    if (ILLUSTRATED.has(entry.kind) && !art) artMissing.add(entry.route);
    for (const side of ['en', 'nl']) {
      if (!entry[side]) continue;
      const blocks = [];
      let illustratedHere = false;
      for (const block of entry[side].blocks) {
        if (block.type !== 'image') {
          blocks.push(block);
          continue;
        }
        if (ILLUSTRATED.has(entry.kind)) {
          photosReplaced++;
          if (!art || illustratedHere) continue;
          blocks.push({ type: 'image', ...art, alt: '' });
          illustratedHere = true;
          illustrated++;
          continue;
        }
        const media = downloaded.get(block.src);
        if (!media) {
          dropped++;
          continue;
        }
        blocks.push({ type: 'image', ...media, alt: block.alt ?? '' });
        rewritten++;
      }
      entry[side].blocks = blocks;
      // `images` was only ever a working list; the blocks carry them now.
      delete entry[side].images;
    }
  }

  /*
   * Card grids.
   *
   * The CMS's "related pages" grids are a <ul> of links; the crawl records the
   * hrefs and this turns them into routes, so the page can render the same
   * cards the rest of the site uses. Anything pointing at a page the revamp
   * does not carry is dropped rather than linked into a 404 - which is the
   * whole reason these are resolved here, where every route is known, instead
   * of being rewritten one at a time during extraction.
   */
  const routeBySource = new Map();
  for (const entry of pages.values()) {
    for (const side of ['en', 'nl']) {
      const source = entry[side]?.sourcePath;
      if (source) routeBySource.set(source.replace(/\/$/, ''), entry.route);
    }
  }

  let cardGrids = 0;
  let cardsResolved = 0;
  let cardsUnknown = 0;
  let cardGridsAsLists = 0;
  for (const entry of pages.values()) {
    for (const side of ['en', 'nl']) {
      if (!entry[side]) continue;
      entry[side].blocks = entry[side].blocks.flatMap((block) => {
        if (block.type === 'list') {
          // Safety net. Most of these lists are card grids and become cards
          // above, but the CMS has a second layout whose links sit a level
          // deeper, and its items still end in the word the card's button
          // used to be. Nothing reads "Lees meer" as prose, so it goes.
          return [{
            ...block,
            items: block.items.map((item) =>
              item.replace(/\s*(read more|lees meer|meer lezen|lees verder)\s*$/i, '').trim(),
            ).filter(Boolean),
          }];
        }
        if (block.type !== 'cardlinks') return [block];
        const routes = [];
        for (const href of block.hrefs) {
          const source = href
            .replace(/^https?:\/\/[^/]+/, '')
            .replace(/\/$/, '');
          const route = routeBySource.get(source);
          if (!route) {
            cardsUnknown += 1;
            continue;
          }
          // A grid on a page often includes that page; a card linking to
          // where you already are is the dead "Read more" all over again.
          if (route === entry.route || routes.includes(route)) continue;
          routes.push(route);
        }
        if (!routes.length) {
          // None of the links survived the migration, so this was not a
          // grid of pages we have - render what it says instead of nothing.
          cardGridsAsLists += 1;
          return block.items?.length
            ? [{ type: 'list', ordered: false, items: block.items }]
            : [];
        }
        cardGrids += 1;
        cardsResolved += routes.length;
        return [{ type: 'cards', routes }];
      });
    }
  }
  console.log(
    `card grids: ${cardGrids} kept (${cardsResolved} cards), ${cardGridsAsLists} left as lists, ` +
      `${cardsUnknown} links off-site or unmigrated`,
  );

  for (const route of NO_ENGLISH_EDITION) {
    const entry = pages.get(route);
    if (entry?.en && entry.nl) entry.en = null;
  }

  /*
   * Pages the live site never published in one of the two languages.
   *
   * Eleven of them, in both directions: seven Dutch-only knowledge-base
   * articles and the two sector pages, which are linked from nowhere and only
   * ever existed in Dutch, and two English-only articles with no Dutch
   * edition. Until now they fell back to the other language with a note, which
   * is honest but still leaves a reader who clicked EN looking at Dutch.
   *
   * So an English edition is built from the Dutch one. It is flagged
   * `translated: true`, because a translation carried out here is not the same
   * thing as copy the company wrote and approved, and the page says so. If any
   * substantial paragraph has no translation the page is left alone rather
   * than published half in each language.
   */
  let synthesised = 0;
  for (const entry of pages.values()) {
    const into = !entry.en ? 'en' : !entry.nl ? 'nl' : null;
    if (!into || NO_ENGLISH_EDITION.has(entry.route)) continue;
    const from = into === 'en' ? 'nl' : 'en';

    // The CMS gives two of these pages the same <title> - the Steinbuch
    // announcement carries the outsourcing article's - so where a title is
    // not unique, the page's own first heading is the better name for it.
    const shared = [...pages.values()].filter(
      (other) => other !== entry && other[from]?.title === entry[from].title,
    ).length > 0;
    const ownHeading = entry[from].blocks.find((b) => b.type === 'heading')?.text;
    // Both sides of a collision would otherwise lose their title, so the
    // page whose slug the title matches keeps it, and the other takes its
    // own heading.
    const slugWords = new Set(entry.route.split('/').pop().split('-'));
    const titleFits = entry[from].title
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      // The brand name is in half the titles and half the slugs, so it
      // tells us nothing about whether this title belongs to this page.
      .filter((w) => w.length > 3 && w !== 'worldemp')
      .some((w) => slugWords.has(w));
    const source = shared && !titleFits && ownHeading ? ownHeading : entry[from].title;
    const title = TRANSLATIONS[into][textHash(source)];
    if (!title) continue;

    const { blocks, applied } = translateBlocks(entry[from].blocks, into);
    const long = entry[from].blocks.filter(
      (b) => (b.type === 'text' || b.type === 'heading') && (b.text?.split(/\s+/).length ?? 0) >= 8,
    ).length;
    if (applied < long) continue;

    entry[into] = {
      ...entry[from],
      title,
      description:
        TRANSLATIONS[into][textHash(entry[from].description)] ?? entry[from].description,
      blocks,
      translated: true,
    };
    translationsApplied += applied;
    synthesised += 1;
  }
  if (synthesised) {
    console.log(`editions built by translation: ${synthesised}`);
  }

  console.log(`translations: ${translationsApplied} strings swapped into the thinner edition`);

  const sorted = [...pages.values()].sort((a, b) => a.route.localeCompare(b.route));
  await fs.writeFile(
    path.join(CONTENT_DIR, 'pages.json'),
    `${JSON.stringify(sorted, null, 1)}\n`,
  );

  /*
   * The client logo rail and the testimonial cards belong to the designed
   * homepage rather than to any migrated page, so they are written to their
   * own file. The logos are the same in both editions; the quotes are not,
   * and the Dutch homepage carries fewer of them than the English one.
   */
  const homepages = records.filter((r) => /\/(homepage)$/.test(r.path));
  // Both editions carry the same rail, so dedupe on the source URL - after
  // fetchImage the `src` is a local /media path, which would never match.
  const seenLogos = new Set();
  const clients = [];
  for (const client of homepages.flatMap((r) => r.clients ?? [])) {
    if (seenLogos.has(client.src)) continue;
    seenLogos.add(client.src);
    const media = await fetchImage(client.src);
    if (media) clients.push({ name: client.name, ...media });
  }

  const testimonials = {};
  for (const locale of ['en', 'nl']) {
    const page = homepages.find((r) => r.locale === locale);
    testimonials[locale] = [];
    for (const t of page?.testimonials ?? []) {
      const media = await fetchImage(t.portrait);
      testimonials[locale].push({
        quote: t.quote,
        name: t.name,
        role: t.role,
        portrait: media,
      });
    }
  }

  await fs.writeFile(
    path.join(CONTENT_DIR, 'site.json'),
    `${JSON.stringify({ clients, testimonials }, null, 1)}\n`,
  );
  console.log(
    `wrote src/content/site.json (${clients.length} client logos, ` +
      `${testimonials.en.length} en / ${testimonials.nl.length} nl testimonials)`,
  );

  const byKind = sorted.reduce((acc, p) => ({ ...acc, [p.kind]: (acc[p.kind] ?? 0) + 1 }), {});
  console.log('images:', rewritten, 'rewritten,', dropped, 'dropped');
  console.log(
    `role art: ${illustrated} pages illustrated, ${photosReplaced} stock photos removed`,
  );
  if (artMissing.size) {
    console.warn(
      `  ! no illustration for ${artMissing.size} page(s) - run` +
        ` \`npm run build-role-art\` in tools/brand:\n    ` +
        [...artMissing].join('\n    '),
    );
  }
  console.log('routes by kind:', byKind);
  console.log('missing nl:', sorted.filter((p) => !p.nl).length,
    '| missing en:', sorted.filter((p) => !p.en).length);
  console.log(`wrote src/content/pages.json (${sorted.length} routes)`);
}

await main();
