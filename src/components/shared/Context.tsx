import { createContext, createEffect, type JSX, useContext } from "solid-js";
import type { SetStoreFunction, Store } from "solid-js/store";
import type {
  AnkiBackFieldNodes,
  AnkiBackFields,
  AnkiFieldNodes,
  AnkiFields,
  AnkiFrontFieldNodes,
  AnkiFrontFields,
} from "../../types";
import type { KikuConfig } from "../../util/config";
import {
  type OnlineFont,
  setOnlineFont,
  setSystemFont,
} from "../../util/fonts";
import { setTheme } from "../../util/theme";

const ConfigContext =
  createContext<[Store<KikuConfig>, SetStoreFunction<KikuConfig>]>();

export function ConfigContextProvider(props: {
  children: JSX.Element;
  value: [Store<KikuConfig>, SetStoreFunction<KikuConfig>];
}) {
  const [config] = props.value;
  createEffect(() => {
    setTheme(config.theme);
    setOnlineFont(config.onlineFont as OnlineFont);
    if (config.systemFont) setSystemFont(config.systemFont);
  });

  return (
    <ConfigContext.Provider value={props.value}>
      {props.children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const config = useContext(ConfigContext);
  if (!config) throw new Error("Missing ConfigContext");
  return config;
}

const AnkiFieldContext = createContext<{
  ankiFields: AnkiFields;
  ankiFieldNodes: AnkiFieldNodes;
}>();

export function AnkiFieldContextProvider(props: {
  children: JSX.Element;
  value: { ankiFields: AnkiFields; ankiFieldNodes: AnkiFieldNodes };
}) {
  return (
    <AnkiFieldContext.Provider value={props.value}>
      {props.children}
    </AnkiFieldContext.Provider>
  );
}

type useAnkiFieldType = {
  front: {
    ankiFields: AnkiFrontFields;
    ankiFieldNodes: AnkiFrontFieldNodes;
  };
  back: {
    ankiFields: AnkiBackFields;
    ankiFieldNodes: AnkiBackFieldNodes;
  };
};

export function useAnkiField<T extends "front" | "back">() {
  const ankiField = useContext(AnkiFieldContext);
  if (!ankiField) throw new Error("Missing AnkiFieldContext");
  return ankiField as useAnkiFieldType[T];
}
