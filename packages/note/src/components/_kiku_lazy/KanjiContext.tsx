import {
  createContext,
  createEffect,
  type JSX,
  onMount,
  useContext,
} from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { AnkiNote, JpdbKanji } from "#/types";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";

type KanjiStore = {
  kanji: string;
  jpdbKanji: JpdbKanji | undefined;
  similarKanji: [string, AnkiNote[]][];
  composedOf: [string, AnkiNote[]][];
  usedIn: [string, AnkiNote[]][];
};

const KanjiContext =
  createContext<[Store<KanjiStore>, SetStoreFunction<KanjiStore>]>();

export function KanjiContextProvider(props: {
  kanji: string;
  children: JSX.Element;
}) {
  const { ankiFields } = useAnkiFieldContext<"back">();
  const [$kanji, $setKanji] = createStore<KanjiStore>({
    kanji: props.kanji,
    jpdbKanji: undefined,
    similarKanji: [],
    composedOf: [],
    usedIn: [],
  });

  onMount(async () => {
    const nex = await KIKU_STATE.nexClient?.nex;
    if (nex) {
      const jpdbKanji = await nex.lookupJpdb(props.kanji);
      $setKanji("jpdbKanji", jpdbKanji);
    }
  });

  createEffect(async () => {
    if ($kanji.jpdbKanji) {
      const nex = await KIKU_STATE.nexClient?.nex;
      if (!nex) return;
      const similarKanji = await nex.getSimilarKanji($kanji.kanji);
      const composedOf = $kanji.jpdbKanji.composedOf.map((data) => data.kanji);
      const usedIn = $kanji.jpdbKanji.usedInKanji.map((data) => data.kanji);
      const kanjiList = [...similarKanji, ...composedOf, ...usedIn];
      const { kanjiResult, readingResult } = await nex.querySharedAndSimilar({
        kanjiList,
        readingList: [],
        ankiFields,
      });
      const similarKanjiResult = similarKanji.map(
        (kanji) => [kanji, kanjiResult[kanji].shared] as [string, AnkiNote[]],
      );
      const composedOfResult = composedOf.map(
        (kanji) => [kanji, kanjiResult[kanji].shared] as [string, AnkiNote[]],
      );
      const usedInResult = usedIn.map(
        (kanji) => [kanji, kanjiResult[kanji].shared] as [string, AnkiNote[]],
      );
      $setKanji("similarKanji", similarKanjiResult);
      $setKanji("composedOf", composedOfResult);
      $setKanji("usedIn", usedInResult);
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
