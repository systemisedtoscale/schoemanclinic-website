// Serves the pages exactly as downloaded from the live site (scrape/raw), with the live domain pointed
// here, so the build can be compared without loading the live server again and again.
//   node scripts/serve-reference.mjs [port]
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PORT = Number(process.argv[2] ?? 4330);
const TYPES = { ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".avif": "image/avif", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".ico": "image/x-icon", ".webm": "video/webm", ".mp4": "video/mp4", ".woff2": "font/woff2", ".woff": "font/woff", ".json": "application/json", ".pdf": "application/pdf" };

createServer(async (req, res) => {
  const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  try {
    if (extname(path)) {
      const file = join(ROOT, "public", normalize(path));
      res.writeHead(200, { "Content-Type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream" });
      res.end(await readFile(file));
      return;
    }
    const slug = path === "/" ? "index" : path.replace(/^\/|\/$/g, "").replaceAll("/", "__");
    const html = (await readFile(join(ROOT, "scrape/raw", `${slug}.html`), "utf8")).replace(/https?:(\\?\/)\1theschoemanclinic\.com/g, `http:$1$1127.0.0.1:${PORT}`);
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(PORT, "127.0.0.1", () => console.log(`Reference on http://127.0.0.1:${PORT}`));
