/* Clicks the NL/EN switch on a few pages and reports where it lands. */
import { chromium } from 'playwright';
const ORIGIN = process.env.SHOT_ORIGIN || 'http://localhost:3222';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });

for (const route of ['/en', '/en/insights/jaspers-experience', '/en/solutions/engineering/automation-engineer', '/nl/cases/kubo']) {
  await page.goto(ORIGIN + route, { waitUntil: 'load' });
  await page.waitForTimeout(700);
  const target = route.startsWith('/en') ? 'Nederlands' : 'English';
  const link = page.locator(`header a[hreflang="${target === 'Nederlands' ? 'nl' : 'en'}"]`).first();
  await link.click();
  await page.waitForLoadState('load');
  await page.waitForTimeout(700);
  const h1 = (await page.locator('h1').first().textContent()) ?? '';
  console.log(`${route}\n  -> ${new URL(page.url()).pathname}\n     lang=${await page.getAttribute('html', 'lang')}  h1="${h1.slice(0, 54).trim()}"`);
}
await browser.close();
