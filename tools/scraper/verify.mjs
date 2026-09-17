/* Drives the running site: visits routes, checks what rendered, screenshots. */
import { chromium } from 'playwright';
import fs from 'node:fs';

const ORIGIN = process.env.ORIGIN || 'http://localhost:3111';
const OUT = process.env.SHOT_DIR
  || 'C:/Users/VEDANT~1/AppData/Local/Temp/claude/c--Users-VedantRai-WorldEmp-Revamp/2b6ae314-4b8e-4bfb-afe1-8eb32deb557a/scratchpad/verify/';
fs.mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['/en', 'en-home'],
  ['/nl', 'nl-home'],
  ['/en/solutions', 'en-solutions'],
  ['/nl/solutions', 'nl-solutions'],
  ['/en/insights', 'en-insights'],
  ['/en/insights/jaspers-experience', 'en-article'],
  ['/nl/insights/jaspers-experience', 'nl-article'],
  ['/en/cases/kubo', 'en-case'],
  ['/nl/sectors/energy-transition', 'nl-sector'],
  ['/en/solutions/engineering/automation-engineer', 'en-role'],
  ['/en/method/onboarding', 'en-method-child'],
  ['/nl/about/team', 'nl-about-team'],
  ['/en/contact', 'en-contact'],
  ['/en/sitemap', 'en-sitemap'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
const results = [];

for (const [route, name] of ROUTES) {
  const errors = [];
  const onError = (e) => errors.push('pageerror: ' + e.message.slice(0, 160));
  const onConsole = (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); };
  page.on('pageerror', onError);
  page.on('console', onConsole);

  let status = 0;
  let info = {};
  // The dev server recompiles and reloads as it first meets each route, so a
  // read can land mid-navigation; retry rather than call that a failure.
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await page.goto(ORIGIN + route, { waitUntil: 'load', timeout: 90_000 });
      status = res?.status() ?? 0;
      await page.waitForTimeout(2200);
      info = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return {
          lang: document.documentElement.lang,
          h1: (h1?.querySelector('.sr-only')?.textContent ?? h1?.textContent ?? '').trim().slice(0, 62),
          h1Visible: h1 ? getComputedStyle(h1.querySelector('.we-reveal-word') ?? h1).opacity !== '0' : false,
          logo: !!document.querySelector('header svg[aria-label]'),
          localeLinks: document.querySelectorAll('header a[hreflang]').length,
          images: [...document.images].filter((i) => i.currentSrc.includes('/media/')).length,
          brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
          height: document.documentElement.scrollHeight,
        };
      });
      break;
    } catch (e) {
      if (attempt === 3) info = { error: e.message.slice(0, 90) };
      await page.waitForTimeout(1500);
    }
  }

  await page.screenshot({ path: OUT + name + '.png' }).catch(() => {});
  page.off('pageerror', onError);
  page.off('console', onConsole);
  results.push({ route, status, ...info, errors: errors.length ? errors.slice(0, 2) : undefined });
  const ok = status === 200 && info.h1 && info.h1Visible && !info.brokenImages && !info.error;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${status} ${route.padEnd(48)} lang=${info.lang ?? '?'} ` +
    `h=${info.height ?? '?'} media=${info.images ?? '?'} broken=${info.brokenImages ?? '?'} ` +
    `"${info.h1 ?? info.error ?? ''}"` + (results.at(-1).errors ? `\n     ${results.at(-1).errors.join('\n     ')}` : ''),
  );
}

fs.writeFileSync(OUT + 'results.json', JSON.stringify(results, null, 1));
await browser.close();

const bad = results.filter((r) => r.status !== 200 || !r.h1 || !r.h1Visible || r.brokenImages || r.error);
console.log(`\n${results.length - bad.length}/${results.length} routes rendered. shots in ${OUT}`);
process.exit(bad.length ? 1 : 0);
