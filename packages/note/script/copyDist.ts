import { cp, stat } from "node:fs/promises";
import { join } from "node:path";

// folders

const BASE_DIR = process.platform === "win32" ? process.env.APPDATA : process.env.HOME + "/.local/share";
const USER = "yym";
// const USER = "User 1";
const ANKI_MEDIA_DIR = join(
  BASE_DIR || "",
  `Anki2/${USER}/collection.media`,
);
await stat(ANKI_MEDIA_DIR);

// files to copy
const FILES = [
  "_kiku_front.html",
  "_kiku_back.html",
  "_kiku_style.css",
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
  "_kiku_db_similar_kanji_from_keisei.json.gz",
  "_kiku_db_similar_kanji_lookup.json.gz",
  "_kiku_db_similar_kanji_manual.json.gz",
  "_kiku_db_similar_kanji_old_script.json.gz",
  "_kiku_db_similar_kanji_stroke_edit_dist.json.gz",
  "_kiku_db_similar_kanji_wk_niai_noto.json.gz",
  "_kiku_db_similar_kanji_yl_radical.json.gz",
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
