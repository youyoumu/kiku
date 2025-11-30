import type { JSX } from "solid-js/jsx-runtime";
import type { Ctx } from "#/components/shared/CtxContext";

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
