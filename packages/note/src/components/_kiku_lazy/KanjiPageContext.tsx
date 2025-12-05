import { createContext, type JSX, useContext } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { AnkiNote } from "#/types";

type KanjiPageContextStore = {
  noteList: [string, AnkiNote[]][];
  sameReading?: AnkiNote[];
  focus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  selectedKanji?: {
    kanji: string;
    type: "similar" | "composedOf" | "usedIn";
  };
  nested: boolean;
  nestedNoteList: [string, AnkiNote[]][];
  nestedFocus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
};

const KanjiPageContext =
  createContext<
    [Store<KanjiPageContextStore>, SetStoreFunction<KanjiPageContextStore>]
  >();

export function KanjiPageContextProvider(props: {
  children: JSX.Element;
  noteList: [string, AnkiNote[]][];
  sameReading?: AnkiNote[];
  focus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  selectedKanji?: {
    kanji: string;
    type: "similar" | "composedOf" | "usedIn";
  };
  nested?: boolean;
}) {
  const [$kanjiPage, $setKanjiPage] = createStore<KanjiPageContextStore>({
    noteList: props.noteList,
    selectedKanji: props.selectedKanji,
    sameReading: props.sameReading,
    focus: {
      kanji: props.focus?.kanji,
      noteId: props.focus?.noteId,
    },
    nested: props.nested ?? false,
    nestedNoteList: [],
    nestedFocus: {
      kanji: undefined,
      noteId: undefined,
    },
  });

  return (
    <KanjiPageContext.Provider value={[$kanjiPage, $setKanjiPage]}>
      {props.children}
    </KanjiPageContext.Provider>
  );
}

export function useKanjiPageContext() {
  const kanjiPageStore = useContext(KanjiPageContext);
  if (!kanjiPageStore) throw new Error("Missing KanjiPageContext");
  return kanjiPageStore;
}
