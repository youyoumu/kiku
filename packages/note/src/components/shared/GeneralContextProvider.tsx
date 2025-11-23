import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { KikuPlugin } from "#/plugins/pluginTypes";

type GeneralStore = { plugin: KikuPlugin | undefined };

const GeneralContext =
  createContext<[Store<GeneralStore>, SetStoreFunction<GeneralStore>]>();

export function GeneralContextProvider(props: { children: JSX.Element }) {
  const [generalStore, setGeneralStore] = createStore<GeneralStore>({
    plugin: undefined,
  });

  return (
    <GeneralContext.Provider value={[generalStore, setGeneralStore]}>
      {props.children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const generalContext = useContext(GeneralContext);
  if (!generalContext) throw new Error("Missing GeneralContext");
  return generalContext;
}
