import {
  createContext,
  createUniqueId,
  type JSX,
  onMount,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { AnkiNote } from "#/types";

export type ContextLabel = {
  text: string;
  type: "similar" | "composedOf" | "usedIn" | "related";
};

type KanjiPageContextStore = {
  noteList: [string, AnkiNote[]][];
  sameReading?: AnkiNote[];
  sameExpression?: AnkiNote[];
  focus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  contextLabel?: ContextLabel;
  nested: boolean;
  nestedId: string;
  nestedNoteList: [string, AnkiNote[]][];
  nestedFocus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  nestedContextLabel?: ContextLabel;
};

const KanjiPageContext =
  createContext<
    [Store<KanjiPageContextStore>, SetStoreFunction<KanjiPageContextStore>]
  >();

const cache = new Map<
  string,
  [Store<KanjiPageContextStore>, SetStoreFunction<KanjiPageContextStore>]
>();

export function KanjiPageContextProvider(props: {
  children: JSX.Element;
  noteList: [string, AnkiNote[]][];
  sameReading?: AnkiNote[];
  sameExpression?: AnkiNote[];
  focus: {
    kanji: string | symbol | undefined;
    noteId: number | undefined;
  };
  contextLabel?: ContextLabel;
  nested?: boolean;
  id: string;
}) {
  const saved = cache.get(props.id);

  const [$kanjiPage, $setKanjiPage] =
    saved ??
    createStore<KanjiPageContextStore>({
      noteList: props.noteList,
      contextLabel: props.contextLabel,
      sameReading: props.sameReading,
      sameExpression: props.sameExpression,
      focus: {
        kanji: props.focus?.kanji,
        noteId: props.focus?.noteId,
      },
      nested: props.nested ?? false,
      nestedId: createUniqueId(),
      nestedNoteList: [],
      nestedFocus: {
        kanji: undefined,
        noteId: undefined,
      },
      nestedContextLabel: undefined,
    });

  onMount(() => {
    cache.set(props.id, [$kanjiPage, $setKanjiPage]);
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
