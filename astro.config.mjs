import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://theschoemanclinic.com",
  trailingSlash: "always",
  build: { format: "directory", inlineStylesheets: "never" },
  // The pages are the live site's own markup: leave it exactly as it is.
  compressHTML: false,
});
