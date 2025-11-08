import { cp, stat } from "node:fs/promises";
import { join } from "node:path";

// folders
const ANKI_MEDIA_DIR = join(
  process.env.HOME || "",
  ".local/share/Anki2/yym/collection.media",
);
await stat(ANKI_MEDIA_DIR);

// files to copy
const FILES = [
  "_kiku.js",
  "_kiku_lazy.js",
  "_kiku_shared.js",
  "_kiku_libs.js",
  "_kiku.css",
];

for (const file of FILES) {
  const src = join(import.meta.dirname, "../dist", file);
  await stat(src);
  const dest = join(ANKI_MEDIA_DIR, file);
  await cp(src, dest);
  console.log(`✅ Copied ${src} to ${dest}`);
}

const FONTS = [
  "_kiku_font_hina-mincho.woff2",
  "_kiku_font_klee-one.woff2",
  "_kiku_font_noto-sans-jp.woff2",
  "_kiku_font_noto-serif-jp.woff2",
  "_kiku_font_ibm-plex-sans-jp.woff2",
];

for (const file of FONTS) {
  const src = join(import.meta.dirname, "../.fonts", file);
  await stat(src);
  const dest = join(ANKI_MEDIA_DIR, file);
  await cp(src, dest);
  console.log(`✅ Copied ${src} to ${dest}`);
}

console.log("🎉 Done!");
