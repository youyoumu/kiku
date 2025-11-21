import type { HyperScript } from "solid-js/h/types/hyperscript.js";
import type { JSX } from "solid-js/jsx-runtime";
import type { AnkiBackFields, AnkiDroidAPI, AnkiFrontFields } from "#/types";

type Ctx = {
  ankiFields: AnkiFrontFields | AnkiBackFields;
  h: HyperScript;
  ankiDroidAPI: () => AnkiDroidAPI | undefined;
};

export type KikuPlugin = {
  ExternalLinks?: (props: {
    DefaultExternalLinks: () => JSX.Element;
    ctx: Ctx;
  }) => JSX.Element | JSX.Element[];
  Sentence?: (props: {
    DefaultSentence: () => JSX.Element;
    ctx: Ctx;
  }) => JSX.Element | JSX.Element[];
};
