import {
  createComputed,
  createContext,
  createEffect,
  createMemo,
  createResource,
  createSignal,
  ErrorBoundary,
  For,
  getOwner,
  type JSX,
  lazy,
  onCleanup,
  onMount,
  runWithOwner,
  untrack,
  useContext,
} from "solid-js";
import h from "solid-js/h";
import { createStore } from "solid-js/store";
import { Match, Portal, Show, Suspense, Switch } from "solid-js/web";
import type { Ctx } from "#/plugins/pluginTypes";
import { useAnkiFieldContext } from "./AnkiFieldsContext";
import { useBreakpointContext } from "./BreakpointContext";
import { useCardContext } from "./CardContext";
import { useConfigContext } from "./ConfigContext";

const CtxContext = createContext<Ctx>();

export function CtxContextProvider(props: { children: JSX.Element }) {
  const { ankiFields } = useAnkiFieldContext();
  const ctx: Ctx = {
    h,
    createSignal,
    createEffect,
    createMemo,
    createResource,
    createComputed,
    onMount,
    onCleanup,
    createContext,
    useContext,
    lazy,
    ErrorBoundary,
    For,
    Portal,
    Show,
    Suspense,
    Switch,
    Match,
    untrack,
    runWithOwner,
    getOwner,
    createStore,
    //
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
