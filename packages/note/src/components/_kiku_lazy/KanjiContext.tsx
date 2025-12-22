import { createContext, type JSX, onMount, useContext } from "solid-js";
import {
  createStore,
  type SetStoreFunction,
  type Store,
  unwrap,
} from "solid-js/store";
import type { AnkiNote, KanjiInfo } from "#/types";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";
import { useGeneralContext } from "../shared/GeneralContext";

type FetchType = "composedOf" | "usedIn" | "visuallySimilar" | "related";

type KanjiStore = {
  kanji: string;
  kanjiInfo: KanjiInfo | undefined;
  composedOf?: [string, AnkiNote[]][];
  usedIn?: [string, AnkiNote[]][];
  visuallySimilar?: [string, AnkiNote[]][];
  related?: [string, AnkiNote[]][];
  loading: {
    composedOf: boolean;
    usedIn: boolean;
    visuallySimilar: boolean;
    related: boolean;
  };
  fetchNotes: (type: FetchType) => Promise<void>;
  fetched: Set<FetchType>;
};

const KanjiContext =
  createContext<[Store<KanjiStore>, SetStoreFunction<KanjiStore>]>();

export function KanjiContextProvider(props: {
  kanji: string;
  children: JSX.Element;
}) {
  const [$general, $setGeneral] = useGeneralContext();
  const { ankiFields } = useAnkiFieldContext<"back">();
  const [$kanji, $setKanji] = createStore<KanjiStore>({
    kanji: props.kanji,
    kanjiInfo: undefined,
    loading: {
      visuallySimilar: false,
      composedOf: false,
      usedIn: false,
      related: false,
    },
    fetchNotes,
    fetched: new Set(),
  });
  const lookupKanjiCache = $general.lookupKanjiCache;

  async function fetchNotes(type: FetchType) {
    const nex = await (await $general.nexClientPromise.promise).nex;
    const kanjiInfo = unwrap($kanji.kanjiInfo);
    if (!kanjiInfo) return;
    if ($kanji.fetched.has(type)) return;
    $kanji.fetched.add(type);

    const list = kanjiInfo[type] ?? [];
    if (list.length === 0) {
      $setKanji(type, []);
      return;
    }

    $setKanji("loading", type, true);
    const result = await nex.queryShared({
      ankiFields: unwrap(ankiFields),
      kanjiList: list,
    });

    $setKanji(type, Object.entries(result.kanjiResult));
    $setKanji("loading", type, false);
  }

  onMount(async () => {
    const nex = await (await $general.nexClientPromise.promise).nex;
    if (nex && props.kanji) {
      let kanjiInfo = lookupKanjiCache.get(props.kanji);
      if (!kanjiInfo) {
        kanjiInfo = await nex.lookupKanji(props.kanji);
        lookupKanjiCache.set(props.kanji, kanjiInfo);
      }
      $setKanji("kanjiInfo", kanjiInfo);
    }
  });

  return (
    <KanjiContext.Provider value={[$kanji, $setKanji]}>
      {props.children}
    </KanjiContext.Provider>
  );
}

export function useKanjiContext() {
  const kanjiStore = useContext(KanjiContext);
  if (!kanjiStore) throw new Error("Missing KanjiContext");
  return kanjiStore;
}
