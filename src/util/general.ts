import { isServer } from "solid-js/web";
import { type AnkiFields, ankiFieldsSkeleton, exampleFields6 } from "#/types";

export const env = {
  KIKU_CONFIG_FILE: "_kiku.config.json",
  KIKU_NOTES_MANIFEST: "_kiku_notes_manifest.json",
};

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
    divs = Object.entries(exampleFields6).map(([key, value]) => {
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
