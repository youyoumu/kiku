import { createContext, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { isServer } from "solid-js/web";
import type { KikuPlugin } from "#/plugins/pluginTypes";
import { env } from "#/util/general";

type GeneralStore = { plugin: KikuPlugin | undefined; isThemeChanged: boolean };

const GeneralContext =
  createContext<[Store<GeneralStore>, SetStoreFunction<GeneralStore>]>();

export function GeneralContextProvider(props: { children: JSX.Element }) {
  const [$general, $setGeneral] = createStore<GeneralStore>({
    plugin: undefined,
    isThemeChanged: isServer
      ? false
      : JSON.parse(
          sessionStorage.getItem(
            env.KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY,
          ) ?? "false",
        ),
  });

  return (
    <GeneralContext.Provider value={[$general, $setGeneral]}>
      {props.children}
    </GeneralContext.Provider>
  );
}

export function useGeneralContext() {
  const generalContext = useContext(GeneralContext);
  if (!generalContext) throw new Error("Missing GeneralContext");
  return generalContext;
}
