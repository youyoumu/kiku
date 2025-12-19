import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../src/util/general";
import { generateSsrTemplate } from "./generateSsrTemplate.js";
import { log } from "./util.js";

class Script {
  ROOT_DIR = join(import.meta.dirname, "..");
  SRC_DIR = join(import.meta.dirname, "../src");
  DIST_DIR = join(import.meta.dirname, "../dist");
  VERSION: string;

  PATHS = {
    FRONT_SRC: join(this.SRC_DIR, "front.html"),
    BACK_SRC: join(this.SRC_DIR, "back.html"),
    STYLE_SRC: join(this.SRC_DIR, "style.css"),

    FRONT_DEST: join(this.DIST_DIR, "_kiku_front.html"),
    BACK_DEST: join(this.DIST_DIR, "_kiku_back.html"),
    STYLE_DEST: join(this.DIST_DIR, "_kiku_style.css"),

    CSS_SRC: join(this.DIST_DIR, "_kiku.css"),
    CSS_DEST: join(this.DIST_DIR, "_kiku.css"),

    PLUGIN_SRC: join(this.SRC_DIR, "_kiku_plugin.js"),
    PLUGIN_DEST: join(this.DIST_DIR, "_kiku_plugin.js"),
  };

  async validateVersion() {
    const pkgJsonPath = join(this.ROOT_DIR, "package.json");
    const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
    const declared = env.KIKU_VERSION;
    const actual = pkg.version;

    if (!actual) throw new Error("package.json has no version field.");
    if (declared !== actual) {
      throw new Error(
        `Version mismatch: env.KIKU_VERSION = ${declared} -- package.json version = ${actual}`,
      );
    }

    console.log(`✅ Version OK: ${declared}`);
    return actual as string;
  }

  async loadSources() {
    const [front, back, style, css, plugin] = await Promise.all([
      readFile(this.PATHS.FRONT_SRC, "utf8"),
      readFile(this.PATHS.BACK_SRC, "utf8"),
      readFile(this.PATHS.STYLE_SRC, "utf8"),
      readFile(this.PATHS.CSS_SRC, "utf8"),
      readFile(this.PATHS.PLUGIN_SRC, "utf8"),
    ]);
    return { front, back, style, css, plugin };
  }

  buildTemplates(src: {
    front: string;
    back: string;
    style: string;
    css: string;
    plugin: string;
  }) {
    const { frontSsrTemplate, backSsrTemplate, hydrationScript } =
      generateSsrTemplate();

    log.yellow("Front SSR Template:");
    log.gray(frontSsrTemplate);
    log.yellow("Back SSR Template:");
    log.gray(backSsrTemplate);
    log.yellow("Hydration Script:");
    log.gray(hydrationScript);

    const front = src.front
      .replace("__VERSION__", this.VERSION)
      .replace("<!-- SSR_TEMPLATE -->", frontSsrTemplate)
      .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
    const back = src.back
      .replace("__VERSION__", this.VERSION)
      .replace("<!-- SSR_TEMPLATE -->", backSsrTemplate)
      .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
    const style = src.style.replace("__VERSION__", this.VERSION);
    const css = src.css;
    const plugin = src.plugin;

    return { front, back, style, css, plugin };
  }

  async writeOutputs(templates: {
    front: string;
    back: string;
    style: string;
    css: string;
    plugin: string;
  }) {
    await Promise.all([
      writeFile(this.PATHS.FRONT_DEST, templates.front),
      writeFile(this.PATHS.BACK_DEST, templates.back),
      writeFile(this.PATHS.STYLE_DEST, templates.style),
      writeFile(this.PATHS.CSS_DEST, templates.css),
      writeFile(this.PATHS.PLUGIN_DEST, templates.plugin),
    ]);
  }

  async run() {
    this.VERSION = `v${await this.validateVersion()}`;
    const sources = await this.loadSources();
    const templates = this.buildTemplates(sources);
    await this.writeOutputs(templates);
  }
}

const script = new Script();
script
  .run()
  .then(() => {
    console.log("✅ Generated template");
  })
  .catch((err) => {
    console.error("❌ Failed to generate template:", err);
    process.exit(1);
  });
