/**
 * @import { KikuPlugin } from "#/plugins/pluginTypes";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  Footer: (props) => {
    const h = props.ctx.h;

    function SentenceTranslation() {
      const translation =
        "SentenceTranslation" in props.ctx.ankiFields
          ? props.ctx.ankiFields?.SentenceTranslation
          : document.getElementById("SentenceTranslation")?.innerHTML;

      if (!translation) return null;
      return h("div", {
        class: "text-lg text-base-content-calm sentence-translation",
        innerHTML: translation,
      })();
    }

    // You can inline the CSS here
    const style = h(
      "style",
      `
      .sentence-translation { filter: blur(4px); } 
      .sentence-translation:hover { filter: none; }
    `,
    );

    return [props.DefaultFooter(), SentenceTranslation(), style()];
  },
};
