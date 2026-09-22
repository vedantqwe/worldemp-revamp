#!/usr/bin/env node
/**
 * Checks the CMS: its config, and the files it writes.
 *
 * All of this fails silently by nature. A route typed with a typo never
 * matches anything, so the page keeps its old title and the person who made
 * the edit sees a green tick and a deploy. A malformed config.yml is worse -
 * nothing renders at /admin at all, and nothing anywhere else notices,
 * because the site itself builds perfectly well without a working CMS.
 *
 * The config check earns its place: the first version of config.yml here had
 * `hint: The tel: URL behind the number`, whose colon-space YAML reads as a
 * nested mapping. It parsed as garbage, and the only symptom would have been
 * a blank admin page in someone else's browser.
 *
 * Four questions, in order of how quietly each goes wrong:
 *
 *   - does config.yml parse, and name files that exist?
 *   - do the override files still parse? (a hand-edit can break them)
 *   - does every route named in pages.json exist?
 *   - does every section named in copy.json exist?
 *
 * Run it with `npm run cms:check`. It exits non-zero on a real problem, so it
 * can sit in CI beside the link and language checks.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load as loadYaml } from "js-yaml";

const root = process.cwd();
const problems = [];
const notes = [];

/** The eight sections that have a masthead in src/lib/content.ts. */
const SECTIONS = new Set([
  "solutions",
  "services",
  "sectors",
  "method",
  "about",
  "insights",
  "cases",
  "contact",
]);

function read(path) {
  const full = join(root, path);
  try {
    return JSON.parse(readFileSync(full, "utf8"));
  } catch (error) {
    problems.push(`${path} does not parse: ${error.message}`);
    return null;
  }
}

const copy = read("content/copy.json");
const overrides = read("content/pages.json");
const pages = read("src/content/pages.json");

/* ------------------------------------------------------------ cms config -- */

let config = null;
try {
  config = loadYaml(readFileSync(join(root, "public/admin/config.yml"), "utf8"));
} catch (error) {
  problems.push(`public/admin/config.yml does not parse: ${error.message}`);
}

if (config) {
  const collections = Array.isArray(config.collections) ? config.collections : [];
  if (!collections.length) {
    problems.push("public/admin/config.yml: no collections, so the CMS shows nothing");
  }

  // Every file the CMS offers to edit has to be there already. Sveltia can
  // create a missing one, but a path that is merely misspelt would be created
  // happily and then read by nothing.
  for (const collection of collections) {
    for (const file of collection.files ?? []) {
      if (!file.file) {
        problems.push(`config.yml: "${collection.name}" has a file entry with no path`);
      } else if (!existsSync(join(root, file.file))) {
        problems.push(`config.yml: "${collection.name}" points at missing ${file.file}`);
      }
    }
  }

  if (config.backend?.name === "github" && !config.backend.repo?.includes("/")) {
    problems.push('config.yml: backend.repo should look like "owner/name"');
  }

  notes.push(
    `CMS config: ${collections.length} collection(s), backend ${config.backend?.name ?? "?"}`,
  );
}

/* ----------------------------------------------------------- page routes -- */

if (overrides && pages) {
  const routes = new Set(pages.map((p) => p.route));
  const list = Array.isArray(overrides.overrides) ? overrides.overrides : [];
  const seen = new Set();

  for (const entry of list) {
    const route = entry?.route;
    if (typeof route !== "string" || !route.trim()) {
      problems.push("content/pages.json: an override has no route");
      continue;
    }
    if (!routes.has(route)) {
      // The likeliest cause by a distance: the locale prefix left on.
      const stripped = route.replace(/^\/(en|nl)(?=\/)/, "");
      const hint = routes.has(stripped)
        ? ` - did you mean "${stripped}"? Routes here carry no language prefix.`
        : "";
      problems.push(`content/pages.json: no page at "${route}"${hint}`);
    }
    if (seen.has(route)) {
      problems.push(
        `content/pages.json: "${route}" is overridden twice; the second wins`,
      );
    }
    seen.add(route);
  }

  notes.push(`${list.length} page override(s) against ${routes.size} routes`);
}

/* -------------------------------------------------------------- sections -- */

if (copy) {
  for (const locale of ["en", "nl"]) {
    const mastheads = copy[locale]?.mastheads;
    if (!Array.isArray(mastheads)) continue;
    for (const entry of mastheads) {
      const section = entry?.section;
      if (typeof section !== "string" || !section.trim()) {
        problems.push(`content/copy.json (${locale}): a section header has no section`);
      } else if (!SECTIONS.has(section)) {
        problems.push(
          `content/copy.json (${locale}): "${section}" is not a section` +
            ` - one of ${[...SECTIONS].join(", ")}`,
        );
      }
    }
    if (mastheads.length) {
      notes.push(`${mastheads.length} section header override(s) in ${locale}`);
    }
  }
}

/* ----------------------------------------------------------------- report -- */

for (const note of notes) console.log(`  ${note}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s) in the CMS overrides:\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

console.log("\nCMS overrides are consistent with the site");
