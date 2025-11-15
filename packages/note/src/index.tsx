/* @refresh reload */
import { createStore } from "solid-js/store";
import { hydrate, render } from "solid-js/web";
import { Back } from "./components/Back.tsx";
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
  updateConfigState,
  validateConfig,
} from "./util/config.ts";
import { env } from "./util/general.ts";
import "./styles/tailwind.css";
import { Logger } from "./util/logger.ts";

const logger = new Logger();

declare global {
  var KIKU_STATE: {
    relax?: boolean;
    startupTime?: number;
    root?: HTMLElement;
    isAnkiWeb?: boolean;
    assetsPath: string;
    logger: Logger;
  };
  var pycmd: () => void;
}
globalThis.KIKU_STATE = {
  isAnkiWeb: window.location.origin.includes("ankiuser.net"),
  assetsPath: window.location.origin,
  logger,
};

export function attachGlobalErrorHandlers(logger: Logger) {
  // 1 Catch runtime errors (syntax, thrown errors, etc.)
  window.addEventListener("error", (event) => {
    logger.error("GlobalError:", event.message, {
      file: event.filename,
      line: event.lineno,
      col: event.colno,
      error: event.error?.stack ?? String(event.error),
    });
  });

  // 2 Catch unhandled Promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    logger.error("UnhandledRejection:", {
      reason: event.reason instanceof Error ? event.reason.stack : event.reason,
    });
  });

  // 3 Optional: Catch console.error calls
  const originalConsoleError = console.error;
  console.error = (...args: unknown[]) => {
    logger.error("ConsoleError:", ...args);
    originalConsoleError.apply(console, args);
  };
}

attachGlobalErrorHandlers(logger);

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

    const root =
      document.getElementById("root") ??
      document.querySelector("[data-kiku-root]");
    if (!root) throw new Error("root not found");
    KIKU_STATE.root = root;
    logger.debug("rootDataset", root.dataset);

    const qa = document.querySelector("#qa");
    if (qa?.shadowRoot) qa.shadowRoot.innerHTML = "";
    const shadow = qa?.shadowRoot ?? qa?.attachShadow({ mode: "open" });
    shadow?.appendChild(root);
    const tailwind = document.querySelector(
      "[data-vite-dev-id='/home/yym/repos/kiku/packages/note/src/styles/tailwind.css']",
    );
    if (tailwind) {
      shadow?.appendChild(tailwind.cloneNode(true));
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "./_kiku.css";
      shadow?.appendChild(link);
    }

    let config$: KikuConfig;
    try {
      const cache = sessionStorage.getItem("kiku-config");
      if (cache) {
        logger.info("config cache hit");
        config$ = JSON.parse(cache);
      } else {
        logger.info("config cache miss");
        config$ = validateConfig(
          await (
            await fetch(env.KIKU_CONFIG_FILE, { cache: "no-store" })
          ).json(),
        );
        sessionStorage.setItem("kiku-config", JSON.stringify(config$));
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
        <AnkiFieldContextProvider>
          <CardStoreContextProvider side="front">
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
        <AnkiFieldContextProvider>
          <CardStoreContextProvider side="back">
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
  const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop as string),
  });
  // @ts-expect-error
  const side = params.side;
  init({ side: side ?? "back" });
}
