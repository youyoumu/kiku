import type { KikuConfig } from "./config";
import { base64 } from "./general";
import { env } from "./general.ts";

export const AnkiConnect = {
  call: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch("http://127.0.0.1:8765", {
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
    return await AnkiConnect.call("version");
  },

  saveConfig: async (config: KikuConfig) => {
    return await AnkiConnect.call("storeMediaFile", {
      filename: env.KIKU_CONFIG_FILE,
      data: base64.encodeString(JSON.stringify(config)),
    });
  },
};
