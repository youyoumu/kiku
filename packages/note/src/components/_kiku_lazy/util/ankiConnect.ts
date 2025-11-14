import type { KikuConfig } from "#/util/config";
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
    return await AnkiConnect.invoke("storeMediaFile", {
      filename: env.KIKU_CONFIG_FILE,
      data: base64.encodeString(JSON.stringify(config)),
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
    return sorted as Record<string, string>;
  },
};

export type AnkiConnectClient = typeof AnkiConnect;
