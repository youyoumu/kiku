/* @refresh reload */
import { render } from "solid-js/web";
import { Back } from "./components/Back.tsx";
import { type AnkiFields, exampleFields6 } from "./types.ts";
import "./tailwind.css";
import { createStore } from "solid-js/store";
import { Front } from "./components/Front.tsx";
import {
  AnkiFieldContextProvider,
  BreakpointContextProvider,
  ConfigContextProvider,
} from "./components/shared/Context.tsx";
import { type KikuConfig, validateConfig } from "./util/config.ts";
import { type OnlineFont, setOnlineFont } from "./util/fonts.ts";
import { env } from "./util/general.ts";

declare global {
  interface Window {
    KIKU_STATE: {
      relax?: boolean;
      shadow?: ShadowRoot;
      initDelay?: number;
    };
  }
}
window.KIKU_STATE = {};

export async function init({ side }: { side: "front" | "back" }) {
  try {
    const root = document.getElementById("root");
    if (!root) throw new Error("root not found");
    const shadow = root.attachShadow({ mode: "closed" });
    window.KIKU_STATE.shadow = shadow;
    let divs: NodeListOf<Element> | Element[] =
      document.querySelectorAll("#anki-fields > div");

    if (import.meta.env.DEV) {
      divs = Object.entries(exampleFields6).map(([key, value]) => {
        const div = document.createElement("div");
        div.dataset.field = key;
        div.innerHTML = value;
        return div;
      });

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "/src/tailwind.css";
      const link2 = link.cloneNode();
      document.head.appendChild(link);
      shadow.appendChild(link2);
    } else {
      const qa = document.getElementById("qa");
      const style = qa?.querySelector("style");
      if (style) {
        shadow.appendChild(style.cloneNode(true));
      }
    }

    let config_: KikuConfig;
    try {
      config_ = validateConfig(
        await (await fetch(env.KIKU_CONFIG_FILE)).json(),
      );
    } catch (e) {
      throw new Error("Failed to load config", { cause: e });
    }

    const ankiFields = Object.fromEntries(
      Array.from(divs).map((el) => [
        (el as HTMLDivElement).dataset.field,
        el.innerHTML.trim(),
      ]),
    ) as AnkiFields;

    console.log("DEBUG[876]: ankiFields=", ankiFields);

    document.documentElement.setAttribute("data-theme", config_.theme);
    root.setAttribute("data-theme", config_.theme);
    setOnlineFont(config_.onlineFont as OnlineFont);

    const [config, setConfig] = createStore(config_);

    window.KIKU_STATE.relax = false;
    if (side === "front") {
      render(
        () => (
          <BreakpointContextProvider>
            <AnkiFieldContextProvider value={{ ankiFields }}>
              <ConfigContextProvider value={[config, setConfig]}>
                <Front />
              </ConfigContextProvider>
            </AnkiFieldContextProvider>
          </BreakpointContextProvider>
        ),
        shadow,
      );
    } else if (side === "back") {
      render(
        () => (
          <BreakpointContextProvider>
            <AnkiFieldContextProvider value={{ ankiFields }}>
              <ConfigContextProvider value={[config, setConfig]}>
                <Back />
              </ConfigContextProvider>
            </AnkiFieldContextProvider>
          </BreakpointContextProvider>
        ),
        shadow,
      );
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
