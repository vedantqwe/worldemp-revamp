/* Screenshot helper: node shot.mjs "<route>#<scrollY>#<name>" ... */
import { chromium } from 'playwright';
import fs from 'node:fs';

const OUT = process.env.SHOT_DIR
  || 'C:/Users/VEDANT~1/AppData/Local/Temp/claude/c--Users-VedantRai-WorldEmp-Revamp/2b6ae314-4b8e-4bfb-afe1-8eb32deb557a/scratchpad/shots/';
const ORIGIN = process.env.SHOT_ORIGIN || 'http://localhost:3111';
const WIDTH = Number(process.env.SHOT_WIDTH || 1366);
const HEIGHT = Number(process.env.SHOT_HEIGHT || 700);
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });

const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 300));
});

for (const target of process.argv.slice(2)) {
  const [route, scroll = '0', name = 'shot'] = target.split('#');
  const url = ORIGIN + '/' + String(route).replace(/^\/+/, '');
  problems.length = 0;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  if (scroll !== '0') {
    // The dev server can reload under us; one retry is enough.
    for (let i = 0; i < 3; i++) {
      try {
        await page.evaluate((y) => window.scrollTo(0, y), Number(scroll));
        break;
      } catch {
        await page.waitForTimeout(800);
      }
    }
    await page.waitForTimeout(900);
  }
  await page.screenshot({ path: OUT + name + '.png' });
  console.log('shot', name, url, 'scroll', scroll, problems.length ? `\n  PROBLEMS:\n   ${problems.slice(0, 6).join('\n   ')}` : '');
}
await browser.close();
