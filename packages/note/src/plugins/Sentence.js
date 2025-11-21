/**
 * @import { KikuPlugin } from "#/plugins/pluginTypes";
 */

/**
 * @type { KikuPlugin }
 */
export const plugin = {
  Sentence: (props) => {
    const h = props.ctx.h;

    const SentenceTranslation = h(
      "div",
      {
        class: "text-lg",
      },
      "This is the translation",
    );

    return [
      // includes the default Sentence
      props.DefaultSentence(),
      SentenceTranslation(),
    ];
  },
};
