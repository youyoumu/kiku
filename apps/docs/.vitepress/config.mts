import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",

  title: "Kiku",
  description: "Modern Anki notes, built like web apps.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Installation", link: "/installation" },
          {
            text: "Switching from Lapis",
            link: "/migration",
          },
        ],
      },

      {
        text: "Learn More",
        items: [{ text: "Features", link: "/features" }],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/youyoumu/kiku" }],
  },
});
