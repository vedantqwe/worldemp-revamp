/**
 * Crawls every public page of worldemp.com, both language editions, and
 * writes one dataset record per page.
 *
 *   npm run crawl        # -> storage/datasets/default/*.json
 *
 * Crawlee owns link discovery, the request queue, retries and concurrency;
 * the only bespoke part is extract.mjs. Playwright is used rather than a
 * plain HTTP fetch because the Dynamicweb templates lazy-load images and
 * build parts of the navigation client-side.
 */
import { PlaywrightCrawler, Dataset, log } from 'crawlee';
import { extractPage } from './extract.mjs';

const BASE = 'https://worldemp.com';

/**
 * The knowledge base is paginated behind a query string, and two sector pages
 * are published but not linked from anywhere, so both are seeded explicitly.
 */
const KNOWLEDGE_BASE_PAGES = 22;
const ORPHANS = ['/nl/sectoren/energietransitie', '/nl/sectoren/semiconductor-industrie'];

const startUrls = [
  `${BASE}/nl/homepage`,
  `${BASE}/en/homepage`,
  `${BASE}/nl/sitemap-2`,
  `${BASE}/en/sitemap-2`,
  `${BASE}/nl/sectoren`,
  `${BASE}/en/sectors`,
  ...ORPHANS.map((p) => BASE + p),
  ...Array.from({ length: KNOWLEDGE_BASE_PAGES }, (_, i) =>
    `${BASE}/nl/over-ons/kennisbank?PID=25883&page=${i + 1}`),
  ...Array.from({ length: KNOWLEDGE_BASE_PAGES }, (_, i) =>
    `${BASE}/en/about-us/knowledge-base?PID=25883&page=${i + 1}`),
];

const crawler = new PlaywrightCrawler({
  maxRequestsPerCrawl: 1200,
  maxConcurrency: 4,
  maxRequestRetries: 3,
  navigationTimeoutSecs: 45,
  requestHandlerTimeoutSecs: 90,
  launchContext: { launchOptions: { headless: true } },

  async requestHandler({ request, page, parseWithCheerio, enqueueLinks }) {
    // The templates reveal content on scroll; nudge the page so lazy <img>
    // elements swap their data-src in before the DOM is read.
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForLoadState('networkidle').catch(() => {});

    const $ = await parseWithCheerio();
    const data = extractPage($, request.loadedUrl ?? request.url);
    log.info(`${data.locale} ${data.path} - ${data.blocks.length} blocks, ${data.images.length} images`);
    await Dataset.pushData(data);

    await enqueueLinks({
      globs: [`${BASE}/nl/**`, `${BASE}/en/**`],
      // Query strings only ever mean pagination or tracking here, and the
      // paginated listings are already seeded above.
      exclude: [/\?/, /\.(pdf|jpe?g|png|zip|docx?|xlsx?)$/i],
      transformRequestFunction: (req) => {
        req.url = req.url.split('#')[0];
        return req;
      },
    });
  },

  failedRequestHandler({ request }, error) {
    log.error(`Gave up on ${request.url}: ${error.message}`);
  },
});

await crawler.run(startUrls);

const { items } = await Dataset.getData();
log.info(`Done. ${items.length} pages: ${items.filter((i) => i.locale === 'en').length} en, ${items.filter((i) => i.locale === 'nl').length} nl.`);
