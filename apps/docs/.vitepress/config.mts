import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "src",

  title: "Kiku",
  description: "Modern Anki notes, built like web apps.",
  themeConfig: {
    lastUpdated: {},
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],

    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Installation", link: "/installation" },
          {
            text: "Updating Kiku",
            link: "/updating",
          },
          {
            text: "Switching From Lapis",
            link: "/migration",
          },
        ],
      },

      {
        text: "Learn More",
        items: [
          { text: "Features", link: "/features" },
          {
            text: "Field Grouping",
            link: "/field-grouping",
          },
          {
            text: "Plugin",
            link: "/plugin",
          },
          {
            text: "How Things Work",
            link: "/how-things-work",
          },
          {
            text: "Development",
            link: "/development",
          },
        ],
      },

      {
        text: "Recipes",
        items: [
          { text: "Add More External Links", link: "/add-more-external-links" },
          {
            text: "Display Extra Fields",
            link: "/display-extra-fields",
          },
          {
            text: "Unblur Picture Automatically",
            link: "/unblur-picture-automatically",
          },
          {
            text: "Random Font",
            link: "/random-font",
          },
          {
            text: "Custom Dictionary Style",
            link: "/custom-dictionary-style",
          },
          {
            text: "Custom Pitch Color",
            link: "/custom-pitch-color",
          },
          {
            text: "Custom Theme",
            link: "/custom-theme",
          },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com/youyoumu/kiku" }],
  },
});
