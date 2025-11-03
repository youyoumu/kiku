import type { DaisyUITheme } from "./theme";

export type KikuConfig = {
  theme: DaisyUITheme;
  ankiConnectPort: number;
};

export const defaultConfig: KikuConfig = {
  theme: "coffee",
  ankiConnectPort: 8765,
};
