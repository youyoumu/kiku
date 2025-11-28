import { generateCssVars, getCssVar, type KikuConfig } from "#/util/config";
import { env } from "#/util/general";

export const base64 = {
  decode: (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0)),
  encode: (b: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(b))),
  decodeToString: (s: string) => new TextDecoder().decode(base64.decode(s)),
  encodeString: (s: string) =>
    base64.encode(new TextEncoder().encode(s).buffer),
};

let ankiConnectPort = 8765;

export const AnkiConnect = {
  changePort: (port: number) => {
    ankiConnectPort = port;
  },

  invoke: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch(`http://127.0.0.1:${ankiConnectPort}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version: 6, params }),
    });

    const result = await res.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  },

  getVersion: async () => {
    return await AnkiConnect.invoke("version");
  },

  saveConfig: async (config: KikuConfig) => {
    await AnkiConnect.invoke("storeMediaFile", {
      filename: env.KIKU_CONFIG_FILE,
      data: base64.encodeString(JSON.stringify(config)),
    });

    const [frontRes, backRes, styleRes] = await Promise.all([
      fetch(env.KIKU_FRONT_FILE, { cache: "no-store" }),
      fetch(env.KIKU_BACK_FILE, { cache: "no-store" }),
      fetch(env.KIKU_STYLE_FILE, { cache: "no-store" }),
    ]);

    if (!frontRes.ok || !backRes.ok || !styleRes.ok) {
      throw new Error(
        `Failed to load template files: ${[
          !frontRes.ok && env.KIKU_FRONT_FILE,
          !backRes.ok && env.KIKU_BACK_FILE,
          !styleRes.ok && env.KIKU_STYLE_FILE,
        ]
          .filter(Boolean)
          .join(", ")}`,
      );
    }

    const [frontSrc, backSrc, styleSrc] = await Promise.all([
      frontRes.text(),
      backRes.text(),
      styleRes.text(),
    ]);

    const frontTemplate = frontSrc
      .replace("__DATA_THEME__", config.theme)
      .replace("__DATA_BLUR_NSFW__", config.blurNsfw ? "true" : "false");
    const backTemplate = backSrc
      .replace("__DATA_THEME__", config.theme)
      .replace("__DATA_BLUR_NSFW__", config.blurNsfw ? "true" : "false");
    const cssVar = getCssVar(config);
    const cssVarTemplate = generateCssVars(cssVar);
    const styleTemplate = styleSrc.replace(
      "/* __CSS_VARIABLE__ */",
      cssVarTemplate,
    );

    await AnkiConnect.invoke("updateModelTemplates", {
      model: {
        name: env.KIKU_NOTE_TYPE,
        templates: {
          [env.KIKU_CARD_TYPE]: {
            Front: frontTemplate,
            Back: backTemplate,
          },
        },
      },
    });

    await AnkiConnect.invoke("updateModelStyling", {
      model: {
        name: env.KIKU_NOTE_TYPE,
        css: styleTemplate,
      },
    });
  },

  getKikuFiles: async () => {
    const res = await AnkiConnect.invoke("getMediaFilesNames", {
      pattern: "_kiku*",
    });
    const sorted = res.result.sort((a: string, b: string) => {
      // Extract the last extension (e.g. "json", "js", "gz")
      const extA = a.split(".").pop();
      const extB = b.split(".").pop();

      if (extA !== extB) {
        return extA?.localeCompare(extB ?? "");
      }

      // Compare alphabetically by full name
      return a.localeCompare(b);
    });
    return sorted as string[];
  },
};

export type AnkiConnectClient = typeof AnkiConnect;
