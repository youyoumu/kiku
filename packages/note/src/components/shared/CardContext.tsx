import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/types";

export type KanjiData = {
  shared: AnkiNote[];
  similar: Record<string, AnkiNote[]>;
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
  expressionAudioRef?: HTMLDivElement;
  sentenceFieldRef?: HTMLDivElement;
  sentenceAudioRef?: HTMLDivElement;
  sentenceAudios?: HTMLAnchorElement[] | HTMLAudioElement[];
  pictureModal?: string;
  query: Query;
  focus: {
    SAME_READING: symbol;
    kanjiPage: string | symbol | undefined;
    similarKanjiPage: string | symbol | undefined;
    noteId: number | undefined;
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
  const [$card, $setCard] = createStore<CardStore>({
    side: props.side,
    page: "main",
    ready: false,
    isNsfw: false,
    expressionAudioRef: undefined,
    sentenceFieldRef: undefined,
    sentenceAudioRef: undefined,
    sentenceAudios: undefined,
    pictureModal: undefined,
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
      noteId: undefined,
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

export type UseCardContext = typeof useCardContext;
