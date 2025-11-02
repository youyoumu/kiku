import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

export default defineConfig({
  plugins: [solid(), tailwindcss()],
  build: {
    minify: false,
    lib: {
      entry: "src/index.tsx",
      fileName: "_kiku",
      formats: ["es"],
    },
  },
});
