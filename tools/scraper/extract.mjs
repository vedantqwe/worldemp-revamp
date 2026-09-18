/**
 * Extraction logic for worldemp.com pages.
 *
 * Crawlee handles discovery, queueing, retries and concurrency; everything in
 * this file is about turning one rendered page into the content shape the
 * revamp renders from. Kept free of Crawlee imports so it can be unit-run
 * against a saved HTML file.
 */

const BASE = 'https://worldemp.com';

/** Sections of the chrome that repeat on every page and are never content. */
const CHROME = [
  'script', 'style', 'noscript', 'iframe', 'form', 'svg',
  '.pagination', '.scroll-to-top', '.searchbox__container', '.breadcrumb',
  '.footer', '.footer-newsletter-sign-up', '.we-newsletter-signup',
  '.mainmenu', '.language-dropdown', '.top-toggles', '.cookie',
].join(',');

/**
 * The CMS serves every image through a resizer
 * (/Admin/Public/GetImage.ashx?Image=/Files/...&Width=240). The thumbnail is
 * useless for a rebuild, so recover the path of the underlying original.
 */
export function normaliseImage(src) {
  if (!src) return null;
  let u = String(src).trim();
  if (!u || u.startsWith('data:')) return null;
  if (u.startsWith('//')) u = `https:${u}`;
  if (u.startsWith('/')) u = BASE + u;
  let url;
  try {
    url = new URL(u);
  } catch {
    return null;
  }
  if (url.hostname !== 'worldemp.com') return null;
  if (url.pathname.toLowerCase().includes('/getimage.ashx')) {
    const inner = url.searchParams.get('Image') ?? url.searchParams.get('image');
    if (!inner) return null;
    return BASE + (inner.startsWith('/') ? inner : `/${inner}`);
  }
  return url.origin + url.pathname;
}

/** Widest candidate in a srcset, falling back to src. */
function pickSrc($el) {
  const set = $el.attr('srcset') || $el.attr('data-srcset') || '';
  if (set) {
    const best = set
      .split(',')
      .map((s) => s.trim().split(/\s+/))
      .map(([u, w]) => [u, Number.parseInt(w, 10) || 0])
      .sort((a, b) => b[1] - a[1])[0];
    const normalised = best && normaliseImage(best[0]);
    if (normalised) return normalised;
  }
  return normaliseImage($el.attr('src') || $el.attr('data-src'));
}

const clean = (t) => (t || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Company names whose own casing a generic title-caser would destroy. Only
 * names that actually appear in attribution lines and logo alt text.
 */
const BRANDS = [
  'WorldEmp', 'myShop', 'Data2Performance', 'Bluedesk', 'Bluetrace', 'KUBO',
  'Innovatec', 'BloomyPro', 'PincVision', 'DILAX', 'TNW Group', 'Tata Steel',
  'Technoberg', 'Muntz', 'Royal Van Lent', 'van Lent Systems', 'Multimetaal',
  'Basisonline', 'Thunderbite', 'Royal Dirkzwager', 'HI Systems', 'Tideland',
  'Intures', 'IT Synergy', 'KVSA', 'Saman Groep', 'Solum Technology', 'Ditio',
];

/** Restores a brand's own casing wherever it appears in `text`. */
function restoreBrands(text) {
  let out = text;
  for (const brand of BRANDS) {
    out = out.replace(new RegExp(`\\b${brand.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'gi'), brand);
  }
  return out;
}

/**
 * The CMS sets attribution lines in capitals ("BARRY TEMPELAAR, CEO BLUEDESK").
 * Shouting reads badly at the size the revamp sets them, so an all-caps line
 * is re-cased; anything already mixed-case is left exactly as written.
 */
function titleCase(text) {
  if (!text || text !== text.toUpperCase()) return restoreBrands(text ?? '');
  const cased = text
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    // Dutch name particles stay lowercase, and job-title initialisms stay up.
    .replace(/\b(Van|De|Der|Den|Het|Een)\b/g, (m) => m.toLowerCase())
    .replace(/\b(Ceo|Cto|Coo|Cfo|Cio|It|Hr|Ai)\b/g, (m) => m.toUpperCase());
  return restoreBrands(cased);
}

/** Decorative chrome that slips past the selector filter. */
const isDecorative = (src) =>
  /logo|icon|sprite|pixel|placeholder|flag|favicon|arrow/i.test(src);

export function extractPage($, url) {
  const path = new URL(url).pathname;
  const locale = path.split('/')[1] === 'nl' ? 'nl' : 'en';

  const alternates = {};
  $('link[rel="alternate"][hreflang]').each((_, el) => {
    const lang = $(el).attr('hreflang');
    const href = $(el).attr('href');
    if (lang && href) alternates[lang.split('-')[0]] = href.replace(BASE, '');
  });

  const meta = {
    url,
    path,
    locale,
    title: clean($('title').first().text()).replace(/\s*\|\s*WorldEmp\s*$/i, ''),
    description: clean($('meta[name="description"]').attr('content')),
    ogImage: normaliseImage($('meta[property="og:image"]').attr('content')),
    published:
      $('meta[property="article:published_time"]').attr('content') ||
      clean($('time').first().attr('datetime') || $('time').first().text()) ||
      null,
    alternates,
  };

  const $main = $('main').first();
  if (!$main.length) return { ...meta, blocks: [], images: [] };
  $main.find(CHROME).remove();

  const blocks = [];
  const images = [];
  const seen = new Set();

  const push = (block) => {
    if (block.type === 'heading' || block.type === 'text') {
      if (!block.text || block.text.length < 2) return;
      const key = `${block.type}|${block.text.toLowerCase()}`;
      if (seen.has(key)) return;
      seen.add(key);
    }
    blocks.push(block);
  };

  const addImage = ($img) => {
    const src = pickSrc($img);
    if (!src || isDecorative(src)) return;
    if (images.some((i) => i.src === src)) return;
    const record = { src, alt: clean($img.attr('alt')) };
    images.push(record);
    push({ type: 'image', ...record });
  };

  /** Keep links and emphasis, drop the CMS's wrapper soup. */
  const inline = ($el) =>
    clean(($el.html() || '').replace(/<(?!\/?(a|strong|b|em|i|br)\b)[^>]*>/gi, ''));

  const walk = (node) => {
    const $n = $(node);
    const tag = node.tagName?.toLowerCase();
    if (!tag) return;

    if (/^h[1-6]$/.test(tag)) {
      push({ type: 'heading', level: Number(tag[1]), text: clean($n.text()) });
      return;
    }
    if (tag === 'p') {
      const text = clean($n.text());
      if (text) push({ type: 'text', text, html: inline($n) });
      $n.find('img').each((_, img) => addImage($(img)));
      return;
    }
    if (tag === 'ul' || tag === 'ol') {
      /*
       * The CMS builds its "related pages" card grids out of a <ul> whose
       * every <li> is one big link: image, title, summary and a "Read more"
       * label, all inside a single <a>. Read as text - which is what this used
       * to do - a grid of six cards became six bullet points that each said
       * the brand name twice and ended in the words "Read more", with no link
       * under them. 598 dead "Read more"s across 103 pages.
       *
       * So a list whose items are all card links is captured as the links it
       * is. The content build resolves them to routes and the page renders
       * real cards, which is what they were before they were flattened.
       */
      const items = $n
        .children('li')
        .map((_, li) => clean($(li).text()))
        .get()
        .filter(Boolean);

      /*
       * A card grid is a list whose every item is one whole link. Two or more,
       * because a single-item list is a list, and real hrefs only - some of
       * these lists are menus wired to `javascript:void(0)`.
       *
       * The item text rides along, so the content build can fall back to
       * rendering this as the list it looks like when none of the links point
       * at a page the revamp carries. Dropping the block would be worse than
       * the dead "Read more" this is here to remove.
       */
      const $items = $n.children('li');
      const hrefs = $items
        .map((_, li) => {
          const href = $(li).children('a[href]').first().attr('href');
          return href && !/^javascript:/i.test(href) ? href.split('#')[0] : null;
        })
        .get()
        .filter(Boolean);
      if (hrefs.length > 1 && hrefs.length === $items.length) {
        push({ type: 'cardlinks', hrefs, items });
        return;
      }

      if (items.length) push({ type: 'list', ordered: tag === 'ol', items });
      return;
    }
    if (tag === 'blockquote') {
      const text = clean($n.text());
      if (text) push({ type: 'quote', text });
      return;
    }
    if (tag === 'table') {
      const rows = $n
        .find('tr')
        .map((_, tr) =>
          $(tr)
            .find('th,td')
            .map((__, cell) => clean($(cell).text()))
            .get(),
        )
        .get()
        .filter((r) => r.length);
      if (rows.length) push({ type: 'table', rows });
      return;
    }
    if (tag === 'img') {
      addImage($n);
      return;
    }
    $n.contents().each((_, child) => {
      if (child.type === 'tag') walk(child);
    });
  };

  $main.contents().each((_, child) => {
    if (child.type === 'tag') walk(child);
  });

  // Hero art is often a CSS background rather than an <img>.
  $main.find('[style*="background-image"]').each((_, el) => {
    const match = /url\((['"]?)(.*?)\1\)/i.exec($(el).attr('style') || '');
    const src = match && normaliseImage(match[2]);
    if (src && !isDecorative(src) && !images.some((i) => i.src === src)) {
      images.push({ src, alt: '', background: true });
    }
  });

  /*
   * Three things the page carries that are not part of its prose, and that
   * the designed sections need: the client logo rail, the testimonial cards,
   * and the category labels the listing pages put on each card.
   */

  // Client logo rail. Only the homepage has it, and the alt text is the only
  // place the client's name is written down.
  const clients = $(".we-logoslider-greyscale img")
    .map((_, el) => {
      const $img = $(el);
      const src = pickSrc($img);
      if (!src) return null;
      const name = titleCase(
        clean($img.attr("alt")).replace(/\s*logo\s*$/i, "").trim(),
      );
      return { name, src };
    })
    .get()
    .filter((c) => c && c.src);

  // Testimonial cards: portrait, quote, then an attribution line in caps.
  const testimonials = $("section.cta-paragraph.carousel-cell")
    .map((_, el) => {
      const $card = $(el);
      const portrait = pickSrc($card.find("img").first());
      const paragraphs = $card
        .find("p")
        .map((__, p) => clean($(p).text()))
        .get()
        .filter(Boolean);
      if (!portrait || paragraphs.length < 2) return null;
      // The attribution is the last line, and the CMS sets it in capitals.
      const attribution = paragraphs[paragraphs.length - 1];
      const quote = paragraphs.slice(0, -1).join(" ");
      if (!quote || !attribution) return null;
      const [name, ...rest] = attribution.split(",");
      return {
        quote,
        name: titleCase(clean(name)),
        role: titleCase(clean(rest.join(","))),
        portrait,
      };
    })
    .get()
    .filter(Boolean);

  // Category labels. They live on the listing pages, never on the article
  // itself, so they are collected here against the link they belong to and
  // stitched together across pages by the content build.
  const cardLabels = {};
  $(".news-grid-list-item__label-wrapper").each((_, el) => {
    let $card = $(el);
    while ($card.length && $card.find("a[href]").length === 0) $card = $card.parent();
    const target = $card.find("a[href]").first().attr("href");
    if (!target) return;
    const labels = $card
      .find(".news-grid-list-item__label")
      .map((__, l) => clean($(l).text()))
      .get()
      .filter(Boolean);
    if (!labels.length) return;
    try {
      cardLabels[new URL(target, url).pathname] = labels;
    } catch {
      /* a malformed href in the CMS is not worth failing the page over */
    }
  });

  // Links out of this page, so the content build can rewrite them to routes.
  const links = [
    ...new Set(
      $main
        .find('a[href]')
        .map((_, a) => $(a).attr('href'))
        .get()
        .map((h) => {
          try {
            return new URL(h, url).pathname;
          } catch {
            return null;
          }
        })
        .filter((p) => p && /^\/(nl|en)\//.test(p)),
    ),
  ];

  return { ...meta, blocks, images, links, clients, testimonials, cardLabels };
}
