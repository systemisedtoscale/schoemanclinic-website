// Screenshots every page on the live site and on the local build, at four widths, and reports the
// share of pixels that differ. Run the build first and serve it: `pnpm build && pnpm start -p 4329`.
//   node scripts/serve-reference.mjs 4330 &
//   node scripts/compare.mjs [local-origin] [only-path] [reference-origin]
// Motion is reduced on both sides (the site settles at once), videos and third-party frames are
// masked, and both pages are scrolled through so every block has been revealed.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";

const ROOT = new URL("..", import.meta.url).pathname;
// The reference is the downloaded copy (scripts/serve-reference.mjs), not the live server, which
// rate-limits repeated full-page loads. Pass the live origin as the third argument to use it instead.
const LOCAL = process.argv[2] ?? "http://127.0.0.1:4329";
const ONLY = process.argv[3] || undefined;
const LIVE = process.argv[4] ?? "http://127.0.0.1:4330";
const SIZES = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
];
const LIMIT = 0.01;

const pages = JSON.parse(await readFile(join(ROOT, "scrape/pages.json"), "utf8")).filter((p) => p !== "/404/" && (!ONLY || p === ONLY));
const OUT = join(ROOT, "compare");
await mkdir(join(OUT, "img"), { recursive: true });

const browser = await chromium.launch();

async function shoot(context, url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "load", timeout: 60000 });
  // The cookie choice is stored as rejected on both sides, so the banner does not cover the page.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
    document.querySelectorAll("video").forEach((v) => v.pause());
  });
  await page.addStyleTag({ content: "html{scroll-behavior:auto!important}*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} video,iframe{visibility:hidden!important}" });
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  // Some pages keep nudging the scroll position after load; retry a few times rather than fail.
  for (let i = 0; i < 10 && (await page.evaluate(() => window.scrollY)) !== 0; i++) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(500);
  const buffer = await page.screenshot({ fullPage: true });
  await page.close();
  return PNG.sync.read(buffer);
}

const rows = [];
for (const path of pages) {
  for (const [width, height] of SIZES) {
    const make = () =>
      browser.newContext({
        viewport: { width, height },
        reducedMotion: "reduce",
      });
    const [liveCtx, localCtx] = await Promise.all([make(), make()]);
    for (const [ctx, origin] of [[liveCtx, LIVE], [localCtx, LOCAL]]) {
      const host = new URL(origin).hostname;
      await ctx.addCookies([{ name: "cookieyes-consent", value: "consentid:x,consent:no,action:yes,necessary:yes,functional:no,analytics:no", domain: host, path: "/" }]);
    }
    let ratio = 1;
    let note = "";
    try {
      const [a, b] = await Promise.all([shoot(liveCtx, LIVE + path), shoot(localCtx, LOCAL + path)]);
      const h = Math.min(a.height, b.height);
      const crop = (img) => {
        const out = new PNG({ width, height: h });
        PNG.bitblt(img, out, 0, 0, width, h, 0, 0);
        return out;
      };
      const diff = new PNG({ width, height: h });
      const changed = pixelmatch(crop(a).data, crop(b).data, diff.data, width, h, { threshold: 0.15 });
      ratio = changed / (width * h);
      if (a.height !== b.height) note = `height ${a.height} live / ${b.height} local`;
      if (ratio > LIMIT || note) {
        const name = `${path.replace(/\W+/g, "_")}${width}`;
        await writeFile(join(OUT, "img", `${name}-diff.png`), PNG.sync.write(diff));
        await writeFile(join(OUT, "img", `${name}-live.png`), PNG.sync.write(a));
        await writeFile(join(OUT, "img", `${name}-local.png`), PNG.sync.write(b));
      }
    } catch (e) {
      note = `error: ${e.message.split("\n")[0]}`;
    }
    await Promise.all([liveCtx.close(), localCtx.close()]);
    rows.push({ path, width, ratio, note });
    console.log(`${path} ${width}px ${(ratio * 100).toFixed(2)}% ${note}`);
  }
}
await browser.close();

const bad = rows.filter((r) => r.ratio > LIMIT || r.note);
const html = `<!doctype html><meta charset="utf-8"><title>Live vs local</title><style>body{font:14px system-ui;margin:2rem}td,th{padding:.3rem .6rem;border-bottom:1px solid #ddd;text-align:left}</style>
<h1>Live vs local: ${bad.length} of ${rows.length} above ${LIMIT * 100}% or with a height change</h1>
<table><tr><th>Page</th><th>Width</th><th>Differs</th><th>Note</th><th>Images</th></tr>${rows
  .map((r) => {
    const name = `${r.path.replace(/\W+/g, "_")}${r.width}`;
    const flagged = r.ratio > LIMIT || r.note;
    return `<tr><td>${r.path}</td><td>${r.width}</td><td>${(r.ratio * 100).toFixed(2)}%</td><td>${r.note}</td><td>${flagged ? `<a href="img/${name}-diff.png">diff</a> <a href="img/${name}-live.png">live</a> <a href="img/${name}-local.png">local</a>` : ""}</td></tr>`;
  })
  .join("")}</table>`;
await writeFile(join(OUT, "report.html"), html);
console.log(`\n${bad.length} of ${rows.length} flagged. Report: compare/report.html`);
