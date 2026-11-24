// Compares every page of the running site with the live page as downloaded: title, visible text, and
// every link (text + href). Expected differences: the added Patient Login links.
//   pnpm build && pnpm start -p 4329
//   node scripts/compare-text.mjs [origin]
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseHTML } from "linkedom";

const PORTAL = (await readFile(new URL("../src/config/links.ts", import.meta.url), "utf8")).match(/PORTAL_LOGIN_URL = "([^"]+)"/)[1];

const ROOT = new URL("..", import.meta.url).pathname;
const ORIGIN = process.argv[2] ?? "http://127.0.0.1:4329";
const pages = JSON.parse(await readFile(join(ROOT, "scrape/pages.json"), "utf8"));
const norm = (u) => u.replace(/^https?:\/\/theschoemanclinic\.com/, "").replace(/\?(ver|v)=[0-9.]+/, "") || "/";

function read(html) {
  const { document } = parseHTML(html);
  document.querySelectorAll("script,style,noscript,template").forEach((n) => n.remove());
  const text = document.body.textContent.replace(/\s+/g, " ").trim();
  const links = [...document.querySelectorAll("a[href]")].map((a) => `${a.textContent.replace(/\s+/g, " ").trim()} -> ${norm(a.getAttribute("href"))}`);
  const title = document.querySelector("title")?.textContent ?? "";
  return { text, links, title };
}

let failures = 0;
const spacing = [];
for (const path of pages) {
  const slug = path === "/" ? "index" : path.replace(/^\/|\/$/g, "").replaceAll("/", "__");
  const live = read(await readFile(join(ROOT, "scrape/raw", `${slug}.html`), "utf8"));
  const built = read(await (await fetch(ORIGIN + path)).text());
  const extra = built.links.filter((l) => !live.links.includes(l) && !l.endsWith(`-> ${PORTAL}`));
  const missing = live.links.filter((l) => !built.links.includes(l));
  const text = built.text.replaceAll("Patient Login", "").replace(/\s+/g, " ");
  const liveText = live.text.replace(/\s+/g, " ");
  const problems = [];
  if (live.title !== built.title) problems.push(`title: ${live.title} / ${built.title}`);
  // Whitespace between block elements (say, between </main> and <footer>) is not shown, so a difference
  // only in spaces is reported apart and does not fail.
  if (text !== liveText && text.replace(/\s/g, "") === liveText.replace(/\s/g, "")) spacing.push(path);
  else if (text !== liveText) problems.push("text differs");
  if (missing.length) problems.push(`missing links: ${missing.slice(0, 3).join(" | ")}`);
  if (extra.length) problems.push(`extra links: ${extra.slice(0, 3).join(" | ")}`);
  if (problems.length) {
    failures++;
    console.log(`${path}: ${problems.join("; ")}`);
  }
}
if (spacing.length) console.log(`${spacing.length} pages differ only in whitespace between elements`);
console.log(`${pages.length} pages compared, ${failures} with differences`);
process.exit(failures ? 1 : 0);
