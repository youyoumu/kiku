export const fonts = [
  "Hina Mincho",
  "Klee One",
  "Noto Sans JP",
  "Noto Serif JP",
  "IBM Plex Sans JP",
] as const;

export type Font = (typeof fonts)[number];
