// Turns one extracted WordPress page ({ path, lang, bodyClass, head, body }) into the site's page data:
// the SEO tags, which WordPress and theme styles and scripts it loads, and the markup of its <main>.
// Everything else in the page is the same on every page and lives in src/components.
import { parseHTML } from "linkedom";

/** The <head> tags rendered by components (SiteHead, CookieConsent) rather than kept per page. */
const SHARED_HEAD = new Set([
  "schoeman-analytics",
  "wp-img-auto-sizes-contain-inline-css",
  "schoeman-site-css",
  "schoeman-custom-css",
  "cookie-law-info-js-extra",
  "cookie-law-info-js",
  "cky-style-inline",
]);
/** WordPress block styles a page may load, in the order WordPress prints them. */
export const WORDPRESS_STYLES = [
  "wp-block-library",
  "wp-block-heading",
  "wp-block-button",
  "wp-block-list",
  "wp-block-paragraph",
  "wp-block-buttons",
  "classic-theme-styles",
  "global-styles",
];
/** Theme stylesheets a page may add after site.css and custom.css. */
export const THEME_STYLES = ["article", "bio"];
/** Scripts a page may load after site.js, by id (schoeman-<name>-js, or <name>-js for WordPress's own). */
export const PAGE_SCRIPTS = ["article", "ghl-form", "comment-reply", "faq", "team-filter", "bio"];
/** Body elements rendered by components. */
const SHARED_BODY = new Set(["tsc-search", "tsc-menu", "tsc-video", "ckyBannerTemplate", "schoeman-site-js-extra", "schoeman-site-js", "tsc-preloader"]);

function isSharedIcon(el) {
  const tag = el.tagName.toLowerCase();
  const rel = (el.getAttribute("rel") ?? "").toLowerCase();
  if (tag === "meta") return el.hasAttribute("charset") || ["viewport", "msapplication-TileImage"].includes(el.getAttribute("name"));
  return tag === "link" && (rel.includes("icon") || rel === "preload");
}

function seoTag(el) {
  const tag = el.tagName.toLowerCase();
  const attrs = Object.fromEntries([...el.attributes].map((a) => [a.name, a.value]));
  const text = tag === "title" || tag === "script" ? el.textContent : undefined;
  return text === undefined ? { tag, attrs } : { tag, attrs, text };
}

export function shapePage(page) {
  const { document: head } = parseHTML(`<html><head>${page.head}</head><body></body></html>`);
  const seo = [];
  const wordpressStyles = [];
  const themeStyles = [];
  for (const el of head.head.children) {
    const id = el.id;
    if (SHARED_HEAD.has(id) || isSharedIcon(el)) continue;
    const style = id.match(/^(.+)-inline-css$/);
    if (el.tagName === "STYLE" && style && WORDPRESS_STYLES.includes(style[1])) wordpressStyles.push(style[1]);
    else if (/^schoeman-(\w+)-css$/.test(id) && THEME_STYLES.includes(id.split("-")[1])) themeStyles.push(id.split("-")[1]);
    else if (["title", "meta", "link", "script"].includes(el.tagName.toLowerCase())) seo.push(seoTag(el));
    else throw new Error(`${page.path}: unexpected head tag ${el.outerHTML.slice(0, 120)}`);
  }
  wordpressStyles.sort((a, b) => WORDPRESS_STYLES.indexOf(a) - WORDPRESS_STYLES.indexOf(b));

  const { document } = parseHTML(`<html><head></head><body>${page.body}</body></html>`);
  const shell = document.querySelector("body > .min-h-screen");
  const main = shell?.querySelector(":scope > main#content");
  const kids = [...(shell?.childNodes ?? [])].filter((n) => n.nodeType === 1 || (n.nodeType === 8 && n.textContent.startsWith("SC:")));
  const shape = kids.map((n) => (n.nodeType === 8 ? n.textContent : n.id)).join(" ");
  if (shape !== "SC:HEADER mega-scrim content SC:FOOTER" || main.attributes.length !== 1) {
    throw new Error(`${page.path}: unexpected page shell (${shape})`);
  }
  const scripts = [];
  let preloader = false;
  for (const el of document.body.children) {
    if (el === shell) continue;
    if (el.id === "tsc-preloader" || (el.tagName === "SCRIPT" && !el.id && el.textContent.includes("tsc-preloading"))) {
      preloader = true;
      continue;
    }
    if (SHARED_BODY.has(el.id)) continue;
    const script = el.id.match(/^(?:schoeman-)?(.+)-js$/);
    if (el.tagName === "SCRIPT" && script && PAGE_SCRIPTS.includes(script[1])) scripts.push(script[1]);
    else throw new Error(`${page.path}: unexpected body element ${el.outerHTML.slice(0, 120)}`);
  }

  return {
    path: page.path,
    lang: page.lang,
    bodyClass: page.bodyClass,
    seo,
    wordpressStyles,
    themeStyles,
    scripts,
    ...(preloader ? { preloader } : {}),
    main: main.innerHTML,
  };
}
