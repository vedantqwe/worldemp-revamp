/**
 * Content the CMS writes, laid over the content the build generates.
 *
 * There are two content pipelines in this repo and they must not fight:
 *
 *   src/content/  is generated. tools/scraper rewrites pages.json wholesale on
 *                 every `npm run sync`, so anything typed into it is lost at
 *                 the next crawl. CLAUDE.md says never to edit it by hand, and
 *                 a CMS pointed at it would be exactly that, once a week.
 *   content/      is written by a person - or by Sveltia CMS on their behalf -
 *                 and is never generated. It wins.
 *
 * So the CMS edits overrides, not sources. A re-crawl refreshes the migrated
 * copy underneath and the overrides survive on top, which is the only
 * arrangement where "re-scrape the live site" and "fix this headline" are both
 * allowed to happen.
 *
 * The merge is deliberately forgiving. An override file may be absent, empty,
 * or half-filled and the site still builds with its defaults, because the
 * failure mode of a CMS is a half-filled form, not a missing one.
 */

/** A JSON object of unknown shape, which is what an override file is. */
type Json = Record<string, unknown>;

/**
 * Whether a value the CMS wrote should replace the default.
 *
 * This is the single most important rule here. Sveltia writes every field in
 * the schema, including the ones the editor left alone, so an override file
 * arrives full of empty strings. Treating those as real values would mean
 * that overriding one headline blanks every other string beside it - the
 * site would empty itself out one save at a time.
 *
 * An empty string, an empty list and a null are therefore "not set" rather
 * than "set to nothing". The cost is that a field cannot be deliberately
 * blanked through the CMS, which is the right trade: a blank heading is never
 * the intent, and the fix is to edit the default in source.
 */
function isSet(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value as Json).length > 0;
  return true;
}

function isPlainObject(value: unknown): value is Json {
  return (
    typeof value === "object" && value !== null && !Array.isArray(value)
  );
}

/**
 * Deep-merge an override over a default.
 *
 * Objects merge key by key. Arrays and scalars replace wholesale: merging two
 * lists element by element looks clever and behaves badly - reordering the
 * stats row in the CMS would splice values across each other rather than
 * reordering it. A list the editor touched is the list they meant.
 */
export function merge<T>(base: T, override: unknown): T {
  if (!isSet(override)) return base;
  if (!isPlainObject(base) || !isPlainObject(override)) return override as T;

  const out: Json = { ...base };
  for (const [key, value] of Object.entries(override)) {
    if (!isSet(value)) continue;
    out[key] = key in base ? merge((base as Json)[key], value) : value;
  }
  return out as T;
}

/**
 * Turn a CMS list into a keyed record.
 *
 * A record with eight fixed keys - the section mastheads - is a wall of
 * identical YAML in a CMS config and a wall of identical form fields on
 * screen. As a list of `{ section, ...}` it is one "add an override" button
 * and only the sections someone actually wants to change.
 */
export function keyBy<T extends Json>(
  list: readonly T[] | undefined,
  key: keyof T,
): Record<string, Partial<T>> {
  const out: Record<string, Partial<T>> = {};
  for (const item of list ?? []) {
    const id = item?.[key];
    if (typeof id !== "string" || id.trim() === "") continue;
    const { [key]: _drop, ...rest } = item;
    void _drop;
    if (Object.keys(rest).length) out[id.trim()] = rest as Partial<T>;
  }
  return out;
}
