/* @refresh reload */
import { hydrate, render } from "solid-js/web";
import { Back } from "./components/Back.tsx";
import { type AnkiFields, exampleFields6 } from "./types.ts";
import "./tailwind.css";
import { createStore } from "solid-js/store";
import type { ResponsiveFontSize } from "./components/_kiku_lazy/util/tailwind.ts";
import { Front } from "./components/Front.tsx";
import {
  AnkiFieldContextProvider,
  BreakpointContextProvider,
  ConfigContextProvider,
} from "./components/shared/Context.tsx";
import {
  type KikuConfig,
  updateConfigDataset,
  validateConfig,
} from "./util/config.ts";
import { env } from "./util/general.ts";
import type { DaisyUITheme } from "./util/theme.ts";

declare global {
  var KIKU_STATE: {
    relax?: boolean;
    initDelay?: number;
    config?: KikuConfig;
    root?: HTMLElement;
    rootDataset: Partial<KikuConfig> & Partial<{ fontFamily: string }>;
  };
}
globalThis.KIKU_STATE = {
  rootDataset: {},
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

    const rootDataset = { ...root.dataset };
    // biome-ignore format: this looks nicer
    (() => {
    globalThis.KIKU_STATE.rootDataset.theme = rootDataset.theme as DaisyUITheme;
    globalThis.KIKU_STATE.rootDataset.fontFamily = rootDataset.fontFamily;
    globalThis.KIKU_STATE.rootDataset.fontSizeBaseExpression = rootDataset.fontSizeBaseExpression as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeBasePitch = rootDataset.fontSizeBasePitch as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeBaseSentence = rootDataset.fontSizeBaseSentence as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeBaseMiscInfo = rootDataset.fontSizeBaseMiscInfo as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeBaseHint = rootDataset.fontSizeBaseHint as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeSmExpression = rootDataset.fontSizeSmExpression as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeSmPitch = rootDataset.fontSizeSmPitch as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeSmSentence = rootDataset.fontSizeSmSentence as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeSmMiscInfo = rootDataset.fontSizeSmMiscInfo as ResponsiveFontSize;
    globalThis.KIKU_STATE.rootDataset.fontSizeSmHint = rootDataset.fontSizeSmHint as ResponsiveFontSize;
    })()
    updateConfigDataset(root, config$);

    let divs: NodeListOf<Element> | Element[] =
      document.querySelectorAll("#anki-fields > div");
    if (import.meta.env.DEV) {
      divs = Object.entries(exampleFields6).map(([key, value]) => {
        const div = document.createElement("div");
        div.dataset.field = key;
        div.innerHTML = value;
        return div;
      });
    }
    const ankiFields = Object.fromEntries(
      Array.from(divs).map((el) => [
        (el as HTMLDivElement).dataset.field,
        el.innerHTML.trim(),
      ]),
    ) as AnkiFields;

    console.log("DEBUG[876]: ankiFields=", ankiFields);
    const [config, setConfig] = createStore(config$);
    window.KIKU_STATE.relax = false;

    if (side === "front") {
      const App = () => (
        <BreakpointContextProvider>
          <AnkiFieldContextProvider value={{ ankiFields }}>
            <ConfigContextProvider value={[config, setConfig]}>
              <Front />
            </ConfigContextProvider>
          </AnkiFieldContextProvider>
        </BreakpointContextProvider>
      );
      if (ssr) return hydrate(App, root);
      render(App, root);
    } else if (side === "back") {
      const App = () => (
        <BreakpointContextProvider>
          <ConfigContextProvider value={[config, setConfig]}>
            <Back />
          </ConfigContextProvider>
        </BreakpointContextProvider>
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
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string),
  });
  // @ts-expect-error
  const side = params.side;
  init({ side: side ?? "back" });
}
