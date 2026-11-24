import { inline } from "@/lib/inline";
import type { ThemeStyle, WordPressStyle } from "@/lib/pages";

const THEME = "/wp-content/themes/schoeman-clinic/assets";

/** The WordPress block styles a page uses, inline as WordPress printed them (src/inline/wordpress). */
export function WordPressStyles({ styles }: { styles: WordPressStyle[] }) {
  return (["wp-img-auto-sizes-contain", ...styles] as const).map((name) => (
    <style key={name} id={`${name}-inline-css`} dangerouslySetInnerHTML={{ __html: inline(`wordpress/${name}.css`) }} />
  ));
}

/** The theme's stylesheets: site.css (the compiled Tailwind build), custom.css, and the page's own. */
export function ThemeStyles({ styles }: { styles: ThemeStyle[] }) {
  return (["site", "custom", ...styles] as const).map((name) => (
    <link key={name} rel="stylesheet" id={`schoeman-${name}-css`} href={`${THEME}/${name}.css`} media="all" />
  ));
}
