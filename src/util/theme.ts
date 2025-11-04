export const daisyUIThemes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
  "caramellatte",
  "abyss",
  "silk",
] as const;

export type DaisyUITheme = (typeof daisyUIThemes)[number];

export function setTheme(theme: DaisyUITheme) {
  document.documentElement.setAttribute("data-theme", theme);
  const root = document.getElementById("root");
  if (root) root.setAttribute("data-theme", theme);
}

export function nextTheme(): DaisyUITheme {
  const current = document.documentElement.getAttribute(
    "data-theme",
  ) as DaisyUITheme;
  const index = daisyUIThemes.indexOf(current);
  return daisyUIThemes[(index + 1) % daisyUIThemes.length];
}
