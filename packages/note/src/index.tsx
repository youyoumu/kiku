/* @refresh reload */
import { createStore } from "solid-js/store";
import { hydrate, render } from "solid-js/web";
import { Back } from "./components/Back.tsx";
import { Front } from "./components/Front.tsx";
import { BreakpointContextProvider } from "./components/shared/BreakpointContext.tsx";
import {
  defaultConfig,
  type KikuConfig,
  updateConfigState,
  validateConfig,
} from "./util/config.ts";
import { env } from "./util/general.ts";
import "./styles/tailwind.css";
import { AnkiFieldContextProvider } from "./components/shared/AnkiFieldsContext.tsx";
import { CardStoreContextProvider } from "./components/shared/CardContext.tsx";
import { ConfigContextProvider } from "./components/shared/ConfigContext.tsx";
import { FieldGroupContextProvider } from "./components/shared/FieldGroupContext.tsx";
import { GeneralContextProvider } from "./components/shared/GeneralContext.tsx";
import { Logger } from "./util/logger.ts";

const logger = new Logger();
logger.attachToGlobalErrors();

globalThis.KIKU_STATE = {
  isAnkiWeb: window.location.origin.includes("ankiuser.net"),
  assetsPath: window.location.origin,
  logger,
  isAnkiDesktop: typeof pycmd !== "undefined",
};

export async function init({
  side,
  ssr,
}: {
  side: "front" | "back";
  ssr?: boolean;
}) {
  try {
    if (KIKU_STATE.isAnkiWeb) {
      logger.info("AnkiWeb detected");
      document.documentElement.setAttribute("data-theme", "none");
      KIKU_STATE.assetsPath = `${window.location.origin}/study/media`;
      const kikuCss = document.getElementById("kiku-css");
      kikuCss?.remove();
    }

    const root = document.getElementById("kiku-root");
    if (!root) {
      const shadowParent = document.querySelector("#kiku-shadow-parent");
      if (shadowParent) return;
      throw new Error("root not found");
    }
    root.part.add("root-part");
    KIKU_STATE.root = root;
    logger.debug("rootDataset", root.dataset);

    const qa = document.querySelector("#qa");
    const shadowParent = document.createElement("div");
    shadowParent.setAttribute("id", "kiku-shadow-parent");
    qa?.appendChild(shadowParent);
    const shadow = shadowParent.attachShadow({ mode: "open" });
    const style = qa?.querySelector("style");
    if (style) shadow?.appendChild(style.cloneNode(true));
    const tailwind = document.querySelector(
      "[data-vite-dev-id='/home/yym/repos/kiku/packages/note/src/styles/tailwind.css']",
    );
    if (tailwind) {
      shadow?.appendChild(tailwind.cloneNode(true));
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "./_kiku.css";
      shadow?.prepend(link);
    }
    shadow?.appendChild(root);

    let config$: KikuConfig;
    try {
      const cache = sessionStorage.getItem(env.KIKU_CONFIG_SESSION_STORAGE_KEY);
      if (cache) {
        logger.info("config cache hit:", cache);
        config$ = validateConfig(JSON.parse(cache));
      } else {
        logger.info("config cache miss");
        config$ = validateConfig(
          await (
            await fetch(env.KIKU_CONFIG_FILE, { cache: "no-store" })
          ).json(),
        );
        sessionStorage.setItem(
          env.KIKU_CONFIG_SESSION_STORAGE_KEY,
          JSON.stringify(config$),
        );
      }
    } catch {
      logger.warn("Failed to load config, using default config");
      config$ = defaultConfig;
    }

    updateConfigState(root, config$);

    const [config, setConfig] = createStore(config$);
    KIKU_STATE.relax = false;

    if (side === "front") {
      const App = () => (
        <GeneralContextProvider>
          <AnkiFieldContextProvider>
            <CardStoreContextProvider side="front">
              <BreakpointContextProvider>
                <ConfigContextProvider value={[config, setConfig]}>
                  <FieldGroupContextProvider>
                    <Front />
                  </FieldGroupContextProvider>
                </ConfigContextProvider>
              </BreakpointContextProvider>
            </CardStoreContextProvider>
          </AnkiFieldContextProvider>
        </GeneralContextProvider>
      );
      if (ssr) return hydrate(App, root);
      render(App, root);
    } else if (side === "back") {
      const App = () => (
        <GeneralContextProvider>
          <AnkiFieldContextProvider>
            <CardStoreContextProvider side="back">
              <BreakpointContextProvider>
                <ConfigContextProvider value={[config, setConfig]}>
                  <FieldGroupContextProvider>
                    <Back />
                  </FieldGroupContextProvider>
                </ConfigContextProvider>
              </BreakpointContextProvider>
            </CardStoreContextProvider>
          </AnkiFieldContextProvider>
        </GeneralContextProvider>
      );
      if (ssr) return hydrate(App, root);
      render(App, root);
    }
  } catch (e) {
    Object.assign(document.body.style, {
      margin: 0,
      padding: 0,
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000",
      color: "#f00",
      textAlign: "center",
    });

    const isError = e instanceof Error;

    document.body.innerHTML = isError
      ? `
        <span>Failed to render card.</span>
        <span><b>Error Name:</b> ${e.name}</span>
        <span><b>Error Message:</b> ${e.message}</span>
        <span><b>Error Cause:</b> ${e.cause ?? "N/A"}</span>
        <span><b>Error Stack:</b><br>
          <pre style="white-space: pre-wrap; background: #f3f4f6; padding: 8px;">
            ${e.stack}
          </pre>
        </span>
      `
      : `<span>Something went wrong.</span>`;
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
