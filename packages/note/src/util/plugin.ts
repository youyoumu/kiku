import type { Plugin } from "#/types";
import { env } from "./general";

export async function getPlugin() {
  try {
    const plugin = (
      await import(
        /* @vite-ignore */
        `${KIKU_STATE.assetsPath}/${env.KIKU_PLUGIN_MODULE}`
      )
    ).plugin as Plugin;
    return plugin;
  } catch (e) {
    KIKU_STATE.logger.warn(
      "Failed to load plugin:",
      e instanceof Error ? e.message : e,
    );
  }
}
