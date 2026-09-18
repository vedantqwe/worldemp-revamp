#!/usr/bin/env node
/**
 * Finds, treats and writes one picture per role and per discipline.
 *
 * The live site illustrates all 33 role pages with the same eleven stock
 * photographs of WorldEmp staff, so a Data Engineer and a Compliance
 * Specialist are introduced by the same man at the same desk. The subjects
 * here are things instead of people - a bridge, a shipyard, a server hall -
 * because a photograph of a different stranger is the same mistake with better
 * lighting, and because thirty-three pictures of people at laptops say nothing
 * that thirty-two other pages do not already say.
 *
 * The pictures come from Openverse, filtered to CC0 and public domain only, so
 * there is nothing to attribute and nothing to license. Provenance is recorded
 * anyway in public/roles/manifest.json - creator, source, licence and the id -
 * and the id pins the choice, so a later run reproduces this set rather than
 * whatever the index happens to hold that day.
 *
 *     npm run build-role-art                    rebuild from the pinned ids
 *     npm run build-role-art -- --refresh       search again and re-pin
 *     npm run build-role-art -- --candidates    contact sheets, to choose from
 *
 * Openverse was chosen over the illustration libraries on licence grounds:
 * unDraw's terms forbid downloading or scraping its assets programmatically,
 * and Storyset, Humaaans and IRA Design all require visible attribution, which
 * does not belong on a corporate marketing page.
 *
 * Anything already at public/roles/<name>.webp that this did not write is left
 * alone, so commissioned artwork can be dropped in per role.
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { ART_HEIGHT, ART_WIDTH, scene } from "./role-scenes.mjs";
import { DISCIPLINE_QUERIES, ROLE_QUERIES } from "./role-art.queries.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT_DIR = path.join(ROOT, "public/roles");
const MANIFEST = path.join(OUT_DIR, "manifest.json");
const CANDIDATES = path.join(HERE, "candidates");

const API = "https://api.openverse.org/v1/images/";
/** Two modern archives, both CC0. The rest of the index is largely museum scans. */
const SOURCES = "stocksnap,rawpixel";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const only = args.filter((a) => !a.startsWith("--"));
const REFRESH = flags.has("--refresh");
const CANDIDATE_MODE = flags.has("--candidates");

/* ------------------------------------------------------------- treatment -- */

/**
 * The house treatment: duotone.
 *
 * Thirty-seven photographs out of an open archive have thirty-seven different
 * palettes and exposures, and dropped onto a page straight they look like a
 * page of search results rather than a brand. A translucent wash of brand
 * colour does not fix that - tried at three strengths, it either leaves the
 * yellow cable yellow and the green door green, or it fogs every subject into
 * mush at the strength where it finally unifies them.
 *
 * A duotone does fix it, because it throws the original colour away rather
 * than tinting it: luminance is mapped onto one ramp from the brand's indigo
 * to a near-white, so every picture ends up in the same two colours at full
 * contrast. The exposure is levelled first, so a high-key photograph of white
 * cables and a dark photograph of a server hall arrive at the same weight.
 * Then the discipline's accent is laid in one corner, which is what keeps the
 * four sections distinguishable without breaking the set.
 *
 * `attention` picks the crop: sharp scores regions and keeps the busiest, so a
 * bridge stays a bridge instead of becoming a rectangle of sky.
 */
const DUO_SHADOW = [0x24, 0x10, 0x63]; // a shade of --color-we-indigo
const DUO_LIGHT = [0xf2, 0xee, 0xf9]; // a tint of the same hue, just off --color-we-paper

async function treat(buffer, accent) {
  const duotone = await sharp(buffer, { failOn: "none" })
    .resize(ART_WIDTH, ART_HEIGHT, { fit: "cover", position: sharp.strategy.attention })
    // Level the exposure before the ramp, clipping the extremes so one blown
    // highlight cannot decide the whole image's contrast.
    .normalise({ lower: 2, upper: 98 })
    // Luminance via recomb keeps three bands, which .linear needs; .greyscale
    // collapses to one and then cannot be expanded again.
    .recomb([
      [0.2126, 0.7152, 0.0722],
      [0.2126, 0.7152, 0.0722],
      [0.2126, 0.7152, 0.0722],
    ])
    .linear(
      DUO_LIGHT.map((hi, i) => (hi - DUO_SHADOW[i]) / 255),
      DUO_SHADOW,
    )
    .toColourspace("srgb")
    .toBuffer();

  const lines = [];
  for (let x = 60; x < ART_WIDTH; x += 60) lines.push(`<path d="M${x} 0v${ART_HEIGHT}"/>`);
  for (let y = 60; y < ART_HEIGHT; y += 60) lines.push(`<path d="M0 ${y}h${ART_WIDTH}"/>`);

  const overlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}">
      <defs>
        <linearGradient id="a" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stop-color="${accent}" stop-opacity=".2"/>
          <stop offset=".7" stop-color="${accent}" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="f" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#060219" stop-opacity="0"/>
          <stop offset="1" stop-color="#060219" stop-opacity=".22"/>
        </linearGradient>
      </defs>
      <rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#a)"/>
      <rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#f)"/>
      <g stroke="#f9fafb" stroke-opacity=".05" stroke-width="1">${lines.join("")}</g>
    </svg>`,
  );

  return sharp(duotone).composite([{ input: overlay }]).webp({ quality: 88 }).toBuffer();
}

/* ---------------------------------------------------------------- source -- */

async function search(query, pageSize = 8) {
  const url =
    `${API}?q=${encodeURIComponent(query)}&source=${SOURCES}` +
    `&extension=jpg&license=cc0,pdm&page_size=${pageSize}&mature=false`;
  const res = await fetch(url, { headers: { "user-agent": "worldemp-revamp/brand-art" } });
  if (!res.ok) throw new Error(`openverse ${res.status}`);
  return (await res.json()).results ?? [];
}

async function byId(id) {
  const res = await fetch(`${API}${id}/`, {
    headers: { "user-agent": "worldemp-revamp/brand-art" },
  });
  return res.ok ? res.json() : null;
}

async function download(url) {
  const res = await fetch(url, { headers: { "user-agent": "worldemp-revamp/brand-art" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

/* ------------------------------------------------------------------ main -- */

const pages = JSON.parse(await readFile(path.join(ROOT, "src/content/pages.json"), "utf8"));
const roles = pages.filter((p) => p.kind === "role");
const disciplines = pages.filter((p) => p.kind === "discipline");
if (!roles.length) {
  console.error("no role pages in src/content/pages.json - run the content build first");
  process.exit(1);
}

/** Accents per discipline, matching the drawn scenes and the site's own ramp. */
const ACCENTS = {
  data: ["#2962b2", "#9e1c50"],
  engineering: ["#9e1c50", "#2962b2"],
  finance: ["#bd2230", "#2962b2"],
  it: ["#2962b2", "#bd2230"],
};

const wanted = [
  ...disciplines.map((p) => {
    const slug = p.route.split("/")[2];
    return {
      name: `${slug}.webp`,
      key: slug,
      discipline: slug,
      pair: true,
      ...DISCIPLINE_QUERIES[slug],
    };
  }),
  ...roles.map((p) => {
    const [, , discipline, slug] = p.route.split("/");
    return {
      name: `${discipline}-${slug}.webp`,
      key: slug,
      discipline,
      pair: false,
      ...ROLE_QUERIES[slug],
    };
  }),
];

await mkdir(OUT_DIR, { recursive: true });

const previous = existsSync(MANIFEST)
  ? JSON.parse(await readFile(MANIFEST, "utf8"))
  : { generated: [], sources: {} };
const pinned = previous.sources ?? {};

/* Contact sheets: eight candidates per slug, to choose a `pick` from. */
if (CANDIDATE_MODE) {
  await mkdir(CANDIDATES, { recursive: true });
  const list = only.length ? wanted.filter((w) => only.includes(w.key)) : wanted;
  for (const item of list) {
    const results = await search(item.query, 8);
    if (!results.length) {
      console.log(`${item.key}: nothing for "${item.query}"`);
      continue;
    }
    const tiles = [];
    for (const r of results) {
      try {
        tiles.push(await sharp(await download(r.url)).resize(300, 200, { fit: "cover" }).toBuffer());
      } catch {
        tiles.push(
          await sharp({ create: { width: 300, height: 200, channels: 3, background: "#dddddd" } })
            .png()
            .toBuffer(),
        );
      }
    }
    await sharp({ create: { width: 1200, height: 400, channels: 3, background: "#ffffff" } })
      .composite(tiles.map((input, i) => ({ input, left: (i % 4) * 300, top: Math.floor(i / 4) * 200 })))
      .png()
      .toFile(path.join(CANDIDATES, `${item.key}.png`));
    console.log(
      `${item.key.padEnd(34)} ${results.map((r, i) => `${i}:${String(r.title).slice(0, 16)}`).join("  ")}`,
    );
  }
  process.exit(0);
}

// Naming slugs rebuilds only those, and re-searches them: a pick that turned
// out to have someone's hands in it is changed in the query file and fixed one
// at a time, without pulling the whole set down again.
const targeted = only.length ? wanted.filter((w) => only.includes(w.key)) : wanted;
const generated = [...(previous.generated ?? [])].filter((n) =>
  targeted.every((t) => t.name !== n),
);
const sources = { ...pinned };
let kept = 0;
let drawn = 0;

for (const item of targeted) {
  const file = path.join(OUT_DIR, item.name);

  // Hand-made art wins: anything here this script did not write is left alone.
  if (existsSync(file) && !(previous.generated ?? []).includes(item.name)) {
    kept += 1;
    continue;
  }

  const [accent] = ACCENTS[item.discipline] ?? ACCENTS.data;
  let record = null;

  try {
    const pin = only.length ? null : pinned[item.name];
    let chosen = null;

    if (pin?.id && !pin.drawn && !REFRESH) {
      // The pin is the source of truth; if the archive has moved on, the
      // stored url still points at the file.
      chosen = (await byId(pin.id)) ?? pin;
    } else if (!pin?.drawn || REFRESH) {
      const results = await search(item.query);
      chosen = results[item.pick ?? 0] ?? results[0] ?? null;
    }

    if (chosen?.url) {
      await writeFile(file, await treat(await download(chosen.url), accent));
      record = {
        id: chosen.id ?? null,
        url: chosen.url,
        title: chosen.title ?? null,
        creator: chosen.creator ?? null,
        license: `${chosen.license ?? "cc0"} ${chosen.license_version ?? ""}`.trim(),
        source: chosen.source ?? null,
        page: chosen.foreign_landing_url ?? null,
        query: item.query,
      };
    }
  } catch (error) {
    console.warn(`  ! ${item.name}: ${error.message}`);
  }

  if (!record) {
    // Nothing usable in the archive - fall back to the drawn scene.
    const svg = scene(item.key, item.discipline, { pair: item.pair });
    await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(file);
    record = { drawn: true, query: item.query };
    drawn += 1;
  }

  sources[item.name] = record;
  generated.push(item.name);
}

await writeFile(
  MANIFEST,
  `${JSON.stringify({ width: ART_WIDTH, height: ART_HEIGHT, generated, sources }, null, 1)}\n`,
);

console.log(
  `wrote ${generated.length} pictures to public/roles/ ` +
    `(${disciplines.length} disciplines, ${roles.length} roles; ` +
    `${drawn} drawn where the archive had nothing)` +
    (kept ? ` - ${kept} hand-made file${kept === 1 ? "" : "s"} left alone` : ""),
);
