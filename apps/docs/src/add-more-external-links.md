---
outline: deep
---

# Add More External Links

In your `collection.media` directory, open the file named `_kiku_plugin.js`,
and replace its contents with the following code:

```js
export const plugin = {
  ExternalLinks: (props) => {
    const h = props.ctx.h;

    const NadeshikoLink = h(
      "a",
      {
        href: (() => {
          // adjust the URL here
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

    return [
      props.DefaultExternalLinks(),
      NadeshikoLink(),
      // you can create as many links as you want
    ];
  },
};
```
