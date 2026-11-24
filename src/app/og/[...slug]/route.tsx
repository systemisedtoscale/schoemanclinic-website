import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE, ogEyebrow, ogImagePath, ogImageSlug, ogTitle } from "@/lib/og";
import { routablePages, type PageData } from "@/lib/pages";

/**
 * Each page's share image (Open Graph and Twitter), 1200×630 PNG, made at build time: the clinic's
 * logo, the part of the site, and the page's title, in the site's own type and colours.
 */

export const dynamicParams = false;

export function generateStaticParams() {
  return routablePages().map((page) => ({ slug: ogImageSlug(page) }));
}

// next/og reads TTF, OTF and WOFF (not the theme's WOFF2), and PNG (not its AVIF logo). Each face comes
// in two subsets, Latin and Latin Extended (names such as Turlică); the second has its own name, as the
// fallback in fontFamily. The paths are literal so the build
// bundles only these files.
const font = (name: string, data: Buffer) => ({ name, data, weight: 500 as const });
const FONTS = [
  font(
    "Cormorant Garamond",
    fs.readFileSync(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff",
      ),
    ),
  ),
  font(
    "Cormorant Garamond Ext",
    fs.readFileSync(
      path.join(
        process.cwd(),
        "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-ext-500-normal.woff",
      ),
    ),
  ),
  font(
    "Inter",
    fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-500-normal.woff")),
  ),
  font(
    "Inter Ext",
    fs.readFileSync(path.join(process.cwd(), "node_modules/@fontsource/inter/files/inter-latin-ext-500-normal.woff")),
  ),
];
const LOGO = `data:image/png;base64,${fs.readFileSync(path.join(process.cwd(), "src/og/logo.png")).toString("base64")}`;

// The theme's colours (site.css): --background, --foreground, --bronze, --muted-foreground.
const COLOURS = { background: "#f8f6f2", foreground: "#221f1a", bronze: "#9a7c5b", muted: "#5f5953" };

function findPage(slug: string[]): PageData | undefined {
  const wanted = `/og/${slug.join("/")}`;
  return routablePages().find((page) => ogImagePath(page) === wanted);
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const page = findPage((await params).slug);
  if (!page) return new Response("Not found", { status: 404 });
  // "Name | Role" (the specialists' pages): the name as the title, the role under it.
  const [title, subtitle] = ogTitle(page).split(" | ");
  const size = title.length > 70 ? 58 : title.length > 45 ? 68 : 80;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 84px 64px",
        background: COLOURS.background,
        color: COLOURS.foreground,
        fontFamily: "Inter, Inter Ext",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} width={187} height={80} alt="" />
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontSize: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: COLOURS.bronze,
            marginBottom: 28,
          }}
        >
          {ogEyebrow(page)}
        </div>
        <div
          style={{
            fontFamily: "Cormorant Garamond, Cormorant Garamond Ext",
            fontSize: size,
            lineHeight: 1.08,
            letterSpacing: -1,
            maxWidth: 980,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div
            style={{
              fontFamily: "Cormorant Garamond, Cormorant Garamond Ext",
              fontSize: 40,
              color: COLOURS.muted,
              marginTop: 14,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `1px solid ${COLOURS.bronze}`,
          paddingTop: 24,
          fontSize: 17,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLOURS.muted,
        }}
      >
        <span>Harley Street · Wimbledon · Online</span>
        <span>theschoemanclinic.com</span>
      </div>
    </div>,
    { ...OG_SIZE, fonts: FONTS },
  );
}
