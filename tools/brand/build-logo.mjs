/**
 * Vectorises the WorldEmp logo.
 *
 *   npm install && npm run build-logo
 *
 * The only logo master the CMS holds is a 298x137 PNG
 * (/Files/Images/Structure/WorldEmpLogo.png, kept here as
 * public/brand/worldemp-logo.png). Scaling that down to a 34px header logo is
 * visibly soft, so it is traced once into outlines:
 *
 *   alpha channel -> upscale -> blur -> threshold -> potrace -> path data
 *
 * The blur is what keeps the path small: it smooths the staircase the 298px
 * raster leaves on a curve without moving the 50% edge, so stroke weights are
 * unchanged. Traced against the original the result is ~97% pixel agreement,
 * and identical by eye at every size the site renders it.
 *
 * Writes:
 *   public/brand/worldemp-logo.svg          lockup, gradient mark
 *   public/brand/worldemp-logo-white.svg    lockup, solid white
 *   public/brand/worldemp-mark.svg          monogram only
 *   public/brand/worldemp-mark-white.svg    monogram, solid white
 *   src/app/icon.svg                        tab icon, white on an indigo tile
 *   src/app/apple-icon.png                  180px home-screen tile
 *   src/components/brand/logo-paths.ts      path data for the React component
 */
import sharp from 'sharp';
import potrace from 'potrace';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SRC = path.join(ROOT, 'public/brand/worldemp-logo.png');
const BRAND_DIR = path.join(ROOT, 'public/brand');
const PATHS_FILE = path.join(ROOT, 'src/components/brand/logo-paths.ts');
const APPLE_ICON = path.join(ROOT, 'src/app/apple-icon.png');

/**
 * The mark and the wordmark are traced separately, at different settings: the
 * mark is large and mostly straight edges, so 4x with a heavy blur is plenty,
 * while the wordmark's letterforms need the finer 8x pass.
 */
const REGIONS = {
  mark: { crop: { left: 0, top: 0, width: 140, height: 137 }, scale: 4, blur: 3 },
  word: { crop: { left: 140, top: 0, width: 158, height: 137 }, scale: 8, blur: 0 },
};

/** Where the monogram's bowl sits vertically in the source, in source px. */
const BOWL = { top: 44, bottom: 96 };

const GRADIENT_FROM = '#150958'; // --color-we-indigo
const GRADIENT_TO = '#bd2230'; // --color-we-crimson

const trace = (buffer, options) =>
  new Promise((resolve, reject) =>
    potrace.trace(buffer, options, (error, svg) => (error ? reject(error) : resolve(svg))));

/**
 * Rewrites absolute path coordinates into the shared output space.
 * potrace only emits commands whose arguments are x/y pairs, so alternating
 * on argument index is safe here.
 */
function transform(d, { sx, dx, dy, ox, oy, k }) {
  const out = [];
  let command = 'M';
  let numbers = [];
  let index = 0;
  const round = (v) => String(Math.round(v * 100) / 100);
  const flush = () => {
    if (numbers.length) out.push(command + numbers.join(' '));
    numbers = [];
  };

  for (const match of d.matchAll(/([A-Za-z])|(-?\d*\.?\d+)/g)) {
    if (match[1]) {
      flush();
      command = match[1];
      index = 0;
      continue;
    }
    const value = Number.parseFloat(match[2]) / sx; // -> source px
    numbers.push(round(index % 2 === 0 ? (value + dx - ox) / k : (value + dy - oy) / k));
    index++;
  }
  flush();
  return out.join('');
}

/** Ink bounds of a rasterised SVG, in that raster's pixels. */
async function inkBox(svg) {
  const { data, info } = await sharp(Buffer.from(svg))
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      if (data[i + 3] > 40 && data[i] < 200) {
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
    }
  }
  return { x0, y0, x1, y1 };
}

async function main() {
  const traced = {};
  for (const [name, region] of Object.entries(REGIONS)) {
    let pipeline = sharp(SRC)
      .extract(region.crop)
      .resize(region.crop.width * region.scale, region.crop.height * region.scale, {
        kernel: 'lanczos3',
      })
      .ensureAlpha()
      .extractChannel('alpha');
    if (region.blur) pipeline = pipeline.blur(region.blur);

    // potrace wants dark-on-light, so the alpha mask is inverted.
    const mask = await pipeline.negate().toColourspace('b-w').png().toBuffer();
    const svg = await trace(mask, {
      threshold: 128,
      turdSize: 8 * region.scale,
      alphaMax: 1.0,
      optCurve: true,
      optTolerance: 0.6,
    });
    traced[name] = {
      d: /d="([^"]+)"/.exec(svg)[1],
      box: await inkBox(svg),
      ...region,
    };
  }

  // Ink bounds back in source pixels.
  const toSourceX = (name, v) =>
    v / traced[name].scale + (name === 'word' ? REGIONS.word.crop.left : 0);
  const mark = {
    x0: toSourceX('mark', traced.mark.box.x0),
    x1: toSourceX('mark', traced.mark.box.x1),
    y0: traced.mark.box.y0 / traced.mark.scale,
    y1: traced.mark.box.y1 / traced.mark.scale,
  };
  const word = {
    x0: toSourceX('word', traced.word.box.x0),
    x1: toSourceX('word', traced.word.box.x1),
    y0: traced.word.box.y0 / traced.word.scale,
    y1: traced.word.box.y1 / traced.word.scale,
  };

  // Output space: the mark is exactly 100 units tall, its ink at the origin.
  const k = (mark.y1 - mark.y0) / 100;
  const ox = mark.x0;
  const oy = mark.y0;

  // The master sets the wordmark low, because it is centred on the slash,
  // which overshoots the letterforms top and bottom. Centring it on the bowl
  // instead is the one thing here that is not a straight trace of the
  // original, and it is what makes the lockup look set rather than pasted.
  const nudge = (BOWL.top + BOWL.bottom) / 2 - (word.y0 + word.y1) / 2;

  const dMark = transform(traced.mark.d, { sx: traced.mark.scale, dx: 0, dy: 0, ox, oy, k });
  const dWord = transform(traced.word.d, {
    sx: traced.word.scale,
    dx: REGIONS.word.crop.left,
    dy: nudge,
    ox,
    oy,
    k,
  });

  const markW = Number(((mark.x1 - mark.x0) / k).toFixed(2));
  const fullW = Number(((word.x1 - ox) / k).toFixed(2));
  const wordTop = (word.y0 + nudge - oy) / k;
  const wordBottom = (word.y1 + nudge - oy) / k;
  const top = Math.min(0, wordTop);
  const bottom = Math.max(100, wordBottom);
  const fullBox = `0 ${Number(top.toFixed(2))} ${fullW} ${Number((bottom - top).toFixed(2))}`;
  const markBox = `0 0 ${markW} 100`;
  const fullHeight = Number(fullBox.split(' ')[3]);

  const gradient = (id) =>
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="${GRADIENT_FROM}"/>` +
    `<stop offset="1" stop-color="${GRADIENT_TO}"/></linearGradient>`;
  const open = (box, w, h) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" width="${w}" height="${h}" ` +
    `role="img" aria-label="WorldEmp">`;

  await fs.writeFile(
    path.join(BRAND_DIR, 'worldemp-logo.svg'),
    `${open(fullBox, fullW, fullHeight)}<defs>${gradient('weGrad')}</defs>` +
      `<path fill="url(#weGrad)" fill-rule="evenodd" d="${dMark}"/>` +
      `<path fill="${GRADIENT_FROM}" fill-rule="evenodd" d="${dWord}"/></svg>\n`,
  );
  await fs.writeFile(
    path.join(BRAND_DIR, 'worldemp-logo-white.svg'),
    `${open(fullBox, fullW, fullHeight)}` +
      `<g fill="#ffffff" fill-rule="evenodd"><path d="${dMark}"/><path d="${dWord}"/></g></svg>\n`,
  );
  await fs.writeFile(
    path.join(BRAND_DIR, 'worldemp-mark.svg'),
    `${open(markBox, markW, 100)}<defs>${gradient('weGrad')}</defs>` +
      `<path fill="url(#weGrad)" fill-rule="evenodd" d="${dMark}"/></svg>\n`,
  );

  const whiteMark =
    `${open(markBox, markW, 100)}` +
    `<path fill="#ffffff" fill-rule="evenodd" d="${dMark}"/></svg>\n`;
  await fs.writeFile(path.join(BRAND_DIR, 'worldemp-mark-white.svg'), whiteMark);

  // Tab icon. At 16px the gradient mark on transparent is unreadable - half
  // of it is near-black and the rest is thin - so it gets the same white-on-
  // indigo tile as the home-screen icon, with the mark inset by 18%.
  const TILE = 100;
  const inset = TILE * 0.18;
  const glyphWidth = TILE - inset * 2;
  const glyphScale = glyphWidth / markW;
  await fs.writeFile(
    path.join(ROOT, 'src/app/icon.svg'),
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${TILE} ${TILE}" width="${TILE}" ` +
      `height="${TILE}" role="img" aria-label="WorldEmp">` +
      `<rect width="${TILE}" height="${TILE}" rx="22" fill="${GRADIENT_FROM}"/>` +
      `<g transform="translate(${inset.toFixed(2)} ${((TILE - 100 * glyphScale) / 2).toFixed(2)}) ` +
      `scale(${glyphScale.toFixed(4)})">` +
      `<path fill="#ffffff" fill-rule="evenodd" d="${dMark}"/></g></svg>\n`,
  );

  // iOS flattens and masks the home-screen icon, so it gets the white mark on
  // an indigo tile rather than the gradient, whose indigo end would disappear
  // into the background.
  const glyph = await sharp(Buffer.from(whiteMark)).resize({ height: 104 }).png().toBuffer();
  const glyphMeta = await sharp(glyph).metadata();
  await sharp({
    create: { width: 180, height: 180, channels: 4, background: GRADIENT_FROM },
  })
    .composite([
      {
        input: glyph,
        left: Math.round((180 - (glyphMeta.width ?? 0)) / 2),
        top: Math.round((180 - (glyphMeta.height ?? 0)) / 2),
      },
    ])
    .png()
    .toFile(APPLE_ICON);

  await fs.writeFile(
    PATHS_FILE,
    `/**
 * WorldEmp logo geometry.
 *
 * Vector outlines traced from the brand original
 * (Files/Images/Structure/WorldEmpLogo.png, the only master the CMS holds, at
 * 298x137). The raster was upscaled, thresholded and traced, so these paths
 * are the same shapes the brand has always used - they are simply resolution
 * independent now, instead of a 298px bitmap being scaled down to 34px.
 *
 * Coordinate space: the mark is exactly 100 units tall with its ink starting
 * at the origin, so any rendered size is just a height.
 *
 * Generated - do not hand-edit. Regenerate with \`npm run build-logo\` in
 * tools/brand, which also rewrites the SVG files in public/brand.
 */

/** The 'we' monogram: two chevrons, the bowl, and the diagonal stroke. */
export const MARK_PATH =
  "${dMark}";

/** The 'WorldEmp' wordmark, optically centred on the monogram's bowl. */
export const WORD_PATH =
  "${dWord}";

/** viewBox for the monogram on its own. */
export const MARK_VIEWBOX = "${markBox}";

/** viewBox for the full lockup (monogram + wordmark). */
export const LOCKUP_VIEWBOX = "${fullBox}";

/** Aspect ratios, for reserving space before paint. */
export const MARK_RATIO = ${Number((markW / 100).toFixed(4))};
export const LOCKUP_RATIO = ${Number((fullW / 100).toFixed(4))};
`,
  );

  console.log(
    `markBox ${markBox} | fullBox ${fullBox} | wordmark nudge ${nudge.toFixed(2)}px | ` +
      `path bytes: mark ${dMark.length}, word ${dWord.length}`,
  );
}

await main();
