import { createContext, onMount, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import { isServer } from "solid-js/web";
import type { KikuPlugin } from "#/plugins/pluginTypes";
import type { KanjiInfo, KikuNotesManifest } from "#/types";
import { env } from "#/util/general";
import type { NexClient } from "#/worker/client";
import { AnkiConnect } from "../_kiku_lazy/util/ankiConnect";
import { useBreakpointContext } from "./BreakpointContext";

type GeneralStore = {
  plugin: KikuPlugin | undefined;
  isThemeChanged: boolean;
  aborter: AbortController;
  isAnkiConnectAvailable: boolean;
  notesManifest: KikuNotesManifest | undefined;
  layoutRef: HTMLDivElement | undefined;
  contentRef: HTMLDivElement | undefined;
  toast: Toast;
  SAME_READING: symbol;
  lookupKanjiCache: Map<string, KanjiInfo | undefined>;
  nexClientPromise: PromiseWithResolvers<NexClient>;
  checkAnkiConnect: () => Promise<void>;
  useCheckAnkiConnect: () => void;
};

type Toast = {
  success: (message: string) => void;
  error: (message: string) => void;
  message: string | undefined;
  type: "success" | "error";
};

const GeneralContext =
  createContext<[Store<GeneralStore>, SetStoreFunction<GeneralStore>]>();

export function GeneralContextProvider(props: {
  children: JSX.Element;
  aborter: AbortController;
}) {
  let timeout: number;
  const success = (message: string) => {
    if (timeout) clearTimeout(timeout);
    $setGeneral("toast", { message, type: "success" });
    timeout = setTimeout(() => {
      $setGeneral("toast", { message: undefined, type: "success" });
    }, 3000);
  };
  const error = (message: string) => {
    if (timeout) clearTimeout(timeout);
    $setGeneral("toast", { message, type: "error" });
    timeout = setTimeout(() => {
      $setGeneral("toast", { message: undefined, type: "error" });
    }, 3000);
  };

  async function checkAnkiConnect() {
    try {
      const version = await AnkiConnect.getVersion();
      if (version) {
        KIKU_STATE.logger.info("AnkiConnect version:", version);
        $setGeneral("isAnkiConnectAvailable", true);
      }
    } catch {
      KIKU_STATE.logger.warn("AnkiConnect is not available");
      $setGeneral("isAnkiConnectAvailable", false);
    }
  }

  function useCheckAnkiConnect() {
    const bp = useBreakpointContext();
    onMount(() => {
      if (!bp.isAtLeast("sm")) return;
      $general.checkAnkiConnect();
    });
  }

  const [$general, $setGeneral] = createStore<GeneralStore>({
    plugin: undefined,
    isThemeChanged: isServer
      ? false
      : JSON.parse(
          sessionStorage.getItem(
            env.KIKU_IS_THEME_CHANGED_SESSION_STORAGE_KEY,
          ) ?? "false",
        ),
    aborter: props.aborter,
    isAnkiConnectAvailable: false,
    notesManifest: undefined,
    layoutRef: undefined,
    contentRef: undefined,
    toast: { success, error, message: undefined, type: "success" },
    SAME_READING: Symbol.for("SAME_READING"),
    lookupKanjiCache: new Map(),
    nexClientPromise: Promise.withResolvers(),
    checkAnkiConnect,
    useCheckAnkiConnect,
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

export type UseGeneralContext = typeof useGeneralContext;
