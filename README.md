# The Schoeman Clinic website

A rebuild of https://theschoemanclinic.com in Next.js (App Router, React, TypeScript), made from the live WordPress site's own markup, styles and scripts. Every page keeps its address, text, links, images, animations and SEO tags, and is pre-rendered as static HTML. A **Patient Login** link to the Clinic Hub portal has been added.

## How it is built

| Path | What |
|---|---|
| `src/app/[[...slug]]/layout.tsx`, `page.tsx` | One static page per file in `src/data/pages`, at the live site's address (trailing slashes kept). The root layout sits under the catch-all route because each page brings its own `<head>` and `<body>` classes. |
| `src/app/global-not-found.tsx` | The 404 page, for every unknown address. |
| `src/app/sitemap.ts`, `public/robots.txt`, `next.config.ts` | Sitemap, robots file, and redirects from old WordPress addresses. |
| `src/components/PageDocument.tsx` | Puts a page together: its `<head>`, and the shell every page shares around its content. |
| `src/components/layout/` | `Header`, `Footer`, `MobileMenu`, `SearchOverlay`, `VideoModal`, `Preloader` (home page only). |
| `src/components/head/` | Favicons, the page's SEO tags, analytics, and the WordPress and theme stylesheets. |
| `src/components/cookies/CookieConsent.tsx` | The CookieYes banner's settings, styles and template. |
| `src/components/scripts/` | `ThemeScripts` loads the cookie banner script, `site.js` and the page's own scripts. `SearchCatalog` is the list the search suggests from. |
| `src/data/pages/<slug>.json` | Each page: its SEO tags, which WordPress and theme styles and scripts it loads, and the markup of its `<main>`. |
| `src/data/search-catalog.json` | The pages and text the search dialog suggests. |
| `src/inline/` | Scripts and styles printed inline in the `<head>`, byte for byte as WordPress printed them. |
| `src/config/links.ts` | The portal login address. Change it here when the portal moves to the clinic's domain. |
| `public/wp-content/` | The theme's `site.css`, `custom.css`, `site.js` and page scripts, fonts and media, byte for byte as on the live site. |

The live theme is a frozen Tailwind build (`site.css`) plus hand-written CSS (`custom.css`) and vanilla scripts, so those are served as they are: no Tailwind is compiled here yet.

### The theme scripts and React

`site.js` and the cookie banner change the page's markup (they add the footer accordions, the custom selects, the banner). They run from `ThemeScripts` once React has hydrated the page: run any earlier, and React finds markup it did not render and replaces the page. Links are plain `<a>` tags, so every page is a full page load, as on the live site.

## Commands

```bash
pnpm install
pnpm dev            # local site on http://localhost:3000
pnpm build          # static pages in .next/
pnpm start          # serve the build
pnpm typecheck
pnpm format         # Prettier
```

Checking the site against the live one (with `pnpm build && pnpm start -p 4329` running):

```bash
node scripts/compare-text.mjs   # every page's title, text and links against the download
node scripts/check-runtime.mjs  # every page in a browser: no console or hydration errors, banner, menu, footer
node scripts/serve-reference.mjs 4330   # the downloaded pages, served locally
node scripts/compare.mjs http://127.0.0.1:4329   # screenshots at 1440, 1024, 768 and 390px; report in compare/report.html
```

`compare.mjs` checks against the downloaded copy by default, because the live server blocks repeated full-page loads from one address. The first time, install its browser with `npx playwright install chromium`.

Downloading the live site again:

```bash
pnpm mirror                 # pages to scrape/raw, files to public/
node scripts/extract.mjs    # rebuild src/data/pages from scrape/raw (overwrites edits made there)
```

## What differs from the live site

- **Patient Login**: a person icon beside search in the header (desktop), and a "Patient Login" link in the mobile menu and in the footer's Explore column. All go to `PORTAL_LOGIN_URL`.
- **No WordPress**: feeds, the REST API, oEmbed and admin are gone. Old sitemap and feed addresses redirect.
- **Cookie banner**: the CookieYes (Cookie Law Info) plugin's front end is kept as it is (GPL), so the banner, preferences and revisit button look and behave the same, and analytics still load only after consent. It makes no calls to WordPress.
- **Diagnostics page**: a stray `</div>` in the live markup closed the page's `<main>` early; it is fixed here (see `FIXES` in `scripts/extract.mjs`).

## Editing content

Page content lives in `src/data/pages/*.json`: the SEO tags and the markup of `<main>`. Small text changes can be made there. To add a journal article, copy an existing article's JSON, change the path, SEO tags and markup, and add a card for it on `journal.json` and the home page. The header, footer and menus are React components in `src/components/layout`.

Next steps: turn the page sections into React components with Tailwind compiled from source, and move journal articles into MDX.

## Deploying

Vercel, as a Next.js project (build `pnpm build`). `vercel.json` sets the framework to Next.js, because the Vercel project was first set up for the Astro build (output `dist`); once this is on `main`, set the project's Framework Preset to Next.js and clear any Output Directory override in Project Settings → Build and Deployment. Vercel Web Analytics and Speed Insights are in the page (`PageDocument`); turn both on in the project's Analytics and Speed Insights tabs on Vercel, or they collect nothing. They use no cookies, so they run without consent, unlike Google Analytics and the Meta pixel. Point `theschoemanclinic.com` at it only when the clinic is ready to switch off WordPress. Third-party forms (LeadConnector), bookings (LeadConnector, Semble), Typeform and Google Maps are embedded with their original IDs.

## Missing assets

None: every file the pages reference was downloaded (`scrape/missing-assets.txt` is empty).
