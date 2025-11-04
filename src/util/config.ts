import { type OnlineFont, onlineFonts } from "./fonts";
import { type DaisyUITheme, daisyUIThemes } from "./theme";

// biome-ignore format: this looks nicer
export const tailwindFontSize = [
  "text-xs", "text-sm", "text-base", "text-lg",
  "text-xl", "text-2xl", "text-3xl", "text-4xl",
  "text-5xl", "text-6xl", "text-7xl", "text-8xl",
  "text-9xl",
] as const;
export const tailwindBreakpoints = ["sm", "md", "lg", "xl", "2xl"] as const;
// const validFontSizes = new Set([
//   ...tailwindFontSize,
//   ...tailwindBreakpoints.flatMap((bp) =>
//     tailwindFontSize.map((fs) => `${bp}:${fs}`),
//   ),
// ]);
// console.log(Array.from(validFontSizes));
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

// biome-ignore format: this looks nicer
export const tailwindFontSizeLabel = [
  "Extra Small", "Small", "Base", "Large",
  "Extra Large", "Extra Large 2", "Extra Large 3", "Extra Large 4",
  "Extra Large 5", "Extra Large 6", "Extra Large 7", "Extra Large 8",
  "Extra Large 9",
];
export const tailwindFontSizeLabelMap: Record<
  TailwindResponsiveFontSize,
  string
> = (() => {
  const map: Record<TailwindResponsiveFontSize, string> = {
    "text-xs": "Extra Small",
    "text-sm": "Small",
    "text-base": "Base",
    "text-lg": "Large",
    "text-xl": "Extra Large",
    "text-2xl": "Extra Large 2",
    "text-3xl": "Extra Large 3",
    "text-4xl": "Extra Large 4",
    "text-5xl": "Extra Large 5",
    "text-6xl": "Extra Large 6",
    "text-7xl": "Extra Large 7",
    "text-8xl": "Extra Large 8",
    "text-9xl": "Extra Large 9",
  };

  for (const bp of tailwindBreakpoints) {
    for (const size of tailwindFontSize) {
      map[`${bp}:${size}`] = map[size];
    }
  }
  return map;
})();

export function getTailwindFontSize(
  label: TailwindFontSizeLabel,
  breakpoint?: TailwindBreakpoint,
): TailwindResponsiveFontSize {
  const key = Object.entries(tailwindFontSizeLabelMap).find(
    ([_, value]) => value === label,
  )?.[0] as TailwindResponsiveFontSize;
  if (!breakpoint) return key;
  return `${breakpoint}:${key}`;
}

export type TailwindFontSize = (typeof tailwindFontSize)[number];
export type TailwindResponsiveFontSize =
  (typeof tailwindResponsiveFontSizes)[number];
export type TailwindBreakpoint = (typeof tailwindBreakpoints)[number];
export type TailwindFontSizeLabel = (typeof tailwindFontSizeLabel)[number];

/**
 * Allows "text-lg" or "sm:text-lg" etc.
 */
export type ResponsiveFontSize =
  | TailwindFontSize
  | `${TailwindBreakpoint}:${TailwindFontSize}`;

export type KikuConfig = {
  theme: DaisyUITheme;
  onlineFont: OnlineFont;
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
  onlineFont: "Noto Serif JP",
  systemFont: "",
  ankiConnectPort: 8765,
  fontSizeBaseExpression: "text-5xl",
  fontSizeBasePitch: "text-3xl",
  fontSizeBaseSentence: "text-2xl",
  fontSizeBaseMiscInfo: "text-sm",
  fontSizeBaseHint: "text-lg",
  fontSizeSmExpression: "sm:text-6xl",
  fontSizeSmPitch: "sm:text-4xl",
  fontSizeSmSentence: "sm:text-4xl",
  fontSizeSmMiscInfo: "sm:text-sm",
  fontSizeSmHint: "sm:text-2xl",
};

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
      onlineFont: onlineFonts.includes(config.onlineFont) ? config.onlineFont : defaultConfig.onlineFont,
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
