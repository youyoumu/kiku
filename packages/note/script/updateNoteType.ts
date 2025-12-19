import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { generateCssVars, getCssVar } from "../src/util/config.js";
import { defaultConfig } from "../src/util/defaulConfig.js";
import { AnkiConnect, log } from "./util.js";

class Script {
  NOTE_TYPE = "Kiku";
  CARD_TYPE = "Mining";
  DIST_DIR = join(import.meta.dirname, "../dist");
  FRONT_PATH = join(this.DIST_DIR, "_kiku_front.html");
  BACK_PATH = join(this.DIST_DIR, "_kiku_back.html");
  STYLE_PATH = join(this.DIST_DIR, "_kiku_style.css");

  async readTemplates() {
    const [front, back, style] = await Promise.all([
      readFile(this.FRONT_PATH, "utf8"),
      readFile(this.BACK_PATH, "utf8"),
      readFile(this.STYLE_PATH, "utf8"),
    ]);

    return { front, back, style };
  }

  applyDataAttributes(template: string) {
    return template
      .replace("__DATA_THEME__", "light")
      .replace("__DATA_BLUR_NSFW__", "true")
      .replace("__DATA_PICTURE_ON_FRONT__", "false")
      .replace("__DATA_MOD_VERTICAL__", "false");
  }

  buildStyleTemplate(styleSrc: string) {
    const cssVars = generateCssVars(getCssVar(defaultConfig));
    return styleSrc.replace("/* __CSS_VARIABLE__ */", cssVars);
  }

  async updateTemplates(frontSrc: string, backSrc: string) {
    const result = await AnkiConnect.call("updateModelTemplates", {
      model: {
        name: this.NOTE_TYPE,
        templates: {
          [this.CARD_TYPE]: {
            Front: frontSrc,
            Back: backSrc,
          },
        },
      },
    });

    log.gray(`updateModelTemplates: ${JSON.stringify(result)}`);
    console.log(
      `✅ Updated "${this.NOTE_TYPE}" Front/Back from ${basename(this.FRONT_PATH)} and ${basename(this.BACK_PATH)}`,
    );
  }

  async updateStyling(styleSrc: string) {
    const result = await AnkiConnect.call("updateModelStyling", {
      model: {
        name: this.NOTE_TYPE,
        css: styleSrc,
      },
    });

    log.gray(`updateModelStyling: ${JSON.stringify(result)}`);
    console.log(
      `✅ Updated "${this.NOTE_TYPE}" style from ${basename(this.STYLE_PATH)}`,
    );
  }

  async run() {
    const { front, back, style } = await this.readTemplates();
    const frontTemplate = this.applyDataAttributes(front);
    const backTemplate = this.applyDataAttributes(back);
    const styleTemplate = this.buildStyleTemplate(style);
    await this.updateTemplates(frontTemplate, backTemplate);
    await this.updateStyling(styleTemplate);
  }
}

const script = new Script();
script.run().catch((err) => {
  console.error("❌ Failed to update note type:", err);
  process.exit(1);
});
