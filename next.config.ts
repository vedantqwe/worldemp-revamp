import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
