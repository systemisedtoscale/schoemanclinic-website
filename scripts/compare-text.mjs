// Compares every built page with the live page as downloaded: visible text, and every link (text + href).
// Expected differences: the added Patient Login links.
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseHTML } from "linkedom";

const PORTAL = (await readFile(new URL("../src/config/links.ts", import.meta.url), "utf8")).match(/PORTAL_LOGIN_URL = "([^"]+)"/)[1];

const ROOT = new URL("..", import.meta.url).pathname;
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
for (const path of pages) {
  const slug = path === "/" ? "index" : path.replace(/^\/|\/$/g, "").replaceAll("/", "__");
  const live = read(await readFile(join(ROOT, "scrape/raw", `${slug}.html`), "utf8"));
  const built = read(await readFile(join(ROOT, "dist", path === "/404/" ? "404.html" : join(path, "index.html")), "utf8"));
  const extra = built.links.filter((l) => !live.links.includes(l) && !l.endsWith(`-> ${PORTAL}`));
  const missing = live.links.filter((l) => !built.links.includes(l));
  const text = built.text.replaceAll("Patient Login", "").replace(/\s+/g, " ");
  const liveText = live.text.replace(/\s+/g, " ");
  const problems = [];
  if (live.title !== built.title) problems.push(`title: ${live.title} / ${built.title}`);
  if (text !== liveText) problems.push("text differs");
  if (missing.length) problems.push(`missing links: ${missing.slice(0, 3).join(" | ")}`);
  if (extra.length) problems.push(`extra links: ${extra.slice(0, 3).join(" | ")}`);
  if (problems.length) {
    failures++;
    console.log(`${path}: ${problems.join("; ")}`);
  }
}
console.log(`${pages.length} pages compared, ${failures} with differences`);
process.exit(failures ? 1 : 0);
