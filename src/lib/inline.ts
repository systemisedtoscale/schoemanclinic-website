import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "src/inline");
const cache = new Map<string, string>();

/** A snippet the pages print inline (a script, a stylesheet, a template), from src/inline. */
export function inline(name: string): string {
  let text = cache.get(name);
  if (text === undefined) {
    text = fs.readFileSync(path.join(DIR, name), "utf8");
    cache.set(name, text);
  }
  return text;
}
