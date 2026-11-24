"use client";

import { useEffect } from "react";
import type { PageScript } from "@/lib/pages";

const THEME = "/wp-content/themes/schoeman-clinic/assets";

/** Where each script comes from, and the id the live site gave its <script>. */
const SOURCES: Record<"cookie-law-info" | "site" | Exclude<PageScript, "ghl-form">, { id: string; src: string }> = {
  "cookie-law-info": {
    id: "cookie-law-info-js",
    src: "/wp-content/plugins/cookie-law-info/lite/frontend/js/script.min.js",
  },
  site: { id: "schoeman-site-js", src: `${THEME}/site.js` },
  article: { id: "schoeman-article-js", src: `${THEME}/article.js` },
  "comment-reply": { id: "comment-reply-js", src: "/wp-includes/js/comment-reply.min.js" },
  faq: { id: "schoeman-faq-js", src: `${THEME}/faq.js` },
  "team-filter": { id: "schoeman-team-filter-js", src: `${THEME}/team-filter.js` },
  bio: { id: "schoeman-bio-js", src: `${THEME}/bio.js` },
};

/**
 * The scripts that change the page's markup: the cookie banner (CookieYes), the theme's site.js (menus,
 * search, animations, video, footer accordions, custom selects) and the page's own scripts.
 *
 * They run once React has hydrated the page: run any earlier and React would find markup it did not
 * render and replace the page. They run in order, as the live site's <script> tags did.
 */
export function ThemeScripts({ scripts }: { scripts: PageScript[] }) {
  const key = scripts.join(" ");
  useEffect(() => {
    for (const name of ["cookie-law-info", "site", ...key.split(" ").filter(Boolean)] as const) {
      if (name === "ghl-form") continue; // LeadConnectorForm
      const { id, src } = SOURCES[name as keyof typeof SOURCES];
      if (document.getElementById(id)) continue;
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = false; // keep the order
      document.body.appendChild(script);
    }
  }, [key]);
  return null;
}
