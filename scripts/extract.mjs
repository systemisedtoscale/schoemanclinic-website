// Turns the downloaded pages (scrape/raw) into the site's data:
//   src/data/pages/<slug>.json  each page's SEO tags, the styles and scripts it loads, and its <main>
//                               (see scripts/lib/page-shape.mjs; the rest is in src/components)
//   scrape/shared/Header.html, Footer.html   the live header and footer (checked identical on every page),
//                               to compare with src/components/layout/Header.tsx and Footer.tsx
// It overwrites src/data/pages: edits made there since are lost.
// Links and files on the live domain become root-relative so the site works on any domain; the SEO
// tags (canonical, Open Graph, JSON-LD) keep the real domain.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseHTML } from "linkedom";
import { shapePage } from "./lib/page-shape.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const RAW = join(ROOT, "scrape/raw");
const OUT = join(ROOT, "src/data/pages");

const HEADER_MARK = "<!--SC:HEADER-->";
const FOOTER_MARK = "<!--SC:FOOTER-->";

// Mistakes in the live markup, put right here. diagnostics: a stray </div> in #conditions closes <main>
// and the page shell early, so the browser pulls the sections after it and the footer out of both.
const FIXES = {
  diagnostics: [['</div></section>\n\n<section id="fees"', '</section>\n\n<section id="fees"']],
};

function relative(text) {
  return text
    .replace(/https?:(\\?\/)\1theschoemanclinic\.com(?=[\\/"'?#<\s]|$)/g, "")
    .replace(/((?:href|action)=["'])(["'])/g, "$1/$2")
    .replace(/(\.(?:css|js|avif|webp|png|jpe?g|gif|svg|ico|webm|mp4|woff2?))\?(?:ver|v)=[0-9.]+/g, "$1");
}

// What the static site keeps from the WordPress <head>.
function keepHead(node) {
  const tag = node.tagName?.toLowerCase();
  if (!tag) return false;
  if (tag === "title" || tag === "style") return true;
  if (tag === "meta") {
    const name = node.getAttribute("name") ?? node.getAttribute("property") ?? "";
    return node.hasAttribute("charset") || !/^generator$/i.test(name);
  }
  if (tag === "link") {
    const rel = (node.getAttribute("rel") ?? "").toLowerCase();
    if (rel === "alternate" || rel === "https://api.w.org/" || rel === "edituri" || rel === "shortlink" || rel === "dns-prefetch") return false;
    return true;
  }
  if (tag === "script") {
    const type = node.getAttribute("type") ?? "";
    if (type === "speculationrules") return false;
    if ((node.getAttribute("src") ?? "").includes("wp-emoji")) return false;
    return true;
  }
  return false;
}

function isSeo(node) {
  const tag = node.tagName.toLowerCase();
  if (tag === "link") return (node.getAttribute("rel") ?? "").toLowerCase() === "canonical";
  if (tag === "meta") return /^(og:|twitter:|article:)/.test(node.getAttribute("property") ?? node.getAttribute("name") ?? "");
  if (tag === "script") return node.getAttribute("type") === "application/ld+json";
  return false;
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const files = (await readdir(RAW)).filter((f) => f.endsWith(".html"));
  const paths = JSON.parse(await readFile(join(ROOT, "scrape/pages.json"), "utf8"));
  const slugToPath = new Map(paths.map((p) => [p === "/" ? "index" : p.replace(/^\/|\/$/g, "").replaceAll("/", "__"), p]));
  slugToPath.set("404", "/404/");
  let header = null;
  let footer = null;

  for (const file of files) {
    const slug = file.replace(/\.html$/, "");
    const raw = await readFile(join(RAW, file), "utf8");
    const headHtml = raw.slice(raw.indexOf("<head"), raw.indexOf("</head>") + 7);
    const { document } = parseHTML(`<!doctype html><html>${headHtml}<body></body></html>`);
    const head = [...document.head.children]
      .filter(keepHead)
      .map((n) => (isSeo(n) ? n.outerHTML : relative(n.outerHTML)))
      .join("\n");

    const lang = (raw.match(/<html[^>]*\blang="([^"]+)"/) ?? [])[1] ?? "en-GB";
    const bodyOpen = raw.match(/<body([^>]*)>/);
    const bodyClass = (bodyOpen[1].match(/class="([^"]*)"/) ?? [])[1] ?? "";
    let body = relative(raw.slice(bodyOpen.index + bodyOpen[0].length, raw.lastIndexOf("</body>")));
    body = body.replace(/<script type="speculationrules">[\s\S]*?<\/script>\s*/g, "");

    const h = body.match(/<header[\s\S]*?<\/header>/);
    const fIndex = body.lastIndexOf("<footer");
    const f = fIndex >= 0 ? body.slice(fIndex).match(/^<footer[\s\S]*?<\/footer>/) : null;
    if (!h || !f) throw new Error(`${slug}: no header or footer`);
    if (header !== null && header !== h[0]) throw new Error(`${slug}: header differs`);
    if (footer !== null && footer !== f[0]) throw new Error(`${slug}: footer differs`);
    header = h[0];
    footer = f[0];
    body = body.slice(0, fIndex) + FOOTER_MARK + body.slice(fIndex + f[0].length);
    body = body.replace(h[0], HEADER_MARK);
    for (const [from, to] of FIXES[slug] ?? []) {
      if (!body.includes(from)) throw new Error(`${slug}: the fix for ${from.slice(0, 40)} no longer applies`);
      body = body.replace(from, to);
    }

    const page = shapePage({ path: slugToPath.get(slug) ?? `/${slug}/`, lang, bodyClass, head, body });
    await writeFile(join(OUT, `${slug}.json`), JSON.stringify(page, null, 2) + "\n");
  }
  // The live header and footer, for comparison with the components.
  await mkdir(join(ROOT, "scrape/shared"), { recursive: true });
  await writeFile(join(ROOT, "scrape/shared/Header.html"), header + "\n");
  await writeFile(join(ROOT, "scrape/shared/Footer.html"), footer + "\n");
  console.log(`${files.length} pages extracted`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
