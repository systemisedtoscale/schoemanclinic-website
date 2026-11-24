// Loads every page of the running site in a browser and checks that it works, not just that it looks
// right: no console errors (a React hydration error would show here), the cookie banner and the theme
// scripts ran, and on a phone-sized screen the menu opens and the footer columns fold.
//   pnpm build && pnpm start -p 4329
//   node scripts/check-runtime.mjs [origin]
import { readFile } from "node:fs/promises";
import { chromium } from "playwright";

const ORIGIN = process.argv[2] ?? "http://127.0.0.1:4329";
const pages = JSON.parse(await readFile(new URL("../scrape/pages.json", import.meta.url), "utf8"));
// Third-party embeds (forms, maps, analytics) may log errors of their own when blocked or offline.
const IGNORE = /msgsndr|leadconnector|typeform|google|facebook|semble|ERR_|Failed to load resource/i;

const browser = await chromium.launch();
let failures = 0;
async function check(path) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !IGNORE.test(m.text()) && errors.push(m.text()));
  // /_vercel/ (Web Analytics, Speed Insights) is served only on Vercel deployments.
  page.on("response", (r) => r.url().startsWith(ORIGIN) && r.status() >= 400 && r.url() !== ORIGIN + path && !r.url().startsWith(`${ORIGIN}/_vercel/`) && errors.push(`${r.status()} ${r.url()}`));
  // Not "load": the hero video and third-party embeds can hold it back for a long time.
  await page.goto(ORIGIN + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2000);

  const state = await page.evaluate(() => ({
    banner: !!document.querySelector(".cky-consent-container"),
    siteJs: !!document.querySelector(".tsc-foot__toggle"),
  }));
  const problems = [...errors];
  if (!state.banner) problems.push("no cookie banner");
  if (!state.siteJs) problems.push("site.js did not run (no footer accordions)");

  // The menu: accept nothing, close the banner, open the menu.
  await page.locator(".cky-btn-reject").first().click({ timeout: 2000 }).catch(() => {});
  const opener = page.locator('header button[aria-label="Menu"]').first();
  if (await opener.count()) {
    await opener.click({ timeout: 3000 }).catch(() => {});
    await page.waitForTimeout(400);
    if (!(await page.locator("#tsc-menu.is-open").count())) problems.push("menu did not open");
  } else problems.push("menu button not found");

  if (problems.length) {
    failures++;
    console.log(`${path}: ${problems.join(" | ").slice(0, 400)}`);
  }
  await context.close();
}
// A few pages at a time.
const queue = [...pages];
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) await check(queue.shift());
}));
await browser.close();
console.log(`${pages.length} pages checked, ${failures} with problems`);
process.exit(failures ? 1 : 0);
