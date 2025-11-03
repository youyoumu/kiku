import { base64 } from "./base64";
import { env } from "./env";
import type { DaisyUITheme } from "./theme";

export async function callAnkiConnect<T extends string>(
  action: string,
  params: Record<string, unknown> = {},
): Promise<T> {
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
}

type KikuConfig = {
  theme: DaisyUITheme;
  ankiConnectPort: number;
};

export async function getAnkiConnectVersion() {
  return await callAnkiConnect("version");
}

export async function saveConfig(config: KikuConfig) {
  await callAnkiConnect("storeMediaFile", {
    filename: env.KIKU_CONFIG_FILE,
    data: base64.encodeString(JSON.stringify(config)),
  });
}
