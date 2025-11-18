import { stat } from "node:fs/promises";
import { join } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import express from "express";
import { defineConfig, type PluginOption } from "vite";
import circularDpendency from "vite-plugin-circular-dependency";
import solid from "vite-plugin-solid";

function serveAnkiCollectionMediaPlugin(): PluginOption {
  return {
    name: "serve-anki-media-root",
    configureServer: async (server) => {
      const BASE_DIR = process.platform === "win32" ? process.env.APPDATA : process.env.HOME + "/.local/share";
      const USER = "yym";
      // const USER = "User 1";
      const ANKI_MEDIA_DIR = join(
        BASE_DIR || "",
        `Anki2/${USER}/collection.media`,
      );
      await stat(ANKI_MEDIA_DIR);
      server.middlewares.use(express.static(ANKI_MEDIA_DIR) as any);
    },
  };
}

export default defineConfig({
  plugins: [
    solid({ ssr: true }),
    tailwindcss(),
    serveAnkiCollectionMediaPlugin(),
    circularDpendency({
      outputFilePath: "./.circularDependency.json",
      circleImportThrowErr: true,
    }),
  ],
  resolve: {
    alias: {
      "#": join(import.meta.dirname, "src"),
    },
  },
  build: {
    lib: {
      entry: "src/index.tsx",
      fileName: "_kiku",
      formats: ["es"],
    },
    copyPublicDir: false,
    cssCodeSplit: false,
    cssMinify: false,
    minify: false,
    rolldownOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              test: (id) => {
                const result = /node_modules/.test(id);
                return result;
              },
              name: "_kiku_libs",
            },
            {
              test: (id) => {
                const result =
                  /src\/util/.test(id) || /src\/components\/shared/.test(id);
                return result;
              },
              name: "_kiku_shared",
            },
          ],
        },
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]",
        minify: false,
      },
    },
  },
  worker: {
    format: "es",
    rolldownOptions: {
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
