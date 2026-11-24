import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Every address on the live site ends in a slash: keep them exactly.
  trailingSlash: true,
  // Pages ship the live site's markup, so they are pre-rendered and served as static HTML.
  poweredByHeader: false,
  experimental: {
    // One 404 page for every unknown address (the root layout sits under the catch-all route).
    globalNotFound: true,
  },
  async redirects() {
    return [
      // Old WordPress addresses.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/wp-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/:name(page|post|team)-sitemap.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/feed/", destination: "/journal/", permanent: true },
      { source: "/wp-admin/:path*", destination: "/", permanent: false },
      { source: "/wp-login.php", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
