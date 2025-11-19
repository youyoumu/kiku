/**
 * @typedef {import("./_kiku_plugin.d.ts").Plugin} Plugin
 */

/**
 * @type {Plugin}
 */
export const plugin = {
  ExternalLinks: (props) => {
    const h = props.ctx.h;
    const NadeshikoLink = h(
      "a",
      {
        href: (() => {
          const url = new URL("https://nadeshiko.co/search/sentence");
          url.searchParams.set("query", props.ctx.ankiFields.Expression);
          return url.toString();
        })(),
        target: "_blank",
      },
      h("img", {
        class: "size-5 object-contain rounded-xs",
        src: "https://nadeshiko.co/favicon.ico",
      }),
    );
    return [props.DefaultExternalLinks(), NadeshikoLink()];
  },
};
