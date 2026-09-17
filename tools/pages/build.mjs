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
import { copyFileSync, readdirSync, writeFileSync } from "node:fs";
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

console.log(
  `\nout/ is ready for GitHub Pages (base path ${base}, ${copied} prefetch payloads flattened)`,
);
