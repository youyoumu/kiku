/* @refresh reload */
import { hydrate, render } from "solid-js/web";
import { Back } from "./components/Back.tsx";
import "./tailwind.css";
import { createStore } from "solid-js/store";
import { Front } from "./components/Front.tsx";
import {
  AnkiFieldContextProvider,
  BreakpointContextProvider,
  CardStoreContextProvider,
  ConfigContextProvider,
} from "./components/shared/Context.tsx";
import {
  defaultConfig,
  type KikuConfig,
  updateConfigDataset,
  validateConfig,
} from "./util/config.ts";
import { env, getAnkiFields } from "./util/general.ts";

declare global {
  var KIKU_STATE: {
    relax?: boolean;
    initDelay?: number;
    config?: KikuConfig;
    root?: HTMLElement;
    rootDataset: KikuConfig;
  };
}
globalThis.KIKU_STATE = {
  rootDataset: defaultConfig,
};

export async function init({
  side,
  ssr,
}: {
  side: "front" | "back";
  ssr?: boolean;
}) {
  try {
    const root =
      document.getElementById("root") ??
      document.querySelector("[data-kiku-root]");
    if (!root) throw new Error("root not found");
    globalThis.KIKU_STATE.root = root;

    let config$: KikuConfig;
    try {
      if (globalThis.KIKU_STATE.config) config$ = globalThis.KIKU_STATE.config;
      config$ = validateConfig(
        await (await fetch(env.KIKU_CONFIG_FILE)).json(),
      );
      globalThis.KIKU_STATE.config = config$;
    } catch (e) {
      throw new Error("Failed to load config", { cause: e });
    }

    const rootDataset = { ...root.dataset } as KikuConfig;
    // biome-ignore format: this looks nicer
    (() => {
      const rootDataset$: KikuConfig = {
        kikuRoot: rootDataset.kikuRoot,
        theme: rootDataset.theme,
        webFontPrimary: rootDataset.webFontPrimary,
        systemFontPrimary: rootDataset.systemFontPrimary,
        useSystemFontPrimary: rootDataset.useSystemFontPrimary,
        webFontSecondary: rootDataset.webFontSecondary,
        systemFontSecondary: rootDataset.systemFontSecondary,
        useSystemFontSecondary: rootDataset.useSystemFontSecondary,
        ankiConnectPort: rootDataset.ankiConnectPort,
        fontSizeBaseExpression: rootDataset.fontSizeBaseExpression,
        fontSizeBasePitch: rootDataset.fontSizeBasePitch,
        fontSizeBaseSentence: rootDataset.fontSizeBaseSentence,
        fontSizeBaseMiscInfo: rootDataset.fontSizeBaseMiscInfo,
        fontSizeBaseHint: rootDataset.fontSizeBaseHint,
        fontSizeSmExpression: rootDataset.fontSizeSmExpression,
        fontSizeSmPitch: rootDataset.fontSizeSmPitch,
        fontSizeSmSentence: rootDataset.fontSizeSmSentence,
        fontSizeSmMiscInfo: rootDataset.fontSizeSmMiscInfo,
        fontSizeSmHint: rootDataset.fontSizeSmHint,
      };
      globalThis.KIKU_STATE.rootDataset = rootDataset$;
    })();
    updateConfigDataset(root, config$);

    const [config, setConfig] = createStore(config$);
    const ankiFields = getAnkiFields();
    window.KIKU_STATE.relax = false;

    if (side === "front") {
      const App = () => (
        <AnkiFieldContextProvider value={{ ankiFields }}>
          <CardStoreContextProvider>
            <BreakpointContextProvider>
              <ConfigContextProvider value={[config, setConfig]}>
                <Front />
              </ConfigContextProvider>
            </BreakpointContextProvider>
          </CardStoreContextProvider>
        </AnkiFieldContextProvider>
      );
      if (ssr) return hydrate(App, root);
      render(App, root);
    } else if (side === "back") {
      const App = () => (
        <AnkiFieldContextProvider value={{ ankiFields }}>
          <CardStoreContextProvider>
            <BreakpointContextProvider>
              <ConfigContextProvider value={[config, setConfig]}>
                <Back />
              </ConfigContextProvider>
            </BreakpointContextProvider>
          </CardStoreContextProvider>
        </AnkiFieldContextProvider>
      );
      if (ssr) return hydrate(App, root);
      render(App, root);
    }
  } catch (e) {
    document.body.style.margin = "0";
    document.body.style.padding = "0";
    document.body.style.height = "100vh";
    document.body.style.width = "100vw";
    document.body.style.display = "flex";
    document.body.style.flexDirection = "column";
    document.body.style.justifyContent = "center";
    document.body.style.alignItems = "center";
    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ff0000";
    document.body.style.textAlign = "center";

    const error =
      e instanceof Error
        ? `
      <span>Failed to render card.</span>
      <span><b>Error Name:</b> ${e.name}</span>
      <span><b>Error Message:</b> ${e.message}</span>
      <span><b>Error Cause:</b> ${e.cause ?? "N/A"}</span>
      <span><b>Error Stack:</b><br><pre style="white-space: pre-wrap; background: #f3f4f6; padding: 8px;">${e.stack}</pre></span>
    `
        : `<span>Something went wrong.</span>`;

    document.body.innerHTML = error;
  }
}

if (import.meta.env.DEV) {
  // const fonts = [
  //   "Hina+Mincho",
  //   "Klee+One",
  //   "Noto+Sans+JP",
  //   "Noto+Serif+JP",
  //   "IBM+Plex+Sans+JP",
  // ];
  //
  // for (const font of fonts) {
  //   const link = document.createElement("link");
  //   link.rel = "stylesheet";
  //   link.href = `https://fonts.googleapis.com/css2?family=${font}&display=swap`;
  //   document.head.appendChild(link);
  // }
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string),
  });
  // @ts-expect-error
  const side = params.side;
  init({ side: side ?? "back" });
}
