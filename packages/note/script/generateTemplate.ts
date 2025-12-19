import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../src/util/general";
import { getSsrTemplate } from "./ssr.js";
import { log } from "./util.js";

class Script {
  ROOT_DIR = join(import.meta.dirname, "..");
  SRC_DIR = join(import.meta.dirname, "../src");
  DIST_DIR = join(import.meta.dirname, "../dist");
  VERSION: string;

  PATHS = {
    frontSrc: join(this.SRC_DIR, "front.html"),
    backSrc: join(this.SRC_DIR, "back.html"),
    styleSrc: join(this.SRC_DIR, "style.css"),

    frontDest: join(this.DIST_DIR, "_kiku_front.html"),
    backDest: join(this.DIST_DIR, "_kiku_back.html"),
    styleDest: join(this.DIST_DIR, "_kiku_style.css"),

    cssSrc: join(this.DIST_DIR, "_kiku.css"),
    cssDest: join(this.DIST_DIR, "_kiku.css"),

    pluginDest: join(this.DIST_DIR, "_kiku_plugin.js"),
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
    const { frontSrc, backSrc, styleSrc, cssSrc } = this.PATHS;
    const [front, back, style, css] = await Promise.all([
      readFile(frontSrc, "utf8"),
      readFile(backSrc, "utf8"),
      readFile(styleSrc, "utf8"),
      readFile(cssSrc, "utf8"),
    ]);
    return { front, back, style, css };
  }

  buildTemplates(
    frontSrc: string,
    backSrc: string,
    styleSrc: string,
    cssSrc: string,
  ) {
    const { frontSsrTemplate, backSsrTemplate, hydrationScript } =
      getSsrTemplate();

    log.yellow("Front SSR Template:");
    log.gray(frontSsrTemplate);
    log.yellow("Back SSR Template:");
    log.gray(backSsrTemplate);
    log.yellow("Hydration Script:");
    log.gray(hydrationScript);

    const front = frontSrc
      .replace("__VERSION__", this.VERSION)
      .replace("<!-- SSR_TEMPLATE -->", frontSsrTemplate)
      .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);
    const back = backSrc
      .replace("__VERSION__", this.VERSION)
      .replace("<!-- SSR_TEMPLATE -->", backSsrTemplate)
      .replace("<!-- HYDRATION_SCRIPT -->", hydrationScript);

    const style = styleSrc.replace("__VERSION__", this.VERSION);
    const css = cssSrc;
    return { front, back, style, css };
  }

  async writeOutputs(templates: {
    front: string;
    back: string;
    style: string;
    css: string;
  }) {
    const { frontDest, backDest, styleDest, cssDest, pluginDest } = this.PATHS;
    await Promise.all([
      writeFile(frontDest, templates.front),
      writeFile(backDest, templates.back),
      writeFile(styleDest, templates.style),
      writeFile(cssDest, templates.css),
      writeFile(pluginDest, "export const plugin = {}"),
    ]);
  }

  async run() {
    this.VERSION = `v${await this.validateVersion()}`;
    const sources = await this.loadSources();
    const templates = this.buildTemplates(
      sources.front,
      sources.back,
      sources.style,
      sources.css,
    );
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
