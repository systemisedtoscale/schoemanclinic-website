import type { MetadataRoute } from "next";
import { routablePages } from "@/lib/pages";

const ORIGIN = "https://theschoemanclinic.com";

export const dynamic = "force-static";

/** Every page except those the live site marks noindex. */
export default function sitemap(): MetadataRoute.Sitemap {
  return routablePages()
    .filter(
      (page) => !page.seo.some((t) => t.tag === "meta" && t.attrs.name === "robots" && /noindex/.test(t.attrs.content)),
    )
    .map((page) => ({ url: `${ORIGIN}${page.path}` }));
}
