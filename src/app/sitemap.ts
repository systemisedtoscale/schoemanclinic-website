import type { MetadataRoute } from "next";
import { SITE_ORIGIN } from "@/lib/og";
import { routablePages, type PageData } from "@/lib/pages";

export const dynamic = "force-static";

/** When a page last changed: its article:modified_time, or the dateModified in its JSON-LD. */
function lastModified(page: PageData): string | undefined {
  const meta = page.seo.find((t) => t.tag === "meta" && t.attrs.property === "article:modified_time");
  if (meta) return meta.attrs.content;
  for (const tag of page.seo) {
    if (tag.tag !== "script" || !tag.text) continue;
    try {
      const json = JSON.parse(tag.text);
      const nodes: Record<string, unknown>[] = json["@graph"] ?? [json];
      const node = nodes.find((n) => typeof n.dateModified === "string" && n["@id"] === `${SITE_ORIGIN}${page.path}`);
      if (node) return node.dateModified as string;
    } catch {
      // Not JSON-LD we can read: no date.
    }
  }
  return undefined;
}

/** Every page except those the live site marks noindex, with the date each last changed. */
export default function sitemap(): MetadataRoute.Sitemap {
  return routablePages()
    .filter(
      (page) => !page.seo.some((t) => t.tag === "meta" && t.attrs.name === "robots" && /noindex/.test(t.attrs.content)),
    )
    .map((page) => {
      const date = lastModified(page);
      return { url: `${SITE_ORIGIN}${page.path}`, ...(date ? { lastModified: date } : {}) };
    });
}
