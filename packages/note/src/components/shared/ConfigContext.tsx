import { createContext, createEffect, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import type { SetStoreFunction, Store } from "solid-js/store";
import { type KikuConfig, updateConfigState } from "#/util/config";
import { env } from "#/util/general";
import type { DaisyUITheme } from "#/util/theme";
import { useGeneralContext } from "./GeneralContext";

const ConfigContext =
  createContext<[Store<KikuConfig>, SetStoreFunction<KikuConfig>]>();

export function ConfigContextProvider(props: {
  children: JSX.Element;
  value: [Store<KikuConfig>, SetStoreFunction<KikuConfig>];
}) {
  const [$config] = props.value;
  const [$general, $setGeneral] = useGeneralContext();

  let initialTheme: DaisyUITheme | undefined;
  createEffect(() => {
    ({ ...$config });
    KIKU_STATE.logger.debug("Updating config:", $config);
    if (!KIKU_STATE.root) throw new Error("Missing root");
    updateConfigState(KIKU_STATE.root, $config);
    sessionStorage.setItem(
      env.KIKU_CONFIG_SESSION_STORAGE_KEY,
      JSON.stringify($config),
    );
    if (!initialTheme) {
      initialTheme = $config.theme;
    } else if (initialTheme && initialTheme !== $config.theme) {
      sessionStorage.setItem(
        env.KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY,
        "true",
      );
      $setGeneral("isThemeChanged", true);
    }
  });

  return (
    <ConfigContext.Provider value={props.value}>
      {props.children}
    </ConfigContext.Provider>
  );
}

export function useConfigContext() {
  const config = useContext(ConfigContext);
  if (!config) throw new Error("Missing ConfigContext");
  return config;
}

export type UseConfigContext = typeof useConfigContext;
