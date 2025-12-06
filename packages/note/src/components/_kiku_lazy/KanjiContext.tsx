import { createContext, type JSX, onMount, useContext } from "solid-js";
import {
  createStore,
  type SetStoreFunction,
  type Store,
  unwrap,
} from "solid-js/store";
import type { AnkiNote, KanjiInfo } from "#/types";
import { useAnkiFieldContext } from "../shared/AnkiFieldsContext";

type KanjiStore = {
  kanji: string;
  kanjiInfo: KanjiInfo | undefined;
  composedOf?: [string, AnkiNote[]][];
  usedIn?: [string, AnkiNote[]][];
  visuallySimilar?: [string, AnkiNote[]][];
  related?: [string, AnkiNote[]][];
  status: "loading" | "success" | "error";
};

const KanjiContext =
  createContext<[Store<KanjiStore>, SetStoreFunction<KanjiStore>]>();

const lookupKanjiCache = new Map<string, KanjiInfo | undefined>();

export function KanjiContextProvider(props: {
  kanji: string;
  children: JSX.Element;
  fetchNotes?: boolean;
}) {
  const { ankiFields } = useAnkiFieldContext<"back">();
  const [$kanji, $setKanji] = createStore<KanjiStore>({
    kanji: props.kanji,
    kanjiInfo: undefined,
    status: props.fetchNotes ? "loading" : "success",
  });

  onMount(async () => {
    const nex = await KIKU_STATE.nexClient?.nex;
    if (nex) {
      let kanjiInfo = lookupKanjiCache.get(props.kanji);
      if (!kanjiInfo) {
        kanjiInfo = await nex.lookupKanji(props.kanji);
        lookupKanjiCache.set(props.kanji, kanjiInfo);
      }
      $setKanji("kanjiInfo", kanjiInfo);

      if (props.fetchNotes) {
        const [composedOf, usedIn, visuallySimilar, related] =
          await Promise.all([
            nex.queryShared({
              ankiFields: unwrap(ankiFields),
              kanjiList: kanjiInfo?.composedOf ?? [],
            }),
            nex.queryShared({
              ankiFields: unwrap(ankiFields),
              kanjiList: kanjiInfo?.usedIn ?? [],
            }),
            nex.queryShared({
              ankiFields: unwrap(ankiFields),
              kanjiList: kanjiInfo?.visuallySimilar ?? [],
            }),
            nex.queryShared({
              ankiFields: unwrap(ankiFields),
              kanjiList: kanjiInfo?.related ?? [],
            }),
          ]);

        $setKanji("composedOf", Object.entries(composedOf.kanjiResult));
        $setKanji("usedIn", Object.entries(usedIn.kanjiResult));
        $setKanji(
          "visuallySimilar",
          Object.entries(visuallySimilar.kanjiResult),
        );
        $setKanji("related", Object.entries(related.kanjiResult));
        $setKanji("status", "success");
      }
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
