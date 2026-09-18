#!/usr/bin/env node
/**
 * Draws one illustration per role page, and one per discipline index.
 *
 * The live site puts the same handful of stock photographs of WorldEmp staff
 * on all 33 role pages - eleven pictures shared between 66 editions, so a
 * "Data Engineer" and a "Compliance Specialist" are illustrated by the same
 * man at the same desk. They are photographs of identifiable people used as
 * decoration, which is both a poor fit for a role page and a consent question
 * nobody needs to have.
 *
 * So each role gets its own drawing instead: a flat workspace scene, built
 * from the brand palette only, with the props and the diagram on the wall
 * chosen by discipline and the details varied by a hash of the role slug. No
 * two roles get the same picture, no picture is of a real person, and the
 * whole set is reproducible from this file.
 *
 * There is no text in the artwork. The card and the masthead already name the
 * role, and a drawing that has to be redrawn to be translated is a drawing
 * that will go stale in one language or the other.
 *
 *     npm run build-role-art      (in tools/brand)
 *
 * Hand-made artwork wins: anything already at public/roles/<slug>.webp that
 * this did not write is left alone, so a real illustration can be dropped in
 * per role without being overwritten on the next run.
 */
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const OUT_DIR = path.join(ROOT, "public/roles");
const MANIFEST = path.join(OUT_DIR, "manifest.json");

/** The card band is 16:10, so the scene is drawn to that from the start. */
export const ART_WIDTH = 1200;
export const ART_HEIGHT = 750;

/*
 * Palette. Every value here is a token from src/app/globals.css - the brief's
 * one hard rule is that the brand colours do not change, and generated art is
 * no exception.
 */
const C = {
  void: "#060219",
  indigo: "#150958",
  violet: "#3c0069",
  plum: "#631453",
  purple: "#4a1055",
  magenta: "#9e1c50",
  crimson: "#bd2230",
  blue: "#2962b2",
  paper: "#f9fafb",
};

/**
 * Per discipline: where the background ramp goes, and the two accents the
 * props are picked out in. Four disciplines that look related but not alike.
 */
const DISCIPLINES = {
  data: { ramp: [C.void, C.indigo, C.violet], accent: C.blue, second: C.magenta },
  engineering: { ramp: [C.void, C.indigo, C.purple], accent: C.magenta, second: C.blue },
  finance: { ramp: [C.void, C.indigo, C.plum], accent: C.crimson, second: C.blue },
  it: { ramp: [C.void, C.violet, C.indigo], accent: C.blue, second: C.crimson },
};
const FALLBACK = DISCIPLINES.data;

/** Deterministic per-role randomness: the same slug always draws the same scene. */
function rng(seed) {
  let h = Number.parseInt(createHash("sha1").update(seed).digest("hex").slice(0, 8), 16);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = (n) => Math.round(n * 10) / 10;
const pick = (r, list) => list[Math.floor(r() * list.length)];
const between = (r, lo, hi) => lo + r() * (hi - lo);

/* ---------------------------------------------------------------- motifs -- */

/**
 * The diagram on the wall. One per discipline, drawn into a 470x250 panel:
 * the thing this role would actually have sketched up behind their desk.
 */
const MOTIFS = {
  /** A pipeline: sources, a transform, a store, a chart. */
  data(r, a, b) {
    const y = 120;
    const nodes = [40, 150, 260, 370];
    let s = "";
    for (let i = 0; i < nodes.length; i += 1) {
      const x = nodes[i];
      s += `<rect x="${x}" y="${y}" width="72" height="50" rx="10" fill="${i % 2 ? b : a}" opacity=".85"/>`;
      // A couple of abstract rows inside each stage.
      s += `<rect x="${x + 12}" y="${y + 14}" width="${round(between(r, 26, 44))}" height="5" rx="2.5" fill="${C.paper}" opacity=".7"/>`;
      s += `<rect x="${x + 12}" y="${y + 27}" width="${round(between(r, 18, 34))}" height="5" rx="2.5" fill="${C.paper}" opacity=".45"/>`;
      if (i < nodes.length - 1) {
        const from = x + 72;
        const to = nodes[i + 1];
        s += `<path d="M${from + 6} ${y + 25}H${to - 12}" stroke="${C.paper}" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>`;
        s += `<path d="M${to - 16} ${y + 19}l8 6-8 6z" fill="${C.paper}" opacity=".6"/>`;
      }
    }
    // The store the pipeline lands in.
    const cx = 236;
    const cy = 214;
    s += `<ellipse cx="${cx}" cy="${cy - 26}" rx="34" ry="11" fill="${a}" opacity=".9"/>`;
    s += `<path d="M${cx - 34} ${cy - 26}v22a34 11 0 0 0 68 0v-22" fill="${a}" opacity=".55"/>`;
    s += `<path d="M${cx} ${y + 50}v${cy - 60 - y}" stroke="${C.paper}" stroke-opacity=".4" stroke-width="3" stroke-dasharray="6 7" stroke-linecap="round"/>`;
    return s;
  },

  /** A gear train and a truss: the two halves of a drawing board. */
  engineering(r, a, b) {
    const teeth = 9 + Math.floor(r() * 3);
    const gear = (cx, cy, radius, fill) => {
      let g = "";
      for (let i = 0; i < teeth; i += 1) {
        const angle = (i / teeth) * Math.PI * 2;
        const x = cx + Math.cos(angle) * (radius + 11);
        const y = cy + Math.sin(angle) * (radius + 11);
        g += `<rect x="${round(x - 7)}" y="${round(y - 7)}" width="14" height="14" rx="3" fill="${fill}" opacity=".85" transform="rotate(${round((angle * 180) / Math.PI)} ${round(x)} ${round(y)})"/>`;
      }
      g += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" opacity=".9"/>`;
      g += `<circle cx="${cx}" cy="${cy}" r="${round(radius * 0.38)}" fill="${C.void}" opacity=".55"/>`;
      return g;
    };
    let s = gear(96, 126, 44, a) + gear(176, 186, 26, b);
    // A truss, because half of engineering is triangles.
    const baseY = 206;
    const topY = 132;
    const xs = [250, 314, 378, 442];
    s += `<path d="M${xs[0]} ${baseY}H${xs[3]}" stroke="${C.paper}" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>`;
    s += `<path d="M${xs[0] + 32} ${topY}H${xs[2] + 32}" stroke="${C.paper}" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>`;
    for (let i = 0; i < 3; i += 1) {
      s += `<path d="M${xs[i]} ${baseY}L${xs[i] + 32} ${topY}L${xs[i + 1]} ${baseY}" fill="none" stroke="${b}" stroke-width="4" stroke-linejoin="round" opacity=".9"/>`;
    }
    // Dimension line under it.
    s += `<path d="M${xs[0]} ${baseY + 22}H${xs[3]}" stroke="${a}" stroke-width="2.5" opacity=".8"/>`;
    for (const x of [xs[0], xs[3]]) {
      s += `<path d="M${x} ${baseY + 15}v14" stroke="${a}" stroke-width="2.5" opacity=".8"/>`;
    }
    return s;
  },

  /** A bar chart with a trend over it, and the money it is counting. */
  finance(r, a, b) {
    const baseY = 216;
    let s = `<path d="M34 ${baseY}H330" stroke="${C.paper}" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/>`;
    const heights = Array.from({ length: 6 }, () => round(between(r, 42, 132)));
    const points = [];
    heights.forEach((h, i) => {
      const x = 46 + i * 48;
      s += `<rect x="${x}" y="${round(baseY - h)}" width="30" height="${h}" rx="7" fill="${i % 2 ? b : a}" opacity=".85"/>`;
      points.push(`${x + 15},${round(baseY - h - 16)}`);
    });
    s += `<polyline points="${points.join(" ")}" fill="none" stroke="${C.paper}" stroke-opacity=".75" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
    for (const p of points) {
      const [x, y] = p.split(",");
      s += `<circle cx="${x}" cy="${y}" r="4.5" fill="${C.paper}" opacity=".85"/>`;
    }
    // Coins, stacked.
    for (let i = 0; i < 3; i += 1) {
      const cy = 200 - i * 26;
      s += `<ellipse cx="400" cy="${cy}" rx="46" ry="16" fill="${i === 2 ? a : b}" opacity="${0.75 + i * 0.08}"/>`;
      s += `<ellipse cx="400" cy="${cy - 5}" rx="46" ry="16" fill="${C.paper}" opacity=".12"/>`;
    }
    return s;
  },

  /** A window of code and the cloud it ships to. */
  it(r, a, b) {
    let s = `<rect x="34" y="96" width="270" height="150" rx="14" fill="${C.void}" opacity=".55"/>`;
    s += `<rect x="34" y="96" width="270" height="30" rx="14" fill="${a}" opacity=".5"/>`;
    s += `<rect x="34" y="112" width="270" height="14" fill="${a}" opacity=".5"/>`;
    for (let i = 0; i < 3; i += 1) {
      s += `<circle cx="${56 + i * 20}" cy="111" r="5" fill="${C.paper}" opacity=".7"/>`;
    }
    for (let i = 0; i < 5; i += 1) {
      const indent = i === 0 || i === 4 ? 0 : 18;
      s += `<rect x="${54 + indent}" y="${142 + i * 20}" width="${round(between(r, 60, 210 - indent))}" height="7" rx="3.5" fill="${i % 2 ? b : C.paper}" opacity="${i % 2 ? 0.8 : 0.45}"/>`;
    }
    // Cloud.
    const cx = 392;
    const cy = 150;
    s += `<g opacity=".9"><circle cx="${cx - 34}" cy="${cy + 6}" r="26" fill="${b}"/><circle cx="${cx}" cy="${cy - 14}" r="34" fill="${b}"/><circle cx="${cx + 36}" cy="${cy + 4}" r="24" fill="${b}"/><rect x="${cx - 60}" y="${cy + 2}" width="122" height="30" rx="15" fill="${b}"/></g>`;
    s += `<path d="M${cx} ${cy + 44}v34" stroke="${C.paper}" stroke-opacity=".5" stroke-width="3.5" stroke-dasharray="7 8" stroke-linecap="round"/>`;
    s += `<path d="M${cx - 12} ${cy + 70}l12 14 12-14z" fill="${C.paper}" opacity=".6"/>`;
    return s;
  },
};

/* ----------------------------------------------------------------- scene -- */

function scene(slug, disciplineKey, { pair = false } = {}) {
  const r = rng(slug);
  const d = DISCIPLINES[disciplineKey] ?? FALLBACK;
  const { accent: a, second: b, ramp } = d;
  const motif = (MOTIFS[disciplineKey] ?? MOTIFS.data)(r, a, b);

  // Small, deterministic differences so 33 scenes are not one scene.
  const glowX = round(between(r, 760, 1010));
  const deskItems = pick(r, ["mug", "plant", "books"]);
  const noteTilt = [round(between(r, -14, -4)), round(between(r, 3, 13)), round(between(r, -9, 9))];
  const screenRows = 3 + Math.floor(r() * 3);

  let s = "";

  // Background: the brand ramp, the grid the site already uses, one glow.
  s += `<rect width="${ART_WIDTH}" height="${ART_HEIGHT}" fill="url(#bg)"/>`;
  s += `<g stroke="${C.paper}" stroke-opacity=".05" stroke-width="1">`;
  for (let x = 60; x < ART_WIDTH; x += 60) s += `<path d="M${x} 0v${ART_HEIGHT}"/>`;
  for (let y = 60; y < ART_HEIGHT; y += 60) s += `<path d="M0 ${y}h${ART_WIDTH}"/>`;
  s += `</g>`;
  s += `<ellipse cx="${glowX}" cy="170" rx="430" ry="300" fill="url(#glow)"/>`;

  // The diagram panel on the wall.
  s += `<g transform="translate(90 70)">`;
  s += `<rect width="470" height="250" rx="20" fill="${C.paper}" fill-opacity=".06" stroke="${C.paper}" stroke-opacity=".14" stroke-width="2"/>`;
  s += `<rect x="28" y="30" width="${round(between(r, 120, 200))}" height="9" rx="4.5" fill="${C.paper}" opacity=".4"/>`;
  s += `<rect x="28" y="52" width="${round(between(r, 70, 130))}" height="9" rx="4.5" fill="${a}" opacity=".8"/>`;
  s += motif;
  s += `</g>`;

  // Sticky notes, because every desk has them.
  const notes = [
    { x: 985, y: 92, fill: a },
    { x: 1072, y: 148, fill: b },
    { x: 1002, y: 208, fill: C.paper },
  ];
  notes.forEach((n, i) => {
    s += `<g transform="rotate(${noteTilt[i]} ${n.x + 38} ${n.y + 38})">`;
    s += `<rect x="${n.x}" y="${n.y}" width="76" height="76" rx="8" fill="${n.fill}" opacity="${n.fill === C.paper ? 0.22 : 0.8}"/>`;
    for (let k = 0; k < 3; k += 1) {
      s += `<rect x="${n.x + 14}" y="${n.y + 18 + k * 15}" width="${round(between(r, 22, 48))}" height="5" rx="2.5" fill="${C.paper}" opacity=".55"/>`;
    }
    s += `</g>`;
  });

  // The person, from behind: a silhouette, not a portrait. The chair behind
  // them is what makes it read - a near-black figure on a dark wall is a blob
  // until something lighter is sitting behind its edges.
  s += `<rect x="150" y="452" width="308" height="188" rx="54" fill="${a}" opacity=".16"/>`;
  s += `<rect x="150" y="452" width="308" height="188" rx="54" fill="none" stroke="${a}" stroke-opacity=".3" stroke-width="3"/>`;
  s += `<ellipse cx="304" cy="470" rx="150" ry="86" fill="url(#halo)"/>`;
  s += `<path d="M174 640c0-78 58-140 130-140s130 62 130 140z" fill="url(#body)"/>`;
  s += `<circle cx="304" cy="436" r="64" fill="url(#body)"/>`;
  // Rim light down both sides, which is what makes a flat silhouette read as 3D.
  s += `<path d="M304 372a64 64 0 0 1 50 104" fill="none" stroke="${a}" stroke-width="8" stroke-linecap="round" opacity=".9"/>`;
  s += `<path d="M304 372a64 64 0 0 0-50 104" fill="none" stroke="${b}" stroke-width="6" stroke-linecap="round" opacity=".5"/>`;
  s += `<path d="M434 640c0-56-28-104-72-126" fill="none" stroke="${a}" stroke-width="8" stroke-linecap="round" opacity=".65"/>`;
  s += `<path d="M174 640c0-56 28-104 72-126" fill="none" stroke="${b}" stroke-width="7" stroke-linecap="round" opacity=".4"/>`;

  // Monitors on the desk.
  const screen = (x, y, w, h, rows) => {
    let m = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.void}" opacity=".95"/>`;
    m += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="none" stroke="${a}" stroke-opacity=".45" stroke-width="3"/>`;
    m += `<rect x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" rx="7" fill="${a}" opacity=".12"/>`;
    for (let i = 0; i < rows; i += 1) {
      m += `<rect x="${x + 28}" y="${y + 32 + i * 22}" width="${round(between(r, 60, w - 70))}" height="8" rx="4" fill="${i === 0 ? b : C.paper}" opacity="${i === 0 ? 0.85 : 0.35}"/>`;
    }
    // A small chart in the corner of the screen.
    const cbY = y + h - 30;
    for (let i = 0; i < 4; i += 1) {
      const bh = round(between(r, 12, 44));
      m += `<rect x="${x + 28 + i * 18}" y="${round(cbY - bh)}" width="11" height="${bh}" rx="3" fill="${a}" opacity=".8"/>`;
    }
    return m;
  };
  s += screen(516, 392, 356, 228, screenRows);
  s += `<path d="M670 620h48l10 22h-68z" fill="${C.void}" opacity=".9"/>`;
  if (pair) {
    // The second desk, for the discipline index pages: same room, two people,
    // which is the difference between "this role" and "this team".
    s += `<rect x="836" y="472" width="268" height="168" rx="48" fill="${b}" opacity=".14"/>`;
    s += `<rect x="836" y="472" width="268" height="168" rx="48" fill="none" stroke="${b}" stroke-opacity=".28" stroke-width="3"/>`;
    s += `<ellipse cx="970" cy="490" rx="132" ry="76" fill="url(#halo)"/>`;
    s += `<path d="M858 640c0-68 50-122 112-122s112 54 112 122z" fill="url(#body)"/>`;
    s += `<circle cx="970" cy="462" r="55" fill="url(#body)"/>`;
    s += `<path d="M970 407a55 55 0 0 1 43 89" fill="none" stroke="${b}" stroke-width="7" stroke-linecap="round" opacity=".85"/>`;
    s += `<path d="M1082 640c0-48-24-90-62-109" fill="none" stroke="${b}" stroke-width="7" stroke-linecap="round" opacity=".55"/>`;
  } else {
    s += screen(900, 436, 216, 184, Math.max(2, screenRows - 1));
    s += `<path d="M990 620h36l8 22h-52z" fill="${C.void}" opacity=".9"/>`;
  }

  // Desk. Drawn last of the furniture so it cuts off the body and the stands.
  s += `<rect x="0" y="640" width="${ART_WIDTH}" height="28" rx="10" fill="${C.void}" opacity=".97"/>`;
  s += `<rect x="0" y="640" width="${ART_WIDTH}" height="5" fill="${a}" opacity=".6"/>`;
  s += `<rect x="0" y="668" width="${ART_WIDTH}" height="${ART_HEIGHT - 668}" fill="${C.void}" opacity=".8"/>`;

  // One prop on the desk, varied per role.
  if (deskItems === "mug") {
    s += `<rect x="470" y="588" width="48" height="52" rx="10" fill="${b}" opacity=".9"/>`;
    s += `<path d="M518 602h16a14 14 0 0 1 0 28h-16" fill="none" stroke="${b}" stroke-width="7" opacity=".9"/>`;
  } else if (deskItems === "plant") {
    s += `<path d="M1132 640v-36" stroke="${C.paper}" stroke-opacity=".4" stroke-width="5"/>`;
    s += `<ellipse cx="1108" cy="584" rx="28" ry="15" fill="${b}" opacity=".85" transform="rotate(-24 1108 584)"/>`;
    s += `<ellipse cx="1156" cy="578" rx="28" ry="15" fill="${a}" opacity=".85" transform="rotate(22 1156 578)"/>`;
    s += `<path d="M1110 612h44l-7 28h-30z" fill="${a}" opacity=".9"/>`;
  } else {
    for (let i = 0; i < 3; i += 1) {
      s += `<rect x="${92 + i * 5}" y="${626 - i * 15}" width="${100 - i * 10}" height="14" rx="4" fill="${i % 2 ? a : b}" opacity=".85"/>`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ART_WIDTH}" height="${ART_HEIGHT}" viewBox="0 0 ${ART_WIDTH} ${ART_HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${ramp[0]}"/>
      <stop offset=".55" stop-color="${ramp[1]}"/>
      <stop offset="1" stop-color="${ramp[2]}"/>
    </linearGradient>
    <linearGradient id="body" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${C.void}"/>
      <stop offset="1" stop-color="${C.indigo}"/>
    </linearGradient>
    <radialGradient id="halo">
      <stop offset="0" stop-color="${b}" stop-opacity=".45"/>
      <stop offset="1" stop-color="${b}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="glow">
      <stop offset="0" stop-color="${a}" stop-opacity=".55"/>
      <stop offset="1" stop-color="${a}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${s}
</svg>`;
}

/* ------------------------------------------------------------------ main -- */

const pages = JSON.parse(await readFile(path.join(ROOT, "src/content/pages.json"), "utf8"));
const roles = pages.filter((p) => p.kind === "role");
const disciplines = pages.filter((p) => p.kind === "discipline");
if (!roles.length) {
  console.error("no role pages in src/content/pages.json - run the content build first");
  process.exit(1);
}

/** Every scene to draw: the file it goes in, and how to seed it. */
const wanted = [
  ...disciplines.map((p) => {
    const slug = p.route.split("/")[2];
    return { name: `${slug}.webp`, seed: slug, discipline: slug, pair: true };
  }),
  ...roles.map((p) => {
    const [, , discipline, slug] = p.route.split("/");
    return { name: `${discipline}-${slug}.webp`, seed: `${discipline}/${slug}`, discipline, pair: false };
  }),
];

await mkdir(OUT_DIR, { recursive: true });

// Anything this script wrote before is ours to replace; anything else in the
// folder is a hand-made illustration and is left where it is.
const previous = existsSync(MANIFEST)
  ? new Set(JSON.parse(await readFile(MANIFEST, "utf8")).generated ?? [])
  : new Set();

const generated = [];
let kept = 0;

for (const item of wanted) {
  const file = path.join(OUT_DIR, item.name);

  if (existsSync(file) && !previous.has(item.name)) {
    kept += 1;
    continue;
  }

  const svg = scene(item.seed, item.discipline, { pair: item.pair });
  await sharp(Buffer.from(svg)).webp({ quality: 90 }).toFile(file);
  generated.push(item.name);
}

await writeFile(
  MANIFEST,
  `${JSON.stringify({ width: ART_WIDTH, height: ART_HEIGHT, generated }, null, 1)}\n`,
);

console.log(
  `wrote ${generated.length} illustrations to public/roles/ ` +
    `(${disciplines.length} disciplines, ${roles.length} roles)` +
    (kept ? ` - ${kept} hand-made file${kept === 1 ? "" : "s"} left alone` : ""),
);
