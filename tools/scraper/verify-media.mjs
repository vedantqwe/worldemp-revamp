/* Scrolls a page to the bottom and reports how the /media images resolved. */
import { chromium } from 'playwright';
const ORIGIN = process.env.ORIGIN || 'http://localhost:3111';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 800 } });
const failed = [];
p.on('requestfailed', (r) => { if (r.url().includes('/media/') || r.url().includes('_next/image')) failed.push(r.url().slice(-70)); });
p.on('response', (r) => { if (r.status() >= 400 && (r.url().includes('/media/') || r.url().includes('_next/image'))) failed.push(r.status() + ' ' + r.url().slice(-70)); });

for (const route of ['/en/insights/jaspers-experience', '/en/insights', '/nl/sectors/energy-transition']) {
  failed.length = 0;
  await p.goto(ORIGIN + route, { waitUntil: 'load', timeout: 90_000 });
  // Walk down the page so every lazy image enters the viewport.
  await p.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await p.waitForTimeout(3000);
  const stats = await p.evaluate(() => {
    const imgs = [...document.images];
    return {
      total: imgs.length,
      loaded: imgs.filter((i) => i.complete && i.naturalWidth > 0).length,
      broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-60)),
    };
  });
  console.log(`${route}\n  imgs ${stats.loaded}/${stats.total} loaded` +
    (stats.broken.length ? `, BROKEN: ${stats.broken.join(', ')}` : '') +
    (failed.length ? `, request failures: ${failed.slice(0, 3).join(' | ')}` : ''));
}
await b.close();
