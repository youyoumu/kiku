import type {
  createComputed,
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  getOwner,
  lazy,
  Match,
  onCleanup,
  onMount,
  runWithOwner,
  Show,
  Suspense,
  Switch,
  untrack,
  useContext,
} from "solid-js";
import type h from "solid-js/h";
import type { JSX } from "solid-js/jsx-runtime";
import type { createStore } from "solid-js/store";
import type { Portal } from "solid-js/web";
import type { PitchInfo } from "#/components/_kiku_lazy/util/hatsuon";
import type { UseAnkiFieldContext } from "#/components/shared/AnkiFieldsContext";
import type { UseBreakpointContext } from "#/components/shared/BreakpointContext";
import type { UseCardContext } from "#/components/shared/CardContext";
import type { UseConfigContext } from "#/components/shared/ConfigContext";
import type { AnkiBackFields, AnkiDroidAPI, AnkiFrontFields } from "#/types";

export type Ctx = {
  h: typeof h;
  createSignal: typeof createSignal;
  createEffect: typeof createEffect;
  createMemo: typeof createMemo;
  createResource: typeof createResource;
  createComputed: typeof createComputed;
  onMount: typeof onMount;
  onCleanup: typeof onCleanup;
  createContext: typeof createContext;
  useContext: typeof useContext;
  lazy: typeof lazy;
  ErrorBoundary: typeof ErrorBoundary;
  For: typeof For;
  Portal: typeof Portal;
  Show: typeof Show;
  Suspense: typeof Suspense;
  Switch: typeof Switch;
  Match: typeof Match;
  untrack: typeof untrack;
  runWithOwner: typeof runWithOwner;
  getOwner: typeof getOwner;
  createStore: typeof createStore;
  //
  ankiFields: AnkiFrontFields | AnkiBackFields;
  ankiDroidAPI: () => AnkiDroidAPI | undefined;
  useAnkiFieldContext: UseAnkiFieldContext;
  useBreakpointContext: UseBreakpointContext;
  useCardContext: UseCardContext;
  useConfigContext: UseConfigContext;
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
  Footer?: (props: {
    DefaultFooter: () => JSX.Element;
    ctx: Ctx;
  }) => JSX.Element | JSX.Element[];
  Pitch?: (props: {
    pitchInfo: PitchInfo;
    index: number;
    DefaultPitch: (props: {
      pitchInfo: PitchInfo;
      index: number;
      ref?: (ref: HTMLDivElement) => void;
    }) => JSX.Element;
    ctx: Ctx;
  }) => JSX.Element | JSX.Element[];
  onPluginLoad?: (props: { ctx: Ctx }) => void;
  onSettingsMount?: (props: { ctx: Ctx }) => void;
};
