import type { NextConfig } from "next";

/**
 * Set by `.github/workflows/pages.yml` (and by `npm run build:pages`).
 *
 * GitHub Pages is a plain file host: no rewrites, no redirects, no image
 * optimiser, and the site is served from a subdirectory. So the Pages build is
 * a genuinely different target rather than the same one with a flag, and the
 * two configurations are kept apart instead of interleaved.
 */
const pages = process.env.GITHUB_PAGES === "1";

/** `vedantqwe.github.io/worldemp-revamp/...`, overridable if the repo moves. */
const pagesBase = process.env.PAGES_BASE_PATH ?? "/worldemp-revamp";

const nextConfig: NextConfig = pages
  ? {
      output: "export",
      basePath: pagesBase,
      // No optimiser at request time, and the loader is what puts the base
      // path on a /media URL - see tools/pages/image-loader.ts.
      images: { loader: "custom", loaderFile: "./tools/pages/image-loader.ts" },
      // The loader runs in the browser too, so the prefix has to be inlined.
      env: { NEXT_PUBLIC_PAGES_BASE_PATH: pagesBase },
      // Every route becomes `<route>/index.html`, which is what a static host
      // can serve without a rewrite rule.
      trailingSlash: true,
    }
  : {
      async redirects() {
        return [
          // The app lives entirely under /en and /nl, so the bare root and any
          // pre-locale bookmark land on the English edition.
          { source: "/", destination: "/en", permanent: false },
          {
            // Two lookaheads, both anchored at the start of the path: the first
            // skips the locales and the framework's own paths, the second skips
            // anything that ends in a file extension. No content route has a dot
            // in it, and the second rule is what keeps /icon.svg, /apple-icon.png
            // and everything in public/ from being sent to /en.
            source:
              "/:path((?!en$|nl$|en/|nl/|_next|api)(?!.*\\.[A-Za-z0-9]+$).*)",
            destination: "/en/:path",
            permanent: false,
          },
        ];
      },
    };

export default nextConfig;
