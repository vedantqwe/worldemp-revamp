/* Drives the testimonial carousel: arrows, auto-advance, pause. */
import { chromium } from 'playwright';
const OUT = 'C:/Users/VEDANT~1/AppData/Local/Temp/claude/c--Users-VedantRai-WorldEmp-Revamp/2b6ae314-4b8e-4bfb-afe1-8eb32deb557a/scratchpad/new/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
await p.goto('http://localhost:3222/en', { waitUntil: 'load' });

const section = p.locator('section[aria-roledescription="carousel"]');
await section.scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);

const track = section.locator('ul').first();
const xOf = async () => {
  const box = await track.boundingBox();
  return Math.round(box.x);
};

const start = await xOf();
console.log('controls present:',
  'arrows=' + await section.locator('button[aria-label="Next"], button[aria-label="Previous"]').count(),
  'playPause=' + await section.locator('button[aria-label*="Pause"], button[aria-label*="Play"]').count(),
  'dots=' + await section.locator('[role="tab"]').count());

await section.locator('button[aria-label="Next"]').click();
await p.waitForTimeout(1200);
const afterNext = await xOf();
console.log('next arrow moved track:', start - afterNext, 'px');

await section.locator('button[aria-label="Previous"]').click();
await p.waitForTimeout(1200);
console.log('prev arrow returned to start:', Math.abs((await xOf()) - start) < 4);

// Auto-advance: move the pointer away so the hover-pause releases.
await p.mouse.move(5, 5);
await p.waitForTimeout(7500);
const afterAuto = await xOf();
console.log('auto-advanced on its own:', afterAuto < start - 10);

// Pause must actually stop it.
await section.scrollIntoViewIfNeeded();
await section.locator('button[aria-label*="Pause"]').click();
const paused = await xOf();
await p.mouse.move(5, 5);
await p.waitForTimeout(7500);
console.log('paused stays put:', Math.abs((await xOf()) - paused) < 4);

await section.screenshot({ path: OUT + 'carousel_controls.png' });
await b.close();
