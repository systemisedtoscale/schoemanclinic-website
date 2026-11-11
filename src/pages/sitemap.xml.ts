import type { APIRoute } from "astro";

type PageData = { path: string; head: string };
const pages = import.meta.glob<PageData>("../data/pages/*.json", { eager: true, import: "default" });

/** Every page except the 404 and pages the live site marks noindex. */
export const GET: APIRoute = ({ site }) => {
  const origin = (site?.toString() ?? "https://theschoemanclinic.com/").replace(/\/$/, "");
  const urls = Object.values(pages)
    .filter((p) => p.path !== "/404/" && !/<meta name=["']robots["'][^>]*noindex/i.test(p.head))
    .map((p) => p.path)
    .sort();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${origin}${u}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
