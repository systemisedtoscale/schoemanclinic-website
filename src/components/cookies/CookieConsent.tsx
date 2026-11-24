import { inline } from "@/lib/inline";

/**
 * The CookieYes (Cookie Law Info) banner: its settings and styles, in the <head> as WordPress printed
 * them. Its script runs from ThemeScripts, once React has hydrated the page (it inserts the banner at the
 * top of <body>), and builds the banner from CookieBannerTemplate.
 */
export function CookieConsentHead() {
  return (
    <>
      <script id="cookie-law-info-js-extra" dangerouslySetInnerHTML={{ __html: inline("cookie-law-info-config.js") }} />
      <style id="cky-style-inline" dangerouslySetInnerHTML={{ __html: inline("cookie-banner.css") }} />
    </>
  );
}

/** The banner's markup, which the CookieYes script reads and inserts. */
export function CookieBannerTemplate() {
  return (
    <script
      id="ckyBannerTemplate"
      type="text/template"
      dangerouslySetInnerHTML={{ __html: inline("cookie-banner-template.html") }}
    />
  );
}
