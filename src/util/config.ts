import type { ResponsiveFontSize } from "#/components/_kiku_lazy/util/tailwind";
import { type Font, fonts } from "./fonts";
import { type DaisyUITheme, daisyUIThemes } from "./theme";

export type KikuConfig = {
  theme: DaisyUITheme;
  font: Font;
  systemFont: string;
  ankiConnectPort: number;
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

export const defaultConfig: KikuConfig = {
  theme: "coffee",
  font: "Noto Serif JP",
  systemFont: "",
  ankiConnectPort: 8765,
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
  value: any,
  fallback: ResponsiveFontSize,
): ResponsiveFontSize {
  if (tailwindResponsiveFontSizesSet.has(value)) return value;
  return fallback;
}

export function validateConfig(config: any): KikuConfig {
  try {
    if (typeof config !== "object" || config === null) throw new Error();

    // biome-ignore format: this looks nicer
    const valid: KikuConfig = {
      theme: daisyUIThemes.includes(config.theme) ? config.theme : defaultConfig.theme,
      font: fonts.includes(config.font) ? config.font : defaultConfig.font,
      systemFont: typeof config.systemFont === "string" ? config.systemFont : defaultConfig.systemFont,
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

// biome-ignore format: this looks nicer
export function updateConfigDataset(el: HTMLElement, config: KikuConfig) {
  document.documentElement.setAttribute("data-theme", config.theme);
  el.setAttribute("data-theme", config.theme);
  el.setAttribute("data-font-family", config.font);
  el.setAttribute("data-font-family", config.systemFont);
  if (config.systemFont) el.style.fontFamily = config.systemFont;
  el.setAttribute("data-font-size-base-expression", config.fontSizeBaseExpression);
  el.setAttribute("data-font-size-base-pitch", config.fontSizeBasePitch);
  el.setAttribute("data-font-size-base-sentence", config.fontSizeBaseSentence);
  el.setAttribute("data-font-size-base-misc-info", config.fontSizeBaseMiscInfo);
  el.setAttribute("data-font-size-base-hint", config.fontSizeBaseHint);
  el.setAttribute("data-font-size-sm-expression", config.fontSizeSmExpression);
  el.setAttribute("data-font-size-sm-pitch", config.fontSizeSmPitch);
  el.setAttribute("data-font-size-sm-sentence", config.fontSizeSmSentence);
  el.setAttribute("data-font-size-sm-misc-info", config.fontSizeSmMiscInfo);
  el.setAttribute("data-font-size-sm-hint", config.fontSizeSmHint);
}
