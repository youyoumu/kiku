import { createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { JpdbKanji } from "#/types";

type KanjiStore = {
  kanji: string;
  jpdbKanji: JpdbKanji | undefined;
};

const KanjiContext =
  createContext<[Store<KanjiStore>, SetStoreFunction<KanjiStore>]>();

export function KanjiContextProvider(props: {
  kanji: string;
  children: JSX.Element;
}) {
  const [$kanji, $setKanji] = createStore<KanjiStore>({
    kanji: props.kanji,
    jpdbKanji: undefined,
  });

  onMount(async () => {
    const nex = await KIKU_STATE.nexClient?.nex;
    if (nex) {
      const jpdbKanji = await nex.lookupJpdb(props.kanji);
      $setKanji("jpdbKanji", jpdbKanji);
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
