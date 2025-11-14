import type { TailwindResponsiveFontSize } from "#/util/config";

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
export const tailwindFontSizeLabel = [
  "Extra Small", "Small", "Base", "Large",
  "Extra Large", "Extra Large 2", "Extra Large 3", "Extra Large 4",
  "Extra Large 5", "Extra Large 6", "Extra Large 7", "Extra Large 8",
  "Extra Large 9",
];
// biome-ignore format: this looks nicer
export const tailwindFontSizeLabelShort = [ "xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl", "6xl", "7xl", "8xl", "9xl", ];
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
export const tailwindFontSizeLabelShortMap: Record<
  TailwindResponsiveFontSize,
  string
> = (() => {
  const map: Record<TailwindResponsiveFontSize, string> = {
    "text-xs": "xs",
    "text-sm": "sm",
    "text-base": "md",
    "text-lg": "lg",
    "text-xl": "xl",
    "text-2xl": "2xl",
    "text-3xl": "3xl",
    "text-4xl": "4xl",
    "text-5xl": "5xl",
    "text-6xl": "6xl",
    "text-7xl": "7xl",
    "text-8xl": "8xl",
    "text-9xl": "9xl",
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
export function getTailwindFontSizeShort(
  label: TailwindFontSizeLabelShort,
  breakpoint?: TailwindBreakpoint,
): TailwindResponsiveFontSize {
  const key = Object.entries(tailwindFontSizeLabelShortMap).find(
    ([_, value]) => value === label,
  )?.[0] as TailwindResponsiveFontSize;
  if (!breakpoint) return key;
  return `${breakpoint}:${key}`;
}

export type TailwindFontSize = (typeof tailwindFontSize)[number];
export type TailwindBreakpoint = (typeof tailwindBreakpoints)[number];
export type TailwindFontSizeLabel = (typeof tailwindFontSizeLabel)[number];
export type TailwindFontSizeLabelShort =
  (typeof tailwindFontSizeLabelShort)[number];
export type ResponsiveFontSize =
  | TailwindFontSize
  | `${TailwindBreakpoint}:${TailwindFontSize}`;
