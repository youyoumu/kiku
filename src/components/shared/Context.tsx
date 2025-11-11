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
import { getAnkiFields } from "#/util/general";
import {
  type AnkiBackFields,
  type AnkiFields,
  type AnkiFrontFields,
  type AnkiNote,
  ankiFieldsSkeleton,
} from "../../types";
import { type KikuConfig, updateConfigDataset } from "../../util/config";

const ConfigContext =
  createContext<[Store<KikuConfig>, SetStoreFunction<KikuConfig>]>();

export function ConfigContextProvider(props: {
  children: JSX.Element;
  value: [Store<KikuConfig>, SetStoreFunction<KikuConfig>];
}) {
  const [config] = props.value;
  createEffect(() => {
    ({ ...config });
    if (!globalThis.KIKU_STATE.root) throw new Error("Missing root");
    updateConfigDataset(globalThis.KIKU_STATE.root, config);
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
  pictureFieldRef?: HTMLDivElement;
  expressionAudioRef?: HTMLDivElement;
  sentenceFieldRef?: HTMLDivElement;
  sentenceAudioRef?: HTMLDivElement;
  sentenceAudios?: HTMLAnchorElement[];
  screen: "main" | "settings" | "kanji" | "nested";
  ready: boolean;
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
  kanjiLoading: boolean;
  selectedSimilarKanji: string | undefined;
  nestedAnkiFields: AnkiFields;
  nested: boolean;
};

const CardStoreContext =
  createContext<[Store<CardStore>, SetStoreFunction<CardStore>]>();

export function CardStoreContextProvider(props: {
  children: JSX.Element;
  nested?: boolean;
}) {
  const store = createStore<CardStore>({
    pictureFieldRef: undefined,
    expressionAudioRef: undefined,
    sentenceFieldRef: undefined,
    sentenceAudioRef: undefined,
    sentenceAudios: undefined,
    screen: "main",
    ready: false,
    imageModal: undefined,
    pictureIndex: 0,
    pictures: [],
    isNsfw: false,
    clicked: false,
    kanji: {},
    kanjiLoading: true,
    selectedSimilarKanji: undefined,
    nestedAnkiFields: ankiFieldsSkeleton,
    nested: props.nested ?? false,
  });

  return (
    <CardStoreContext.Provider value={store}>
      {props.children}
    </CardStoreContext.Provider>
  );
}

export function useCardStore() {
  const cardStore = useContext(CardStoreContext);
  if (!cardStore) throw new Error("Missing CardStoreContext");
  return cardStore;
}
