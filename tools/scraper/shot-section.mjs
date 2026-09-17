/* Screenshots a section by the text of a heading inside it. */
import { chromium } from 'playwright';
import fs from 'node:fs';
const OUT = process.env.SHOT_DIR || './';
fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 800 } });
for (const spec of process.argv.slice(2)) {
  const [route, heading, name] = spec.split('#');
  await p.goto((process.env.SHOT_ORIGIN || 'http://localhost:3222') + '/' + route.replace(/^\/+/, ''), { waitUntil: 'load' });
  await p.waitForTimeout(1200);
  const target = p.locator(`h2:has-text("${heading}")`).first();
  await target.scrollIntoViewIfNeeded();
  await p.evaluate((d) => window.scrollBy(0, d), Number(process.env.SHOT_NUDGE || -120));
  await p.waitForTimeout(1400);
  await p.screenshot({ path: OUT + name + '.png' });
  console.log('shot', name, '->', heading);
}
await b.close();
