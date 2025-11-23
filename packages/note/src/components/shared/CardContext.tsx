import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import {
  type AnkiFields,
  type AnkiNote,
  ankiFieldsSkeleton,
  type KikuNotesManifest,
} from "#/types";
import type { WorkerClient } from "#/worker/client";

export type KanjiData = {
  shared: AnkiNote[];
  similar: Record<string, AnkiNote[]>;
};

type CardStore = {
  side: "front" | "back";
  layoutRef?: HTMLDivElement;
  contentRef?: HTMLDivElement;
  expressionAudioRef?: HTMLDivElement;
  sentenceFieldRef?: HTMLDivElement;
  sentenceAudioRef?: HTMLDivElement;
  sentenceAudios?: HTMLAnchorElement[] | HTMLAudioElement[];
  page: "main" | "settings" | "kanji" | "nested";
  ready: boolean;
  toast: {
    success: (message: string) => void;
    error: (message: string) => void;
  };
  toastMessage: string | undefined;
  toastType: "success" | "error";
  imageModal?: string;
  isNsfw: boolean;
  kanji: Record<string, KanjiData>;
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
  const [$card, $setCard] = createStore<CardStore>({
    side: props.side,
    layoutRef: undefined,
    contentRef: undefined,
    expressionAudioRef: undefined,
    sentenceFieldRef: undefined,
    sentenceAudioRef: undefined,
    sentenceAudios: undefined,
    page: "main",
    ready: false,
    toast: {
      success: (message: string) => {
        if (timeout) clearTimeout(timeout);
        $setCard("toastType", "success");
        $setCard("toastMessage", message);
        timeout = setTimeout(() => {
          $setCard("toastMessage", undefined);
        }, 3000);
      },
      error: (message: string) => {
        if (timeout) clearTimeout(timeout);
        $setCard("toastType", "error");
        $setCard("toastMessage", message);
        timeout = setTimeout(() => {
          $setCard("toastMessage", undefined);
        }, 3000);
      },
    },
    toastMessage: undefined,
    toastType: "success",
    imageModal: undefined,
    isNsfw: false,
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
