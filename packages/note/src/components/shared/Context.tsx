import {
  type Accessor,
  createContext,
  createEffect,
  createSignal,
  type JSX,
  onCleanup,
  onMount,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import {
  type AnkiBackFields,
  type AnkiFields,
  type AnkiFrontFields,
  type AnkiNote,
  ankiFieldsSkeleton,
  type KikuNotesManifest,
} from "#/types";
import { type KikuConfig, updateConfigState } from "#/util/config";
import { getAnkiFields } from "#/util/general";
import type { WorkerClient } from "#/worker/client";

const ConfigContext =
  createContext<[Store<KikuConfig>, SetStoreFunction<KikuConfig>]>();

export function ConfigContextProvider(props: {
  children: JSX.Element;
  value: [Store<KikuConfig>, SetStoreFunction<KikuConfig>];
}) {
  const [config] = props.value;
  createEffect(() => {
    ({ ...config });
    KIKU_STATE.logger.debug("Updating config:", config);
    if (!KIKU_STATE.root) throw new Error("Missing root");
    updateConfigState(KIKU_STATE.root, config);
  });

  return (
    <ConfigContext.Provider value={props.value}>
      {props.children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const config = useContext(ConfigContext);
  if (!config) throw new Error("Missing ConfigContext");
  return config;
}

const AnkiFieldContext = createContext<{
  ankiFields: AnkiFields;
}>();

export function AnkiFieldContextProvider(props: {
  children: JSX.Element;
  ankiFields?: AnkiFields;
}) {
  const ankiFields = props.ankiFields ?? getAnkiFields();

  return (
    <AnkiFieldContext.Provider value={{ ankiFields }}>
      {props.children}
    </AnkiFieldContext.Provider>
  );
}

type useAnkiFieldType = {
  front: {
    ankiFields: AnkiFrontFields;
  };
  back: {
    ankiFields: AnkiBackFields;
  };
};

export function useAnkiField<T extends "front" | "back">() {
  const ankiField = useContext(AnkiFieldContext);
  if (!ankiField) throw new Error("Missing AnkiFieldContext");
  return ankiField as useAnkiFieldType[T];
}

// Tailwind’s default breakpoints
const breakpoints = {
  base: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};
type Breakpoint = keyof typeof breakpoints;
const order: Breakpoint[] = ["base", "sm", "md", "lg", "xl", "2xl"];

function getBreakpoint(width: number) {
  if (width < breakpoints.sm) return "base";
  if (width < breakpoints.md) return "sm";
  if (width < breakpoints.lg) return "md";
  if (width < breakpoints.xl) return "lg";
  if (width < breakpoints["2xl"]) return "xl";
  return "2xl";
}

export function createBreakpoint() {
  const [breakpoint, setBreakpoint] = createSignal<Breakpoint>("base");

  const update = () => {
    const value = breakpoint();
    const newValue = getBreakpoint(window.innerWidth);
    if (value !== newValue) {
      setBreakpoint(newValue);
    }
  };

  onMount(() => {
    setBreakpoint(getBreakpoint(window.innerWidth));
    window.addEventListener("resize", update);
    onCleanup(() => {
      window.removeEventListener("resize", update);
    });
  });

  const isAtLeast = (bp: Breakpoint) =>
    order.indexOf(breakpoint()) >= order.indexOf(bp);

  return { breakpoint, isAtLeast };
}

const BreakpointContext = createContext<{
  breakpoint: Accessor<Breakpoint>;
  isAtLeast: (bp: Breakpoint) => boolean;
}>();

export function BreakpointContextProvider(props: { children: JSX.Element }) {
  const { breakpoint, isAtLeast } = createBreakpoint();
  return (
    <BreakpointContext.Provider
      value={{
        breakpoint,
        isAtLeast,
      }}
    >
      {props.children}
    </BreakpointContext.Provider>
  );
}

export function useBreakpoint() {
  const breakpointSignal = useContext(BreakpointContext);
  if (!breakpointSignal) throw new Error("Missing BreakpointContext");
  return breakpointSignal;
}

type CardStore = {
  side: "front" | "back";
  layoutRef?: HTMLDivElement;
  contentRef?: HTMLDivElement;
  pictureFieldRef?: HTMLDivElement;
  expressionAudioRef?: HTMLDivElement;
  sentenceFieldRef?: HTMLDivElement;
  sentenceAudioRef?: HTMLDivElement;
  sentenceAudios?: HTMLAnchorElement[] | HTMLAudioElement[];
  screen: "main" | "settings" | "kanji" | "nested";
  ready: boolean;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
  toastMessage: string | undefined;
  toastType: "success" | "error";
  imageModal?: string;
  pictureIndex: number;
  pictures: HTMLImageElement[];
  isNsfw: boolean;
  clicked: boolean;
  kanji: Record<
    string,
    {
      shared: AnkiNote[];
      similar: Record<string, AnkiNote[]>;
    }
  >;
  kanjiStatus: "success" | "error" | "loading";
  selectedSimilarKanji: string | undefined;
  nestedAnkiFields: AnkiFields;
  nested: boolean;
  manifest: KikuNotesManifest | undefined;
  worker: WorkerClient | undefined;
  ankiConnectAvailable: boolean;
};

const CardStoreContext =
  createContext<[Store<CardStore>, SetStoreFunction<CardStore>]>();

export function CardStoreContextProvider(props: {
  children: JSX.Element;
  nested?: boolean;
  side: "front" | "back";
}) {
  let timeout: number;
  const [card, setCard] = createStore<CardStore>({
    side: props.side,
    layoutRef: undefined,
    contentRef: undefined,
    pictureFieldRef: undefined,
    expressionAudioRef: undefined,
    sentenceFieldRef: undefined,
    sentenceAudioRef: undefined,
    sentenceAudios: undefined,
    screen: "main",
    ready: false,
    toast: {
      success: (message: string) => {
        if (timeout) clearTimeout(timeout);
        setCard("toastType", "success");
        setCard("toastMessage", message);
        timeout = setTimeout(() => {
          setCard("toastMessage", undefined);
        }, 3000);
      },
      error: (message: string) => {
        if (timeout) clearTimeout(timeout);
        setCard("toastType", "error");
        setCard("toastMessage", message);
        timeout = setTimeout(() => {
          setCard("toastMessage", undefined);
        }, 3000);
      },
    },
    toastMessage: undefined,
    toastType: "success",
    imageModal: undefined,
    pictureIndex: 0,
    pictures: [],
    isNsfw: false,
    clicked: false,
    kanji: {},
    kanjiStatus: "loading",
    selectedSimilarKanji: undefined,
    nestedAnkiFields: ankiFieldsSkeleton,
    nested: props.nested ?? false,
    manifest: undefined,
    worker: undefined,
    ankiConnectAvailable: false,
  });

  return (
    <CardStoreContext.Provider value={[card, setCard]}>
      {props.children}
    </CardStoreContext.Provider>
  );
}

export function useCardStore() {
  const cardStore = useContext(CardStoreContext);
  if (!cardStore) throw new Error("Missing CardStoreContext");
  return cardStore;
}
