const THEME = "/wp-content/themes/schoeman-clinic/assets";

/** Favicons and the logo preload, at the top of every page's <head>. */
export function SiteIcons() {
  return (
    <>
      <link rel="icon" type="image/svg+xml" href={`${THEME}/favicon.svg`} />
      <link rel="icon" type="image/png" sizes="32x32" href={`${THEME}/favicon-192.png`} />
      <link rel="icon" type="image/png" sizes="192x192" href={`${THEME}/favicon-192.png`} />
      <link rel="shortcut icon" type="image/x-icon" href={`${THEME}/favicon.ico`} />
      <link rel="apple-touch-icon" sizes="180x180" href={`${THEME}/apple-touch-icon.png`} />
      <link rel="preload" as="image" href={`${THEME}/Logo.avif`} />
    </>
  );
}

/** The site icon WordPress prints at the end of the <head>. */
export function AppIcons() {
  return (
    <>
      <link rel="icon" href="/wp-content/uploads/2026/08/site-icon-512-150x150.png" sizes="32x32" />
      <link rel="icon" href="/wp-content/uploads/2026/08/site-icon-512-300x300.png" sizes="192x192" />
      <link rel="apple-touch-icon" href="/wp-content/uploads/2026/08/site-icon-512-300x300.png" />
      <meta name="msapplication-TileImage" content="/wp-content/uploads/2026/08/site-icon-512-300x300.png" />
    </>
  );
}
