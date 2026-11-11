// Downloads every page of the live site and every file those pages use, verbatim.
//   scrape/raw/<slug>.html   each page as served
//   public/<path>            every theme, upload and plugin file, at its own path
// Run again at any time to pick up changes on the live site.
import { mkdir, writeFile, readFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";

const ORIGIN = "https://theschoemanclinic.com";
const ROOT = new URL("..", import.meta.url).pathname;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36";

export const slugFor = (path) => (path === "/" ? "index" : path.replace(/^\/|\/$/g, "").replaceAll("/", "__"));

async function get(url, binary = false) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (!res.ok) throw new Error(`${res.status}`);
      return binary ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (e) {
      if (attempt === 3) throw new Error(`${url}: ${e.message}`);
      await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
}

async function exists(p) {
  try { await access(p); return true; } catch { return false; }
}

async function pageUrls() {
  const paths = new Set();
  for (const map of ["page-sitemap.xml", "post-sitemap.xml", "team-sitemap.xml"]) {
    const xml = await get(`${ORIGIN}/${map}`);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) paths.add(new URL(m[1]).pathname);
  }
  return paths;
}

// Every file on the site's own domain that a page or stylesheet points at.
const ASSET = /https?:\/\/theschoemanclinic\.com(\/wp-(?:content|includes)\/[^"'\s)<>,]+?\.(?:css|js|avif|webp|png|jpe?g|gif|svg|ico|webm|mp4|woff2?|ttf|otf|pdf|json))(?:\?[^"'\s)<>]*)?(?=["'\s)<>,])/gi;

function assetsIn(text) {
  const found = new Set();
  // JSON inside pages escapes slashes.
  for (const m of text.replaceAll("\\/", "/").matchAll(ASSET)) found.add(m[1]);
  return found;
}

async function main() {
  const paths = await pageUrls();
  const pages = new Map();
  const queue = [...paths];
  while (queue.length) {
    const path = queue.shift();
    if (pages.has(path)) continue;
    const html = await get(ORIGIN + path);
    pages.set(path, html);
    // Paginated journal pages are not in the sitemap.
    for (const m of html.matchAll(/https:\/\/theschoemanclinic\.com(\/journal\/page\/\d+\/)/g)) if (!pages.has(m[1])) queue.push(m[1]);
    process.stdout.write(".");
  }
  console.log(`\n${pages.size} pages`);
  // The not-found page, for its markup.
  try {
    const res = await fetch(`${ORIGIN}/this-page-does-not-exist-404/`, { headers: { "User-Agent": UA } });
    pages.set("/404/", await res.text());
  } catch {}

  await mkdir(join(ROOT, "scrape/raw"), { recursive: true });
  const assets = new Set();
  for (const [path, html] of pages) {
    await writeFile(join(ROOT, "scrape/raw", `${slugFor(path)}.html`), html);
    for (const a of assetsIn(html)) assets.add(a);
  }
  await writeFile(join(ROOT, "scrape/pages.json"), JSON.stringify([...pages.keys()].sort(), null, 2));

  // Download, then follow url() references inside stylesheets (fonts, background images).
  const done = new Set();
  const missing = [];
  const pending = [...assets];
  while (pending.length) {
    const path = pending.shift();
    if (done.has(path)) continue;
    done.add(path);
    const target = join(ROOT, "public", decodeURIComponent(path));
    try {
      if (!(await exists(target))) {
        const body = await get(ORIGIN + path, true);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, body);
      }
      if (path.endsWith(".css")) {
        const css = await readFile(target, "utf8");
        for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) {
          if (m[1].startsWith("data:")) continue;
          const abs = new URL(m[1], ORIGIN + path);
          if (abs.origin === ORIGIN) pending.push(abs.pathname);
        }
      }
    } catch (e) {
      missing.push(`${path} (${e.message})`);
    }
  }
  await writeFile(join(ROOT, "scrape/missing-assets.txt"), missing.join("\n"));
  console.log(`${done.size} files, ${missing.length} missing`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
