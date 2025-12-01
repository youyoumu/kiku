/**
 * @import { KikuPlugin } from "#/plugins/pluginTypes";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  onPluginLoad: ({ ctx }) => {
    const root = KIKU_STATE.root;
    const fontsPool = [
      "Hina Mincho",
      "Klee One",
      "IBM Plex Sans JP",
      // you can add more fonts here
      "'Hiragino Mincho ProN', 'Noto Serif CJK JP', 'Noto Serif JP', 'Yu Mincho', HanaMinA, HanaMinB, serif",
    ];

    const randomFont = fontsPool[Math.floor(Math.random() * fontsPool.length)];

    const [$card, $setCard] = ctx.useCardContext();
    let font = sessionStorage.getItem("random-font") ?? randomFont;
    if ($card.side === "front") {
      font = randomFont;
      sessionStorage.setItem("random-font", font);
    }

    document.documentElement.style.setProperty("--font-secondary", font);
    if (root) root.style.setProperty("--font-secondary", font);
  },
};
