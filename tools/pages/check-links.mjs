#!/usr/bin/env node
/**
 * Walks every page in `out/` and checks that each link and image on it points
 * at something that exists.
 *
 * A static export makes this cheap and exact: the whole site is on disk, so a
 * link either resolves to a file or it does not, and there is no server to be
 * generous about it. Run it after `npm run build:pages`:
 *
 *     node tools/pages/check-links.mjs
 *
 * External links are listed, not fetched - a network check would be flaky and
 * would turn a build step into a rate limit. Internal targets are everything
 * this can be strict about, so it is strict about them.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "../..");
const OUT = path.join(ROOT, "out");
const BASE = process.env.PAGES_BASE_PATH ?? "/worldemp-revamp";

if (!existsSync(OUT)) {
  console.error("no out/ - run `npm run build:pages` first");
  process.exit(1);
}

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(p);
    else if (entry.name.endsWith(".html")) yield p;
  }
}

/** Does a URL path resolve to a file in the export? */
function resolves(urlPath) {
  const clean = urlPath.split("#")[0].split("?")[0];
  if (!clean.startsWith(BASE)) return false;
  const rel = clean.slice(BASE.length) || "/";
  const file = path.join(OUT, decodeURIComponent(rel));
  if (existsSync(file)) {
    return statSync(file).isDirectory() ? existsSync(path.join(file, "index.html")) : true;
  }
  return existsSync(`${file}.html`) || existsSync(path.join(file, "index.html"));
}

const attrs = /(?:href|src)="([^"]+)"/g;
const broken = new Map(); // target -> pages that link to it
const external = new Set();
let pages = 0;
let checked = 0;

for (const file of htmlFiles(OUT)) {
  pages += 1;
  const from = `/${path.relative(OUT, file).split(path.sep).join("/")}`;
  const html = readFileSync(file, "utf8");
  for (const [, raw] of html.matchAll(attrs)) {
    if (raw.startsWith("data:") || raw.startsWith("#")) continue;
    if (/^(https?:)?\/\//.test(raw)) {
      external.add(raw.split("?")[0]);
      continue;
    }
    if (/^(mailto|tel):/.test(raw)) continue;
    if (!raw.startsWith("/")) continue;
    checked += 1;
    if (resolves(raw)) continue;
    if (!broken.has(raw)) broken.set(raw, new Set());
    broken.get(raw).add(from);
  }
}

console.log(`${pages} pages, ${checked} internal links and assets checked`);
console.log(`${external.size} distinct external destinations (not fetched)`);
for (const url of [...external].sort()) console.log(`  -> ${url}`);

if (broken.size) {
  console.error(`\n${broken.size} target(s) do not exist:`);
  for (const [target, sources] of broken) {
    const list = [...sources];
    console.error(`  ${target}`);
    console.error(`     linked from ${list.length} page(s), e.g. ${list.slice(0, 3).join(", ")}`);
  }
  process.exit(1);
}

console.log("\nevery internal link and asset resolves");
