// Turns the downloaded pages (scrape/raw) into the site's data:
//   src/data/pages/<slug>.json  head, body classes and body of each page, with the shared header and
//                               footer replaced by markers
//   scrape/shared/Header.html, Footer.html   the shared header and footer (checked identical on every page)
// Links and files on the live domain become root-relative so the site works on any domain; the SEO
// tags (canonical, Open Graph, JSON-LD) keep the real domain.
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { parseHTML } from "linkedom";

const ROOT = new URL("..", import.meta.url).pathname;
const RAW = join(ROOT, "scrape/raw");
const OUT = join(ROOT, "src/data/pages");

const HEADER_MARK = "<!--SC:HEADER-->";
const FOOTER_MARK = "<!--SC:FOOTER-->";

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

    await writeFile(join(OUT, `${slug}.json`), JSON.stringify({ path: slugToPath.get(slug) ?? `/${slug}/`, lang, bodyClass, head, body }));
  }
  // The live header and footer, for comparison. src/components/Header.html and Footer.html are the
  // site's own copies (with the portal login added); they are created from these only the first time.
  await mkdir(join(ROOT, "scrape/shared"), { recursive: true });
  await writeFile(join(ROOT, "scrape/shared/Header.html"), header + "\n");
  await writeFile(join(ROOT, "scrape/shared/Footer.html"), footer + "\n");
  await mkdir(join(ROOT, "src/components"), { recursive: true });
  for (const [name, html] of [["Header.html", header], ["Footer.html", footer]]) {
    try {
      await readFile(join(ROOT, "src/components", name));
    } catch {
      await writeFile(join(ROOT, "src/components", name), html + "\n");
    }
  }
  console.log(`${files.length} pages extracted`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
