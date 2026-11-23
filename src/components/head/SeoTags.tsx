import type { SeoTag } from "@/lib/pages";

const PROP: Record<string, string> = {
  class: "className",
  "http-equiv": "httpEquiv",
  hreflang: "hrefLang",
  crossorigin: "crossOrigin",
};
const props = (attrs: Record<string, string>) =>
  Object.fromEntries(Object.entries(attrs).map(([name, value]) => [PROP[name] ?? name, value]));

/** A page's SEO block, as the live site printed it: title, meta, canonical and pagination links, JSON-LD. */
export function SeoTags({ tags }: { tags: SeoTag[] }) {
  return tags.map(({ tag, attrs, text }, i) => {
    switch (tag) {
      case "title":
        return <title key={i}>{text}</title>;
      case "meta":
        return <meta key={i} {...props(attrs)} />;
      case "link":
        return <link key={i} {...props(attrs)} />;
      case "script":
        return <script key={i} {...props(attrs)} dangerouslySetInnerHTML={{ __html: text ?? "" }} />;
    }
  });
}
