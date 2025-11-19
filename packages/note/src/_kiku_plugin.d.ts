import type { JSX } from "solid-js";
import type { HyperScript } from "solid-js/h/types/hyperscript.d.ts";
import type { AnkiFields } from "#/types";

export type Plugin = {
  ExternalLinks?: (props: {
    DefaultExternalLinks: () => JSX.Element;
    ctx: {
      ankiFields: AnkiFields;
      h: HyperScript;
    };
  }) => JSX.Element | JSX.Element[];
};
