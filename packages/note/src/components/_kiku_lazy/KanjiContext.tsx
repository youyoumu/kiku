import { createContext, type JSX, onMount, useContext } from "solid-js";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { KikuDbMainEntry } from "#/types";

type KanjiStore = {
  kanji: string;
  kanjiInfo: KikuDbMainEntry | undefined;
};

const KanjiContext =
  createContext<[Store<KanjiStore>, SetStoreFunction<KanjiStore>]>();

export function KanjiContextProvider(props: {
  kanji: string;
  children: JSX.Element;
}) {
  const [$kanji, $setKanji] = createStore<KanjiStore>({
    kanji: props.kanji,
    kanjiInfo: undefined,
  });

  onMount(async () => {
    const nex = await KIKU_STATE.nexClient?.nex;
    if (nex) {
      const kanjiInfo = await nex.lookupKanji(props.kanji);
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
