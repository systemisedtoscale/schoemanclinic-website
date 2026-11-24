import fs from "node:fs";
import path from "node:path";

/** One tag of a page's SEO block: title, meta, canonical and pagination links, JSON-LD. */
export type SeoTag = {
  tag: "title" | "meta" | "link" | "script";
  attrs: Record<string, string>;
  text?: string;
};

/** WordPress block styles a page may load (src/inline/wordpress/<name>.css). */
export type WordPressStyle =
  | "wp-block-library"
  | "wp-block-heading"
  | "wp-block-button"
  | "wp-block-list"
  | "wp-block-paragraph"
  | "wp-block-buttons"
  | "classic-theme-styles"
  | "global-styles";
/** Theme stylesheets a page may add (public/wp-content/themes/schoeman-clinic/assets/<name>.css). */
export type ThemeStyle = "article" | "bio";
/** Scripts a page may load after site.js (see components/scripts/ThemeScripts). */
export type PageScript = "article" | "ghl-form" | "comment-reply" | "faq" | "team-filter" | "bio";

/** A page of the site: src/data/pages/<slug>.json. */
export type PageData = {
  /** The page's address, with leading and trailing slashes ("/" for the home page). */
  path: string;
  lang: string;
  bodyClass: string;
  seo: SeoTag[];
  wordpressStyles: WordPressStyle[];
  themeStyles: ThemeStyle[];
  scripts: PageScript[];
  /** The home page's opening animation. */
  preloader?: boolean;
  /** The markup inside <main id="content">. */
  main: string;
};

const DIR = path.join(process.cwd(), "src/data/pages");
const NOT_FOUND_PATH = "/404/";

let cache: PageData[] | undefined;

/** Every page, the 404 page included. */
export function allPages(): PageData[] {
  cache ??= fs
    .readdirSync(DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8")) as PageData)
    .sort((a, b) => a.path.localeCompare(b.path));
  return cache;
}

/** The pages that have an address of their own (all but the 404 page). */
export function routablePages(): PageData[] {
  return allPages().filter((page) => page.path !== NOT_FOUND_PATH);
}

/** The route segments of a page: "/clinic/wimbledon/" → ["clinic", "wimbledon"], "/" → []. */
export function slugOf(page: PageData): string[] {
  return page.path.split("/").filter(Boolean);
}

/** The page at the given route segments, if there is one. */
export function findPage(slug: string[] = []): PageData | undefined {
  const wanted = slug.length ? `/${slug.map(decodeURIComponent).join("/")}/` : "/";
  return routablePages().find((page) => page.path === wanted);
}

export function notFoundPage(): PageData {
  const page = allPages().find((p) => p.path === NOT_FOUND_PATH);
  if (!page) throw new Error("src/data/pages/404.json is missing");
  return page;
}
