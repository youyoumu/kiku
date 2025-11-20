/**
 * @import {KikuPlugin} from "#/plugins/pluginTypes";
 */

/**
 * @type {KikuPlugin}
 */
export const plugin = {
  ExternalLinks: (props) => {
    const h = props.ctx.h;

    // create arbitary link
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

    // create arbitary button with custom on:click event
    const AnkiDroidBrowseButton = h(
      "button",
      {
        class: "text-sm btn btn-sm",
        "on:click": () => {
          props.ctx
            .ankiDroidAPI()
            ?.ankiSearchCard(
              `("note:Kiku" OR "note:Lapis") AND "Expression:*${props.ctx.ankiFields.Expression}*"`,
            );
        },
      },
      "Browse",
    );

    return [
      props.DefaultExternalLinks(),
      NadeshikoLink(),
      AnkiDroidBrowseButton(),
    ];
  },
};
