import { createContext, type JSX, useContext } from "solid-js";
import h from "solid-js/h";
import type { HyperScript } from "solid-js/h/types/hyperscript.js";
import type { AnkiBackFields, AnkiDroidAPI, AnkiFrontFields } from "#/types";
import {
  type UseAnkiFieldContext,
  useAnkiFieldContext,
} from "./AnkiFieldsContext";
import {
  type UseBreakpointContext,
  useBreakpointContext,
} from "./BreakpointContext";
import { type UseCardContext, useCardContext } from "./CardContext";
import { type UseConfigContext, useConfigContext } from "./ConfigContext";

export type Ctx = {
  h: HyperScript;
  ankiFields: AnkiFrontFields | AnkiBackFields;
  ankiDroidAPI: () => AnkiDroidAPI | undefined;
  useAnkiFieldContext: UseAnkiFieldContext;
  useBreakpointContext: UseBreakpointContext;
  useCardContext: UseCardContext;
  useConfigContext: UseConfigContext;
};

const CtxContext = createContext<Ctx>();

export function CtxContextProvider(props: { children: JSX.Element }) {
  const { ankiFields } = useAnkiFieldContext();
  const ctx: Ctx = {
    h,
    ankiFields,
    ankiDroidAPI: () => KIKU_STATE.ankiDroidAPI,
    useAnkiFieldContext,
    useBreakpointContext,
    useCardContext,
    useConfigContext,
  };

  return (
    <CtxContext.Provider value={ctx}>{props.children}</CtxContext.Provider>
  );
}

export function useCtxContext() {
  const ctx = useContext(CtxContext);
  if (!ctx) throw new Error("Missing CtxContext");
  return ctx;
}
