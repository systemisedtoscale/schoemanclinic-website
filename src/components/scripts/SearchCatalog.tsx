import catalog from "@/data/search-catalog.json";

// "<" is escaped so no page text can close the <script>.
const source = `var schoemanSearch = ${JSON.stringify(catalog).replace(/</g, "\\u003c")};`;

/** The pages the search dialog suggests (window.schoemanSearch, read by site.js). */
export function SearchCatalog() {
  return <script id="schoeman-site-js-extra" dangerouslySetInnerHTML={{ __html: source }} />;
}
