export const onlineFonts = [
  "Hina Mincho",
  "Inter",
  "Klee One",
  "Kosugi Maru",
  "M PLUS Rounded 1c",
  "Noto Sans JP",
  "Noto Serif JP",
  "Sawarabi Mincho",
  "Zen Kaku Gothic New",
  "Zen Old Mincho",
] as const;

export type OnlineFont = (typeof onlineFonts)[number];

export function loadGoogleFont(
  fontName: string | undefined,
  weights: number[] | "all" = [400],
) {
  if (!fontName) return;
  if (weights === "all")
    weights = [100, 200, 300, 400, 500, 600, 700, 800, 900];

  const weightParam = `:wght@${weights.join(";")}`;
  const fontUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
    fontName,
  )}${weightParam}&display=swap`;

  // Remove previous links
  document.querySelectorAll("link[data-dynamic-font]").forEach((el) => {
    el.remove();
  });

  // Inject new link
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = fontUrl;
  link.setAttribute("data-dynamic-font", "true");
  document.head.appendChild(link);
}

export function setOnlineFont(font: OnlineFont) {
  loadGoogleFont(font, [400, 500, 600, 700]);
  const root = document.getElementById("root");
  if (root) {
    root.style.fontFamily = font;
  }
}

export function setSystemFont(font: string) {
  const root = document.getElementById("root");
  if (root) {
    root.style.fontFamily = font;
  }
}
