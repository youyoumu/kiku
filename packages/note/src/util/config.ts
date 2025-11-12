import type { ResponsiveFontSize } from "#/components/_kiku_lazy/util/tailwind";
import { type WebFont, webFonts } from "./fonts";
import { type DaisyUITheme, daisyUIThemes } from "./theme";

export type KikuConfig = {
  kikuRoot: "true";
  theme: DaisyUITheme;
  webFontPrimary: WebFont;
  systemFontPrimary: string;
  useSystemFontPrimary: "true" | "false";
  webFontSecondary: WebFont;
  systemFontSecondary: string;
  useSystemFontSecondary: "true" | "false";
  ankiConnectPort: string;
  fontSizeBaseExpression: ResponsiveFontSize;
  fontSizeBasePitch: ResponsiveFontSize;
  fontSizeBaseSentence: ResponsiveFontSize;
  fontSizeBaseMiscInfo: ResponsiveFontSize;
  fontSizeBaseHint: ResponsiveFontSize;
  fontSizeSmExpression: ResponsiveFontSize;
  fontSizeSmPitch: ResponsiveFontSize;
  fontSizeSmSentence: ResponsiveFontSize;
  fontSizeSmMiscInfo: ResponsiveFontSize;
  fontSizeSmHint: ResponsiveFontSize;
};

// biome-ignore format: this looks nicer
export const defaultConfig: KikuConfig = {
  kikuRoot: "true",
  theme: "light",
  webFontPrimary: "Klee One",
  systemFontPrimary: "'Inter', 'SF Pro Display', 'Liberation Sans', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', 'Meiryo', HanaMinA, HanaMinB, sans-serif",
  useSystemFontPrimary: "true",
  webFontSecondary: "IBM Plex Sans JP",
  systemFontSecondary: "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif",
  useSystemFontSecondary: "true",
  ankiConnectPort: "8765",
  fontSizeBaseExpression: "text-5xl",
  fontSizeBasePitch: "text-xl",
  fontSizeBaseSentence: "text-2xl",
  fontSizeBaseMiscInfo: "text-sm",
  fontSizeBaseHint: "text-lg",
  fontSizeSmExpression: "sm:text-6xl",
  fontSizeSmPitch: "sm:text-2xl",
  fontSizeSmSentence: "sm:text-4xl",
  fontSizeSmMiscInfo: "sm:text-sm",
  fontSizeSmHint: "sm:text-2xl",
};

// biome-ignore format: this looks nicer
export const tailwindResponsiveFontSizes = [
  "text-xs", "text-sm", "text-base", "text-lg", "text-xl", "text-2xl", "text-3xl", "text-4xl",
  "text-5xl", "text-6xl", "text-7xl", "text-8xl", "text-9xl", "sm:text-xs", "sm:text-sm", "sm:text-base",
  "sm:text-lg", "sm:text-xl", "sm:text-2xl", "sm:text-3xl", "sm:text-4xl", "sm:text-5xl", "sm:text-6xl", "sm:text-7xl",
  "sm:text-8xl", "sm:text-9xl", "md:text-xs", "md:text-sm", "md:text-base", "md:text-lg", "md:text-xl", "md:text-2xl",
  "md:text-3xl", "md:text-4xl", "md:text-5xl", "md:text-6xl", "md:text-7xl", "md:text-8xl", "md:text-9xl", "lg:text-xs",
  "lg:text-sm", "lg:text-base", "lg:text-lg", "lg:text-xl", "lg:text-2xl", "lg:text-3xl", "lg:text-4xl", "lg:text-5xl",
  "lg:text-6xl", "lg:text-7xl", "lg:text-8xl", "lg:text-9xl", "xl:text-xs", "xl:text-sm", "xl:text-base", "xl:text-lg",
  "xl:text-xl", "xl:text-2xl", "xl:text-3xl", "xl:text-4xl", "xl:text-5xl", "xl:text-6xl", "xl:text-7xl", "xl:text-8xl",
  "xl:text-9xl", "2xl:text-xs", "2xl:text-sm", "2xl:text-base", "2xl:text-lg", "2xl:text-xl", "2xl:text-2xl", "2xl:text-3xl",
  "2xl:text-4xl", "2xl:text-5xl", "2xl:text-6xl", "2xl:text-7xl", "2xl:text-8xl", "2xl:text-9xl",
];
export const tailwindResponsiveFontSizesSet = new Set(
  tailwindResponsiveFontSizes,
);
export type TailwindResponsiveFontSize =
  (typeof tailwindResponsiveFontSizes)[number];

function validateResponsiveFontSize(
  value: ResponsiveFontSize,
  fallback: ResponsiveFontSize,
): ResponsiveFontSize {
  if (tailwindResponsiveFontSizesSet.has(value)) return value;
  return fallback;
}

export function validateConfig(config: KikuConfig): KikuConfig {
  try {
    if (typeof config !== "object" || config === null) throw new Error();

    // biome-ignore format: this looks nicer
    const valid: KikuConfig = {
      kikuRoot: "true",
      theme: daisyUIThemes.includes(config.theme) ? config.theme : defaultConfig.theme,
      webFontPrimary: webFonts.includes(config.webFontPrimary) ? config.webFontPrimary : defaultConfig.webFontPrimary,
      systemFontPrimary: typeof config.systemFontPrimary === "string" ? config.systemFontPrimary : defaultConfig.systemFontPrimary,
      useSystemFontPrimary: typeof config.useSystemFontPrimary === "string" && config.useSystemFontPrimary === "true" ? "true" : defaultConfig.useSystemFontPrimary,
      webFontSecondary: webFonts.includes(config.webFontSecondary) ? config.webFontSecondary : defaultConfig.webFontSecondary,
      systemFontSecondary: typeof config.systemFontSecondary === "string" ? config.systemFontSecondary : defaultConfig.systemFontSecondary,
      useSystemFontSecondary: typeof config.useSystemFontSecondary === "string" && config.useSystemFontSecondary === "true" ? "true" : defaultConfig.useSystemFontSecondary,
      ankiConnectPort: typeof config.ankiConnectPort === "number" && config.ankiConnectPort > 0 ? config.ankiConnectPort : defaultConfig.ankiConnectPort,
      fontSizeBaseExpression: validateResponsiveFontSize( config.fontSizeBaseExpression, defaultConfig.fontSizeBaseExpression,),
      fontSizeBasePitch: validateResponsiveFontSize( config.fontSizeBasePitch, defaultConfig.fontSizeBasePitch,),
      fontSizeBaseSentence: validateResponsiveFontSize( config.fontSizeBaseSentence, defaultConfig.fontSizeBaseSentence,),
      fontSizeBaseMiscInfo: validateResponsiveFontSize( config.fontSizeBaseMiscInfo, defaultConfig.fontSizeBaseMiscInfo,),
      fontSizeBaseHint: validateResponsiveFontSize( config.fontSizeBaseHint, defaultConfig.fontSizeBaseHint,),
      fontSizeSmExpression: validateResponsiveFontSize( config.fontSizeSmExpression, defaultConfig.fontSizeSmExpression,),
      fontSizeSmPitch: validateResponsiveFontSize( config.fontSizeSmPitch, defaultConfig.fontSizeSmPitch,),
      fontSizeSmSentence: validateResponsiveFontSize( config.fontSizeSmSentence, defaultConfig.fontSizeSmSentence,),
      fontSizeSmMiscInfo: validateResponsiveFontSize( config.fontSizeSmMiscInfo, defaultConfig.fontSizeSmMiscInfo,),
      fontSizeSmHint: validateResponsiveFontSize( config.fontSizeSmHint, defaultConfig.fontSizeSmHint,),
    };

    return valid;
  } catch {
    return defaultConfig;
  }
}

export type CssVar = {
  "--system-font-primary": string;
  "--system-font-secondary": string;
};

// biome-ignore format: this looks nicer
export type Dataset = {
  "data-kiku-root": "true" | "false";
  "data-theme": string;
  "data-web-font-primary": string;
  "data-system-font-primary": string;
  "data-use-system-font-primary": "true" | "false";
  "data-web-font-secondary": string;
  "data-system-font-secondary": string;
  "data-use-system-font-secondary": "true" | "false";
  "data-anki-connect-port": string;
  "data-font-size-base-expression": string;
  "data-font-size-base-pitch": string;
  "data-font-size-base-sentence": string;
  "data-font-size-base-misc-info": string;
  "data-font-size-base-hint": string;
  "data-font-size-sm-expression": string;
  "data-font-size-sm-pitch": string;
  "data-font-size-sm-sentence": string;
  "data-font-size-sm-misc-info": string;
  "data-font-size-sm-hint": string;
  //
  "data-field": string;
  "data-is-audio-card": "true" | "false" | "{{IsAudioCard}}";
  "data-is-sentence-card": "true" | "false" | "{{IsSentenceCard}}";
  "data-is-word-and-sentence-card": | "true" | "false" | "{{IsWordAndSentenceCard}}";
  "data-is-click-card": "true" | "false" | "{{IsClickCard}}";
  "data-clicked": "true" | "false";
  "data-font-scope": "local";
  "data-transition": "true" | "false";
  "data-tags": string;
  "data-nsfw": "true" | "false";
  "data-is-even": "true" | "false";
  "data-modal-hidden": "true" | "false";
  "data-modal-transparent": "true" | "false";
  "data-has-pitch": string
  "data-has-hint": string
  // AnkiWeb
  "data_is_by_kiku": "true"
};

export type DatasetProp = Partial<Dataset>;

export function updateConfigDataset(el: HTMLElement, config: KikuConfig) {
  document.documentElement.setAttribute("data-theme", config.theme);
  Object.entries(config).forEach(([key, value]) => {
    el.dataset[key] = value;
  });

  const cssVar: CssVar = {
    "--system-font-primary": config.systemFontPrimary,
    "--system-font-secondary": config.systemFontSecondary,
  };
  Object.entries(cssVar).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
}
