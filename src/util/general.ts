import { isServer } from "solid-js/web";
import {
  type AnkiBackFields,
  type AnkiFrontFields,
  ankiFieldsSkeleton,
  exampleFields6,
} from "#/types";

export const env = {
  KIKU_CONFIG_FILE: "_kiku.config.json",
};

type GetAnkiFieldsType = {
  front: AnkiFrontFields;
  back: AnkiBackFields;
};

export function getAnkiFields<T extends "front" | "back">() {
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
  const ankiFields$ = divs
    ? Object.fromEntries(
        Array.from(divs).map((el) => [
          (el as HTMLDivElement).dataset.field,
          el.innerHTML.trim(),
        ]),
      )
    : ankiFieldsSkeleton;
  return ankiFields$ as GetAnkiFieldsType[T];
}
