import type { HyperScript } from "solid-js/h/types/hyperscript.js";
import type { JSX } from "solid-js/jsx-runtime";
import type { AnkiDroidAPI, AnkiFields } from "#/types";

export type KikuPlugin = {
  ExternalLinks?: (props: {
    DefaultExternalLinks: () => JSX.Element;
    ctx: {
      ankiFields: AnkiFields;
      h: HyperScript;
      ankiDroidAPI: () => AnkiDroidAPI | undefined;
    };
  }) => JSX.Element | JSX.Element[];
};
