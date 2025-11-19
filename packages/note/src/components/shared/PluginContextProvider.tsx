import { createContext, createSignal, type Signal, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import type { Plugin } from "#/types";

const PluginContext = createContext<Signal<Plugin | undefined>>();

export function PluginContextProvider(props: { children: JSX.Element }) {
  const plugin$ = createSignal<Plugin | undefined>(undefined);

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
