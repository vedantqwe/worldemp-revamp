#!/usr/bin/env node
/**
 * Static build for GitHub Pages.
 *
 * `next build` with GITHUB_PAGES=1 (see next.config.ts) exports the whole site
 * to `out/`, but a file host cannot do three things next.config.ts otherwise
 * asks the server for:
 *
 *   - the bare `/` redirect to `/en`, so this writes a root index.html;
 *   - serving `_next/`, which GitHub Pages would hand to Jekyll and drop,
 *     hence `.nojekyll`;
 *   - resolving the router's prefetch payloads, see `flattenPrefetches`.
 *
 * Run it with `npm run build:pages`. Works the same locally and in CI, which
 * is the point - a Pages failure should be reproducible without pushing.
 */
import { spawnSync } from "node:child_process";
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const base = process.env.PAGES_BASE_PATH ?? "/worldemp-revamp";
const out = join(process.cwd(), "out");

// Next's own CLI entry, run by this node rather than through npx: on Windows
// npx is a .cmd shim, which node refuses to spawn without a shell.
const cli = join(process.cwd(), "node_modules", "next", "dist", "bin", "next");
const build = spawnSync(process.execPath, [cli, "build"], {
  stdio: "inherit",
  env: { ...process.env, GITHUB_PAGES: "1", PAGES_BASE_PATH: base },
});
if (build.error) {
  console.error(`could not run ${cli}:`, build.error.message);
  process.exit(1);
}
if (build.status !== 0) process.exit(build.status ?? 1);

/**
 * The router prefetches each route's segments as `.txt` payloads, and asks for
 * them with the segment key flattened into the filename:
 *
 *     GET /en/services/__next.$d$locale.services.__PAGE__.txt
 *
 * The export writes that payload as a *directory* path instead:
 *
 *     out/en/services/__next.$d$locale/services/__PAGE__.txt
 *
 * A Next server maps between the two; a file host cannot, so every prefetch
 * 404s. Navigation still works - the router falls back to fetching the page -
 * but each visit fires a dozen failed requests. Writing the flat name beside
 * the nested one costs a few hundred small files and makes prefetching work.
 */
function flattenPrefetches(dir) {
  let copied = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.startsWith("__next.")) {
        // Everything under here is one payload tree: the flat name is the
        // path from this directory down, with the separators as dots.
        for (const file of walk(path)) {
          const flat = [entry.name, ...relative(path, file).split(sep)].join(".");
          copyFileSync(file, join(dir, flat));
          copied += 1;
        }
      } else {
        copied += flattenPrefetches(path);
      }
    }
  }
  return copied;
}

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else yield path;
  }
}

const copied = flattenPrefetches(out);

// The English edition is the default, matching the `/` -> `/en` redirect the
// server build uses. <meta refresh> rather than JS so it survives no-script,
// with a real link behind it for anything that honours neither.
const home = `${base}/en/`;
writeFileSync(
  join(out, "index.html"),
  `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>WorldEmp</title>
    <meta http-equiv="refresh" content="0; url=${home}" />
    <link rel="canonical" href="${home}" />
  </head>
  <body>
    <p><a href="${home}">Continue to WorldEmp</a></p>
  </body>
</html>
`,
);
writeFileSync(join(out, ".nojekyll"), "");

/*
 * llms.txt.
 *
 * The convention the answer engines are converging on: one plain-text map of
 * the site, so a model reading it does not have to infer the shape of the
 * place from whichever page it happened to land on. Generated from the same
 * content the sitemap uses, so the two cannot disagree, and carrying each
 * page's one-line description rather than its prose - enough to choose a
 * page, not a copy of one.
 */
const site = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://vedantqwe.github.io/worldemp-revamp"
).replace(/\/$/, "");

const pages = JSON.parse(
  readFileSync(join(process.cwd(), "src/content/pages.json"), "utf8"),
);

const section = (kind, heading) => {
  const rows = pages
    .filter((p) => p.kind === kind && p.en)
    .sort((a, b) => a.route.localeCompare(b.route))
    .map((p) => {
      const summary = (p.en.description ?? "").replace(/\s+/g, " ").trim();
      const line = `- [${p.en.title}](${site}/en${p.route})`;
      return summary ? `${line}: ${summary}` : line;
    });
  return rows.length ? `\n## ${heading}\n\n${rows.join("\n")}\n` : "";
};

const llms = [
  "# WorldEmp",
  "",
  "> WorldEmp connects European companies with dedicated remote professionals",
  "> in India - engineering, data, finance and IT - who work as an integrated",
  "> part of the client's own team. The client directs the work; WorldEmp",
  "> handles local employment, payroll, HR and compliance.",
  "",
  "Both editions of every page exist: /en for English, /nl for Dutch. Replace",
  "the prefix to switch language; the rest of the path is identical.",
  "",
  "- Contact: info@worldemp.com, +31 (0)88 - 400 29 00",
  `- Sitemap: ${site}/sitemap.xml`,
  section("service", "Services"),
  section("sector", "Sectors"),
  section("discipline", "Disciplines"),
  section("role", "Roles"),
  section("case", "Client stories"),
  section("article", "Knowledge base"),
  section("page", "About"),
].join("\n");

writeFileSync(join(out, "llms.txt"), llms);

console.log(
  `\nout/ is ready for GitHub Pages (base path ${base}, ${copied} prefetch payloads flattened)`,
);
