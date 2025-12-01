import type { JSX } from "solid-js/jsx-runtime";
import type { PitchInfo } from "#/components/_kiku_lazy/util/hatsuon";
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
  Pitch?: (props: {
    pitchInfo: PitchInfo;
    index: number;
    DefaultPitch: (props: {
      pitchInfo: PitchInfo;
      index: number;
      ref?: HTMLDivElement;
    }) => JSX.Element;
    ctx: Ctx;
  }) => JSX.Element | JSX.Element[];
  onPluginLoad?: (props: { ctx: Ctx }) => void;
  onSettingsMount?: (props: { ctx: Ctx }) => void;
};
