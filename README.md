# The Schoeman Clinic website

A static rebuild of https://theschoemanclinic.com, made with Astro from the live WordPress site's own markup, styles and scripts. Every page keeps its address, text, links, images, animations and SEO tags. A **Patient Login** link to the Clinic Hub portal has been added.

## How it is built

| Path | What |
|---|---|
| `scripts/mirror.mjs` | Downloads every page in the live sitemaps (plus journal pagination and the 404) to `scrape/raw/`, and every file they use (theme CSS and JS, fonts, images, videos, the cookie banner plugin) to `public/` at the same paths. |
| `scripts/extract.mjs` | Turns each downloaded page into `src/data/pages/<slug>.json` (head, body classes, body). The header and footer, identical on every page, are taken out once. |
| `src/components/Header.html`, `Footer.html` | The shared header and footer. Edit these directly. `{{PORTAL_LOGIN_URL}}` is filled in at build time. |
| `src/layouts/Page.astro` | Puts a page together, and adds Patient Login to the mobile menu. |
| `src/pages/[...slug].astro`, `404.astro` | One page per data file, at the same address as the live site (trailing slashes kept). |
| `src/pages/sitemap.xml.ts`, `public/robots.txt`, `vercel.json` | Sitemap, robots file, and redirects from old WordPress addresses. |
| `src/config/links.ts` | The portal login address. Change it here when the portal moves to the clinic's domain. |
| `public/wp-content/` | The theme's `site.css`, `custom.css` and `site.js`, fonts and media, byte for byte as on the live site. |

The live theme is a frozen Tailwind build plus hand-written CSS and one vanilla script, so it is served as is: no Tailwind or JavaScript framework is compiled here.

## Commands

```bash
pnpm install
pnpm dev            # local site
pnpm build          # static site in dist/
pnpm preview        # serve dist/
pnpm mirror         # download the live site again (scrape/ and public/)
node scripts/extract.mjs        # rebuild src/data from scrape/raw
node scripts/compare-text.mjs   # every page's text, title and links against the download
node scripts/serve-reference.mjs 4330   # the downloaded pages, served locally
node scripts/compare.mjs http://127.0.0.1:4329   # screenshots of every page at 1440, 1024, 768 and 390px; report in compare/report.html
```

`compare.mjs` checks against the downloaded copy by default, because the live server blocks repeated full-page loads from one address.

## What differs from the live site

- **Patient Login**: a person icon beside search in the header (desktop), and a "Patient Login" link in the mobile menu and in the footer's Explore column. All go to `PORTAL_LOGIN_URL`.
- **No WordPress**: feeds, the REST API, oEmbed and admin are gone. Old sitemap and feed addresses redirect.
- **Cookie banner**: the CookieYes (Cookie Law Info) plugin's front end is kept as it is (GPL), so the banner, preferences and revisit button look and behave the same, and analytics still load only after consent. It makes no calls to WordPress.

## Editing content

Page content lives in `src/data/pages/*.json` as the live markup. Small text changes can be made there. To add a journal article, copy an existing article's JSON, change the path, head and body, and add a card for it on `journal.json` and the home page. Moving articles into Markdown is a possible next step.

## Deploying

Vercel, as a static Astro site (build `pnpm build`, output `dist`). Point `theschoemanclinic.com` at it only when the clinic is ready to switch off WordPress. Third-party forms (LeadConnector), bookings (LeadConnector, Semble), Typeform and Google Maps are embedded with their original IDs.

## Missing assets

None: every file the pages reference was downloaded (`scrape/missing-assets.txt` is empty).
