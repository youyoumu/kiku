import { type WebFont, webFonts } from "./fonts";
import { type DaisyUITheme, daisyUIThemes } from "./theme";

export type KikuConfig = {
  theme: DaisyUITheme;
  webFontPrimary: WebFont;
  systemFontPrimary: string;
  useSystemFontPrimary: boolean;
  webFontSecondary: WebFont;
  systemFontSecondary: string;
  useSystemFontSecondary: boolean;
  showTheme: boolean;
  showStartupTime: boolean;
  ankiConnectPort: number;
  ankiDroidEnableIntegration: boolean;
  ankiDroidReverseSwipeDirection: boolean;
  volume: number;
  swapSentenceAndDefinitionOnMobile: boolean;
  preferAnkiConnect: boolean;
  fontSizeBaseExpression: TailwindSize;
  fontSizeBasePitch: TailwindSize;
  fontSizeBaseSentence: TailwindSize;
  fontSizeBaseMiscInfo: TailwindSize;
  fontSizeBaseHint: TailwindSize;
  fontSizeSmExpression: TailwindSize;
  fontSizeSmPitch: TailwindSize;
  fontSizeSmSentence: TailwindSize;
  fontSizeSmMiscInfo: TailwindSize;
  fontSizeSmHint: TailwindSize;
};

// biome-ignore format: this looks nicer
export const defaultConfig: KikuConfig = {
  theme: "light",
  webFontPrimary: "Klee One",
  systemFontPrimary: "'Inter', 'SF Pro Display', 'Liberation Sans', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', 'Meiryo', HanaMinA, HanaMinB, sans-serif",
  useSystemFontPrimary: true,
  webFontSecondary: "IBM Plex Sans JP",
  systemFontSecondary: "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif",
  useSystemFontSecondary: true,
  showTheme: true,
  showStartupTime: true,
  ankiConnectPort: 8765,
  ankiDroidEnableIntegration: true,
  ankiDroidReverseSwipeDirection: false,
  volume: 100,
  swapSentenceAndDefinitionOnMobile: true,
  preferAnkiConnect: false,
  fontSizeBaseExpression: "5xl",
  fontSizeBasePitch: "xl",
  fontSizeBaseSentence: "2xl",
  fontSizeBaseMiscInfo: "sm",
  fontSizeBaseHint: "lg",
  fontSizeSmExpression: "6xl",
  fontSizeSmPitch: "2xl",
  fontSizeSmSentence: "4xl",
  fontSizeSmMiscInfo: "sm",
  fontSizeSmHint: "2xl",
};

//biome-ignore format: this looks nicer
export const tailwindSize = [ "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", ] as const;
export type TailwindSize = (typeof tailwindSize)[number];
//biome-ignore format: this looks nicer
export const tailwindFontSizeVar = {
  xs: { fontSize: "var(--text-xs)", lineHeight: "var(--text-xs--line-height)", },
  sm: { fontSize: "var(--text-sm)", lineHeight: "var(--text-sm--line-height)", },
  md: { fontSize: "var(--text-base)", lineHeight: "var(--text-base--line-height)", },
  lg: { fontSize: "var(--text-lg)", lineHeight: "var(--text-lg--line-height)", },
  xl: { fontSize: "var(--text-xl)", lineHeight: "var(--text-xl--line-height)", },
  "2xl": { fontSize: "var(--text-2xl)", lineHeight: "var(--text-2xl--line-height)", },
  "3xl": { fontSize: "var(--text-3xl)", lineHeight: "var(--text-3xl--line-height)", },
  "4xl": { fontSize: "var(--text-4xl)", lineHeight: "var(--text-4xl--line-height)", },
  "5xl": { fontSize: "var(--text-5xl)", lineHeight: "var(--text-5xl--line-height)", },
  "6xl": { fontSize: "var(--text-6xl)", lineHeight: "var(--text-6xl--line-height)", },
  "7xl": { fontSize: "var(--text-7xl)", lineHeight: "var(--text-7xl--line-height)", },
  "8xl": { fontSize: "var(--text-8xl)", lineHeight: "var(--text-8xl--line-height)", },
  "9xl": { fontSize: "var(--text-9xl)", lineHeight: "var(--text-9xl--line-height)", },
} as const;

const rootDatasetArray = ["theme"] as const;
export type RootDatasetKey = (typeof rootDatasetArray)[number];
export type RootDataset = Partial<Record<RootDatasetKey, string>>;
export const rootDatasetConfigWhitelist = new Set<RootDatasetKey>(
  rootDatasetArray,
);
rootDatasetConfigWhitelist.forEach((key) => {
  if (!Object.keys(defaultConfig).includes(key)) {
    throw new Error(`RootDataset key "${key}" is not in defaultConfig`);
  }
});

export function validateConfig(config: KikuConfig): KikuConfig {
  try {
    KIKU_STATE.logger.info("Validating config:", config);
    if (typeof config !== "object" || config === null) throw new Error();

    // biome-ignore format: this looks nicer
    const valid: KikuConfig = {
      theme: daisyUIThemes.includes(config.theme) ? config.theme : defaultConfig.theme,
      webFontPrimary: webFonts.includes(config.webFontPrimary) ? config.webFontPrimary : defaultConfig.webFontPrimary,
      systemFontPrimary: typeof config.systemFontPrimary === "string" ? config.systemFontPrimary : defaultConfig.systemFontPrimary,
      useSystemFontPrimary: typeof config.useSystemFontPrimary === "boolean" ? config.useSystemFontPrimary : defaultConfig.useSystemFontPrimary,
      webFontSecondary: webFonts.includes(config.webFontSecondary) ? config.webFontSecondary : defaultConfig.webFontSecondary,
      systemFontSecondary: typeof config.systemFontSecondary === "string" ? config.systemFontSecondary : defaultConfig.systemFontSecondary,
      useSystemFontSecondary: typeof config.useSystemFontSecondary === "boolean" ? config.useSystemFontSecondary : defaultConfig.useSystemFontSecondary,
      showTheme: typeof config.showTheme === "boolean" ? config.showTheme : defaultConfig.showTheme,
      showStartupTime: typeof config.showStartupTime === "boolean" ? config.showStartupTime : defaultConfig.showStartupTime,
      ankiConnectPort: typeof config.ankiConnectPort === "number" && config.ankiConnectPort > 0 && config.ankiConnectPort < 65535 ? config.ankiConnectPort : defaultConfig.ankiConnectPort,
      ankiDroidEnableIntegration: typeof config.ankiDroidEnableIntegration === "boolean" ? config.ankiDroidEnableIntegration : defaultConfig.ankiDroidEnableIntegration,
      ankiDroidReverseSwipeDirection: typeof config.ankiDroidReverseSwipeDirection === "boolean" ? config.ankiDroidReverseSwipeDirection : defaultConfig.ankiDroidReverseSwipeDirection,
      volume: typeof config.volume === "number" && config.volume >= 0 && config.volume <= 100 ? config.volume : defaultConfig.volume,
      swapSentenceAndDefinitionOnMobile: typeof config.swapSentenceAndDefinitionOnMobile === "boolean" ? config.swapSentenceAndDefinitionOnMobile : defaultConfig.swapSentenceAndDefinitionOnMobile,
      preferAnkiConnect: typeof config.preferAnkiConnect === "boolean" ? config.preferAnkiConnect : defaultConfig.preferAnkiConnect,
      fontSizeBaseExpression: tailwindSize.includes(config.fontSizeBaseExpression) ? config.fontSizeBaseExpression : defaultConfig.fontSizeBaseExpression,
      fontSizeBasePitch: tailwindSize.includes(config.fontSizeBasePitch) ? config.fontSizeBasePitch : defaultConfig.fontSizeBasePitch,
      fontSizeBaseSentence: tailwindSize.includes(config.fontSizeBaseSentence) ? config.fontSizeBaseSentence : defaultConfig.fontSizeBaseSentence,
      fontSizeBaseMiscInfo: tailwindSize.includes(config.fontSizeBaseMiscInfo) ? config.fontSizeBaseMiscInfo : defaultConfig.fontSizeBaseMiscInfo,
      fontSizeBaseHint: tailwindSize.includes(config.fontSizeBaseHint) ? config.fontSizeBaseHint : defaultConfig.fontSizeBaseHint,
      fontSizeSmExpression: tailwindSize.includes(config.fontSizeSmExpression) ? config.fontSizeSmExpression : defaultConfig.fontSizeSmExpression,
      fontSizeSmPitch: tailwindSize.includes(config.fontSizeSmPitch) ? config.fontSizeSmPitch : defaultConfig.fontSizeSmPitch,
      fontSizeSmSentence: tailwindSize.includes(config.fontSizeSmSentence) ? config.fontSizeSmSentence : defaultConfig.fontSizeSmSentence,
      fontSizeSmMiscInfo: tailwindSize.includes(config.fontSizeSmMiscInfo) ? config.fontSizeSmMiscInfo : defaultConfig.fontSizeSmMiscInfo,
      fontSizeSmHint: tailwindSize.includes(config.fontSizeSmHint) ? config.fontSizeSmHint : defaultConfig.fontSizeSmHint,
    };

    return valid;
  } catch {
    return defaultConfig;
  }
}

export type CssVar = {
  "--font-primary": string;
  "--font-secondary": string;

  "--font-size-base-expression": string;
  "--line-height-base-expression": string;
  "--font-size-base-pitch": string;
  "--line-height-base-pitch": string;
  "--font-size-base-sentence": string;
  "--line-height-base-sentence": string;
  "--font-size-base-misc-info": string;
  "--line-height-base-misc-info": string;
  "--font-size-base-hint": string;
  "--line-height-base-hint": string;

  "--font-size-sm-expression": string;
  "--line-height-sm-expression": string;
  "--font-size-sm-pitch": string;
  "--line-height-sm-pitch": string;
  "--font-size-sm-sentence": string;
  "--line-height-sm-sentence": string;
  "--font-size-sm-misc-info": string;
  "--line-height-sm-misc-info": string;
  "--font-size-sm-hint": string;
  "--line-height-sm-hint": string;
};

// biome-ignore format: this looks nicer
export type Dataset = {
  "data-theme": string;
  //
  "data-field": string;
  "data-transition": "true" | "false";
  "data-tags": string;
  "data-nsfw": "true" | "false";
  "data-is-even": "true" | "false";
  "data-has-pitch": string
  "data-has-hint": string
};

export type DatasetProp = Partial<Dataset>;

export function getCssVar(config: KikuConfig) {
  //biome-ignore format: this looks nicer
  const cssVar: CssVar = {
    "--font-primary": config.useSystemFontPrimary ? config.systemFontPrimary : config.webFontPrimary,
    "--font-secondary": config.useSystemFontSecondary ? config.systemFontSecondary : config.webFontSecondary,

    "--font-size-base-expression": tailwindFontSizeVar[config.fontSizeBaseExpression].fontSize,
    "--line-height-base-expression": tailwindFontSizeVar[config.fontSizeBaseExpression].lineHeight,
    "--font-size-base-pitch": tailwindFontSizeVar[config.fontSizeBasePitch].fontSize,
    "--line-height-base-pitch": tailwindFontSizeVar[config.fontSizeBasePitch].lineHeight,
    "--font-size-base-sentence": tailwindFontSizeVar[config.fontSizeBaseSentence].fontSize,
    "--line-height-base-sentence": tailwindFontSizeVar[config.fontSizeBaseSentence].lineHeight,
    "--font-size-base-misc-info": tailwindFontSizeVar[config.fontSizeBaseMiscInfo].fontSize,
    "--line-height-base-misc-info": tailwindFontSizeVar[config.fontSizeBaseMiscInfo].lineHeight,
    "--font-size-base-hint": tailwindFontSizeVar[config.fontSizeBaseHint].fontSize,
    "--line-height-base-hint": tailwindFontSizeVar[config.fontSizeBaseHint].lineHeight,

    "--font-size-sm-expression": tailwindFontSizeVar[config.fontSizeSmExpression].fontSize,
    "--line-height-sm-expression": tailwindFontSizeVar[config.fontSizeSmExpression].lineHeight,
    "--font-size-sm-pitch": tailwindFontSizeVar[config.fontSizeSmPitch].fontSize,
    "--line-height-sm-pitch": tailwindFontSizeVar[config.fontSizeSmPitch].lineHeight,
    "--font-size-sm-sentence": tailwindFontSizeVar[config.fontSizeSmSentence].fontSize,
    "--line-height-sm-sentence": tailwindFontSizeVar[config.fontSizeSmSentence].lineHeight,
    "--font-size-sm-misc-info": tailwindFontSizeVar[config.fontSizeSmMiscInfo].fontSize,
    "--line-height-sm-misc-info": tailwindFontSizeVar[config.fontSizeSmMiscInfo].lineHeight,
    "--font-size-sm-hint": tailwindFontSizeVar[config.fontSizeSmHint].fontSize,
    "--line-height-sm-hint": tailwindFontSizeVar[config.fontSizeSmHint].lineHeight,
  };

  return cssVar;
}

export function updateConfigState(el: HTMLElement, config: KikuConfig) {
  if (document.documentElement.getAttribute("data-theme") !== "none") {
    document.documentElement.setAttribute("data-theme", config.theme);
  }
  el.dataset.theme = config.theme;

  const cssVar = getCssVar(config);
  Object.entries(cssVar).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
    el.style.setProperty(key, value);
  });
}

export function generateCssVars(vars: Record<string, string>): string {
  const lines = Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join("\n");

  return `:root,\n:host {\n${lines}\n}`;
}
