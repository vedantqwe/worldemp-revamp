#!/usr/bin/env node
/**
 * Checks that the CMS bundle the admin page pins is the bundle the CDN serves.
 *
 * public/admin/index.html loads Sveltia CMS from unpkg under a Subresource
 * Integrity hash, which is what stops a compromised CDN handing an editing
 * session a script of its own. A hash is only worth having if somebody
 * notices when it stops matching, so this fetches the pinned version and
 * compares.
 *
 * It also prints the hash for the version named in the file, which is what
 * you need when deliberately upgrading: bump the version in index.html, run
 * this, paste the hash it prints.
 *
 * Run it with `npm run cms:verify`. Needs the network; it is not part of the
 * build.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ADMIN = join(process.cwd(), "public/admin/index.html");
const html = readFileSync(ADMIN, "utf8");

const src = html.match(/src="(https:\/\/unpkg\.com\/@sveltia\/cms@([^/]+)\/[^"]+)"/);
const pinned = html.match(/integrity="(sha384-[^"]+)"/);

if (!src) {
  console.error("public/admin/index.html: no pinned Sveltia CMS script tag found");
  process.exit(1);
}

const [, url, version] = src;
console.log(`pinned:  @sveltia/cms@${version}`);
console.log(`source:  ${url}`);

const response = await fetch(url, { redirect: "follow" });
if (!response.ok) {
  console.error(`\ncould not fetch the bundle: HTTP ${response.status}`);
  console.error("If the version was just bumped, check it exists on npm.");
  process.exit(1);
}

const bytes = Buffer.from(await response.arrayBuffer());
const actual = `sha384-${createHash("sha384").update(bytes).digest("base64")}`;

console.log(`size:    ${(bytes.length / 1024).toFixed(0)} KB`);
console.log(`hash:    ${actual}`);

if (!pinned) {
  console.error("\npublic/admin/index.html has no integrity attribute.");
  console.error(`Add integrity="${actual}" crossorigin="anonymous" to the script tag.`);
  process.exit(1);
}

if (pinned[1] !== actual) {
  console.error("\nThe bundle does not match the hash the admin page pins.");
  console.error(`  pinned: ${pinned[1]}`);
  console.error(`  actual: ${actual}`);
  console.error(
    "\nIf you just changed the version, this is expected - paste the actual" +
      "\nhash into public/admin/index.html. If you did not, do not ignore it.",
  );
  process.exit(1);
}

console.log("\nthe pinned bundle is the one the CDN serves");
