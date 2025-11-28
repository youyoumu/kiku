import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/types";

export type KanjiData = {
  shared: AnkiNote[];
  similar: Record<string, AnkiNote[]>;
};

type Toast = {
  success: (message: string) => void;
  error: (message: string) => void;
  message: string | undefined;
  type: "success" | "error";
};

type Query = {
  status: "loading" | "success" | "error";
  kanji: Record<string, KanjiData>;
  sameReading: AnkiNote[] | undefined;
  selectedSimilarKanji: string | undefined;
};

type CardStore = {
  side: "front" | "back";
  page: "main" | "settings" | "kanji" | "nested";
  ready: boolean;
  isNsfw: boolean;
  layoutRef?: HTMLDivElement;
  contentRef?: HTMLDivElement;
  expressionAudioRef?: HTMLDivElement;
  sentenceFieldRef?: HTMLDivElement;
  sentenceAudioRef?: HTMLDivElement;
  sentenceAudios?: HTMLAnchorElement[] | HTMLAudioElement[];
  pictureModal?: string;
  toast: Toast;
  query: Query;
  focus: {
    SAME_READING: symbol;
    kanjiPage: string | symbol | undefined;
    similarKanjiPage: string | symbol | undefined;
  };
  nestedAnkiFields: AnkiFields;
  nested: boolean;
};

const CardStoreContext =
  createContext<[Store<CardStore>, SetStoreFunction<CardStore>]>();

export function CardStoreContextProvider(props: {
  children: JSX.Element;
  nested?: boolean;
  side: "front" | "back";
}) {
  let timeout: number;

  const success = (message: string) => {
    if (timeout) clearTimeout(timeout);
    $setCard("toast", { message, type: "success" });
    timeout = setTimeout(() => {
      $setCard("toast", { message: undefined, type: "success" });
    }, 3000);
  };
  const error = (message: string) => {
    if (timeout) clearTimeout(timeout);
    $setCard("toast", { message, type: "error" });
    timeout = setTimeout(() => {
      $setCard("toast", { message: undefined, type: "error" });
    }, 3000);
  };

  const [$card, $setCard] = createStore<CardStore>({
    side: props.side,
    page: "main",
    ready: false,
    isNsfw: false,
    layoutRef: undefined,
    contentRef: undefined,
    expressionAudioRef: undefined,
    sentenceFieldRef: undefined,
    sentenceAudioRef: undefined,
    sentenceAudios: undefined,
    pictureModal: undefined,
    toast: { success, error, message: undefined, type: "success" },
    query: {
      status: "loading",
      kanji: {},
      sameReading: undefined,
      selectedSimilarKanji: undefined,
    },
    focus: {
      SAME_READING: Symbol.for("SAME_READING"),
      kanjiPage: undefined,
      similarKanjiPage: undefined,
    },
    nestedAnkiFields: ankiFieldsSkeleton,
    nested: props.nested ?? false,
  });

  return (
    <CardStoreContext.Provider value={[$card, $setCard]}>
      {props.children}
    </CardStoreContext.Provider>
  );
}

export function useCardContext() {
  const cardStore = useContext(CardStoreContext);
  if (!cardStore) throw new Error("Missing CardStoreContext");
  return cardStore;
}
