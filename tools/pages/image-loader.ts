/**
 * `next/image` loader for the GitHub Pages build.
 *
 * Pages serves the site from a subdirectory, and `basePath` does not reach the
 * `src` of an image: the framework only rewrites it while building the URL for
 * its own optimiser, which a static export has no server to run. Left alone,
 * every `/media/...` reference resolves against the domain root and 404s.
 *
 * So the prefix is applied here instead. Width and quality are ignored on
 * purpose - the files are already sized and re-encoded to webp by the content
 * build, and there is nothing at request time to resize them with.
 */
export default function pagesImageLoader({ src }: { src: string }): string {
  // Inlined at build time by `env` in next.config.ts, because this runs in the
  // browser as well as on the build machine.
  const base = process.env.NEXT_PUBLIC_PAGES_BASE_PATH ?? "";
  return src.startsWith("/") ? `${base}${src}` : src;
}
