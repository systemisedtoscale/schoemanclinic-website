/**
 * LeadConnector's form embed script, which sizes the enquiry form's iframe to its content. It listens
 * for the iframe's load event, so unlike the theme scripts it must be in the server-rendered HTML,
 * where it runs before the iframe has loaded. It only touches the iframe, inside <main>, which React
 * never changes.
 */
export function LeadConnectorForm() {
  return <script id="schoeman-ghl-form-js" src="https://link.msgsndr.com/js/form_embed.js" />;
}
