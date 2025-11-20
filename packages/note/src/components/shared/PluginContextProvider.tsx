import { createContext, createSignal, type Signal, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import type { KikuPlugin } from "#/plugins/pluginTypes";

const PluginContext = createContext<Signal<KikuPlugin | undefined>>();

export function PluginContextProvider(props: { children: JSX.Element }) {
  const plugin$ = createSignal<KikuPlugin | undefined>(undefined);

  return (
    <PluginContext.Provider value={plugin$}>
      {props.children}
    </PluginContext.Provider>
  );
}

export function usePlugin() {
  const pluginContext = useContext(PluginContext);
  if (!pluginContext) throw new Error("Missing PluginContext");
  return pluginContext;
}
