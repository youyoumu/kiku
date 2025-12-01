import { isServer } from "solid-js/web";
import { type AnkiFields, ankiFieldsSkeleton } from "#/types";
import {
  exampleFields,
  exampleFields2,
  exampleFields3,
  exampleFields4,
  exampleFields5,
  exampleFields6,
  exampleFields7,
  exampleFields8,
  exampleFields9,
  exampleFields10,
  exampleFields11,
  exampleFields12,
} from "./examples";

// biome-ignore format: this looks nicer
export const env = {
  KIKU_NOTE_TYPE: "Kiku",
  KIKU_CARD_TYPE: "Mining",
  KIKU_CONFIG_FILE: "_kiku_config.json",
  KIKU_CONFIG_SESSION_STORAGE_KEY: "kiku-config",
  KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY: "kiku-is-theme-changed",
  KIKU_FRONT_FILE: "_kiku_front.html",
  KIKU_BACK_FILE: "_kiku_back.html",
  KIKU_STYLE_FILE: "_kiku_style.css",
  KIKU_NOTES_MANIFEST: "_kiku_notes_manifest.json",
  KIKU_DB_SIMILAR_KANJI_FROM_KEISEI: "_kiku_db_similar_kanji_from_keisei.json.gz",
  KIKU_DB_SIMILAR_KANJI_LOOKUP: "_kiku_db_similar_kanji_lookup.json.gz",
  KIKU_DB_SIMILAR_KANJI_MANUAL: "_kiku_db_similar_kanji_manual.json.gz",
  KIKU_DB_SIMILAR_KANJI_OLD_SCRIPT: "_kiku_db_similar_kanji_old_script.json.gz",
  KIKU_DB_SIMILAR_KANJI_STROKE_EDIT_DIST: "_kiku_db_similar_kanji_stroke_edit_dist.json.gz",
  KIKU_DB_SIMILAR_KANJI_WK_NIAI_NOTO: "_kiku_db_similar_kanji_wk_niai_noto.json.gz",
  KIKU_DB_SIMILAR_KANJI_YL_RADICAL: "_kiku_db_similar_kanji_yl_radical.json.gz",
  KIKU_PLUGIN_MODULE: "_kiku_plugin.js",
  KIKU_VERSION: "1.4.0",
  KIKU_IMPORTANT_FILES: [
    "_kiku.js",
    "_kiku_libs.js",
    "_kiku_shared.js",
    "_kiku_lazy.js",
    "_kiku_worker.js",
    "_kiku_plugin.js",

    "_kiku_front.html",
    "_kiku_back.html",
    "_kiku_style.css",
    "_kiku.css",

    "_kiku_font_hina-mincho.woff2",
    "_kiku_font_ibm-plex-sans-jp.woff2",
    "_kiku_font_klee-one.woff2",

    "_kiku_db_similar_kanji_from_keisei.json.gz",
    "_kiku_db_similar_kanji_lookup.json.gz",
    "_kiku_db_similar_kanji_manual.json.gz",
    "_kiku_db_similar_kanji_old_script.json.gz",
    "_kiku_db_similar_kanji_stroke_edit_dist.json.gz",
    "_kiku_db_similar_kanji_wk_niai_noto.json.gz",
    "_kiku_db_similar_kanji_yl_radical.json.gz",
  ]
};

export type Env = typeof env;

export function extractKanji(str: string): string[] {
  // Match all CJK Unified Ideographs (Kanji range)
  const matches = str.match(/[\u4E00-\u9FFF]/g);
  return matches ? Array.from(new Set(matches)) : [];
}

export function getAnkiFields() {
  let divs: NodeListOf<Element> | Element[] | undefined = isServer
    ? undefined
    : document.querySelectorAll("#anki-fields > div");
  if (import.meta.env.DEV && !isServer) {
    divs = Object.entries(exampleFields4).map(([key, value]) => {
      const div = document.createElement("div");
      div.dataset.field = key;
      div.innerHTML = value;
      return div;
    });
  }
  const ankiFields = divs
    ? Object.fromEntries(
        Array.from(divs).map((el) => [
          (el as HTMLDivElement).dataset.field,
          el.innerHTML.trim(),
        ]),
      )
    : ankiFieldsSkeleton;
  return ankiFields as AnkiFields;
}
