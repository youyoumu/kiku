import { createContext, createUniqueId, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { type AnkiFields, type AnkiNote, ankiFieldsSkeleton } from "#/types";

type Query = {
  status: "loading" | "success" | "error";
  kanji: Record<string, AnkiNote[]>;
  sameReading: AnkiNote[] | undefined;
  noteList: [string, AnkiNote[]][];
};

type CardStore = {
  side: "front" | "back";
  page: "main" | "settings" | "kanji" | "nested";
  ready: boolean;
  expressionReady: boolean;
  isNsfw: boolean;
  uniqueId: string;
  expressionAudioRef?: HTMLDivElement;
  sentenceFieldRef?: HTMLDivElement;
  sentenceAudioRef?: HTMLDivElement;
  sentenceAudios?: HTMLAnchorElement[] | HTMLAudioElement[];
  pictureModal?: string;
  query: Query;
  focus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  navigateBack: (() => void)[];
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
    expressionReady: false,
    isNsfw: false,
    uniqueId: createUniqueId(),
    expressionAudioRef: undefined,
    sentenceFieldRef: undefined,
    sentenceAudioRef: undefined,
    sentenceAudios: undefined,
    pictureModal: undefined,
    query: {
      status: "loading",
      kanji: {},
      sameReading: undefined,
      noteList: [],
    },
    focus: {
      kanji: undefined,
      noteId: undefined,
    },
    navigateBack: [],
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
