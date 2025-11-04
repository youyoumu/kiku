import type { DaisyUITheme } from "./theme";

export type KikuConfig = {
  theme: DaisyUITheme;
  font: string;
  ankiConnectPort: number;
};

export const defaultConfig: KikuConfig = {
  theme: "coffee",
  font: "Noto Serif JP",
  ankiConnectPort: 8765,
};
