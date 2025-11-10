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
  "_kiku.css",
  "_kiku.js",
  "_kiku_lazy.js",
  "_kiku_libs.js",
  "_kiku_shared.js",
  "_kiku_worker.js",
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
  "_kiku_font_ibm-plex-sans-jp.woff2",
];

const DBS = [
  "_kiku_db_similar_kanji_from_keisei.json",
  "_kiku_db_similar_kanji_lookup.json",
  "_kiku_db_similar_kanji_manual.json",
  "_kiku_db_similar_kanji_old_script.json",
  "_kiku_db_similar_kanji_stroke_edit_dist.json",
  "_kiku_db_similar_kanji_wk_niai_noto.json",
  "_kiku_db_similar_kanji_yl_radical.json",
];

for (const file of FONTS) {
  const src = join(import.meta.dirname, "../.fonts", file);
  await stat(src);
  const dest = join(ANKI_MEDIA_DIR, file);
  await cp(src, dest);
  console.log(`✅ Copied ${src} to ${dest}`);
}

for (const file of DBS) {
  const src = join(import.meta.dirname, "../.db", file);
  await stat(src);
  const dest = join(ANKI_MEDIA_DIR, file);
  await cp(src, dest);
  console.log(`✅ Copied ${src} to ${dest}`);
}

console.log("🎉 Done!");
