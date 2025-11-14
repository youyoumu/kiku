import { isServer } from "solid-js/web";
import { type AnkiFields, ankiFieldsSkeleton } from "#/types";
import { exampleFields8 } from "./examples";

// biome-ignore format: this looks nicer
export const env = {
  KIKU_CONFIG_FILE: "_kiku_config.json",
  KIKU_NOTES_MANIFEST: "_kiku_notes_manifest.json",
  KIKU_DB_SIMILAR_KANJI_FROM_KEISEI: "_kiku_db_similar_kanji_from_keisei.json",
  KIKU_DB_SIMILAR_KANJI_LOOKUP: "_kiku_db_similar_kanji_lookup.json",
  KIKU_DB_SIMILAR_KANJI_MANUAL: "_kiku_db_similar_kanji_manual.json",
  KIKU_DB_SIMILAR_KANJI_OLD_SCRIPT: "_kiku_db_similar_kanji_old_script.json",
  KIKU_DB_SIMILAR_KANJI_STROKE_EDIT_DIST: "_kiku_db_similar_kanji_stroke_edit_dist.json",
  KIKU_DB_SIMILAR_KANJI_WK_NIAI_NOTO: "_kiku_db_similar_kanji_wk_niai_noto.json",
  KIKU_DB_SIMILAR_KANJI_YL_RADICAL: "_kiku_db_similar_kanji_yl_radical.json",
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
    divs = Object.entries(exampleFields8).map(([key, value]) => {
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
