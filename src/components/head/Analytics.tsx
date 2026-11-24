import { inline } from "@/lib/inline";

/**
 * Google Tag Manager, GA4 and the Meta pixel. Nothing loads until the visitor accepts analytics in the
 * cookie banner (src/inline/analytics.js listens for CookieYes consent).
 */
export function Analytics() {
  return <script id="schoeman-analytics" dangerouslySetInnerHTML={{ __html: inline("analytics.js") }} />;
}
