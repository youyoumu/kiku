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
  showTheme: "true" | "false";
  showStartupTime: "true" | "false";
  ankiConnectPort: string;
  ankiDroidEnableIntegration: "true" | "false";
  ankiDroidReverseSwipeDirection: "true" | "false";
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
  kikuRoot: "true",
  theme: "light",
  webFontPrimary: "Klee One",
  systemFontPrimary: "'Inter', 'SF Pro Display', 'Liberation Sans', 'Segoe UI', 'Hiragino Kaku Gothic ProN', 'Noto Sans CJK JP', 'Noto Sans JP', 'Meiryo', HanaMinA, HanaMinB, sans-serif",
  useSystemFontPrimary: "true",
  webFontSecondary: "IBM Plex Sans JP",
  systemFontSecondary: "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif",
  useSystemFontSecondary: "true",
  showTheme: "true",
  showStartupTime: "true",
  ankiConnectPort: "8765",
  ankiDroidEnableIntegration: "true",
  ankiDroidReverseSwipeDirection: "false",
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

//TODO: css var
export const rootDatasetConfigWhitelist = new Set<keyof KikuConfig>([
  "theme",
  "webFontPrimary",
  "systemFontPrimary",
  "useSystemFontPrimary",
  "webFontSecondary",
  "systemFontSecondary",
  "useSystemFontSecondary",
]);
Object.keys(defaultConfig).forEach((key) => {
  if (key.startsWith("fontSize"))
    rootDatasetConfigWhitelist.add(key as keyof KikuConfig);
});

function validateResponsiveFontSize(
  value: TailwindSize,
  fallback: TailwindSize,
): TailwindSize {
  if (tailwindSize.includes(value)) return value;
  return fallback;
}

export function validateConfig(config: KikuConfig): KikuConfig {
  try {
    KIKU_STATE.logger.info("Validating config:", config);
    if (typeof config !== "object" || config === null) throw new Error();

    // biome-ignore format: this looks nicer
    const valid: KikuConfig = {
      kikuRoot: "true",
      theme: daisyUIThemes.includes(config.theme) ? config.theme : defaultConfig.theme,
      webFontPrimary: webFonts.includes(config.webFontPrimary) ? config.webFontPrimary : defaultConfig.webFontPrimary,
      systemFontPrimary: typeof config.systemFontPrimary === "string" ? config.systemFontPrimary : defaultConfig.systemFontPrimary,
      useSystemFontPrimary: typeof config.useSystemFontPrimary === "string" ? config.useSystemFontPrimary === "true" ? "true" : "false" : defaultConfig.useSystemFontPrimary,
      webFontSecondary: webFonts.includes(config.webFontSecondary) ? config.webFontSecondary : defaultConfig.webFontSecondary,
      systemFontSecondary: typeof config.systemFontSecondary === "string" ? config.systemFontSecondary : defaultConfig.systemFontSecondary,
      useSystemFontSecondary: typeof config.useSystemFontSecondary === "string" ? config.useSystemFontSecondary === "true" ? "true" : "false" : defaultConfig.useSystemFontSecondary,
      showTheme: typeof config.showTheme === "string" ? config.showTheme === "true" ? "true" : "false" : defaultConfig.showTheme,
      showStartupTime: typeof config.showStartupTime === "string" ? config.showStartupTime === "true" ? "true" : "false" : defaultConfig.showStartupTime,
      ankiConnectPort: typeof config.ankiConnectPort === "string" && Number(config.ankiConnectPort) > 0 && Number(config.ankiConnectPort) < 65535 ? config.ankiConnectPort : defaultConfig.ankiConnectPort,
      ankiDroidEnableIntegration: typeof config.ankiDroidEnableIntegration === "string" ? config.ankiDroidEnableIntegration === "true" ? "true" : "false" : defaultConfig.ankiDroidEnableIntegration,
      ankiDroidReverseSwipeDirection: typeof config.ankiDroidReverseSwipeDirection === "string" ? config.ankiDroidReverseSwipeDirection === "true" ? "true" : "false" : defaultConfig.ankiDroidReverseSwipeDirection,
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
  "data-is-audio-card": "true" | "false" | "{{IsAudioCard}}" | "ready"
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
};

export type DatasetProp = Partial<Dataset>;

export function updateConfigState(el: HTMLElement, config: KikuConfig) {
  if (document.documentElement.getAttribute("data-theme") !== "none") {
    document.documentElement.setAttribute("data-theme", config.theme);
  }
  el.dataset.theme = config.theme;

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
  Object.entries(cssVar).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
    el.style.setProperty(key, value);
  });
}
