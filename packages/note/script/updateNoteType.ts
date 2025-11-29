import { readFile } from "node:fs/promises";
import { join } from "node:path";
import {
  defaultConfig,
  generateCssVars,
  getCssVar,
} from "../src/util/config.js";
import { AnkiConnect } from "./util.js";

async function main() {
  const noteType = "Kiku";
  const cardType = "Mining";
  const frontPath = join(import.meta.dirname, "../dist/_kiku_front.html");
  const backPath = join(import.meta.dirname, "../dist/_kiku_back.html");
  const stylePath = join(import.meta.dirname, "../dist/_kiku_style.css");

  // Read your local HTML templates
  const [frontSrc, backSrc, styleSrc] = await Promise.all([
    readFile(frontPath, "utf8"),
    readFile(backPath, "utf8"),
    readFile(stylePath, "utf8"),
  ]);

  const frontTemplate = frontSrc
    .replace("__DATA_THEME__", "light")
    .replace("__DATA_BLUR_NSFW__", "true")
    .replace("__DATA_MOD_VERTICAL__", "false");
  const backTemplate = backSrc
    .replace("__DATA_THEME__", "light")
    .replace("__DATA_BLUR_NSFW__", "true")
    .replace("__DATA_MOD_VERTICAL__", "false");

  // Send them to AnkiConnect
  const result = await AnkiConnect.call("updateModelTemplates", {
    model: {
      name: noteType,
      templates: {
        [cardType]: {
          Front: frontTemplate,
          Back: backTemplate,
        },
      },
    },
  });

  console.log(result);
  console.log(
    `✅ Updated Anki note type "${noteType}" Front/Back from ${frontPath} and ${backPath}`,
  );

  const cssVarTemplate = generateCssVars(getCssVar(defaultConfig));
  const styleTemplate = styleSrc.replace(
    "/* __CSS_VARIABLE__ */",
    cssVarTemplate,
  );

  const result2 = await AnkiConnect.call("updateModelStyling", {
    model: {
      name: noteType,
      css: styleTemplate,
    },
  });

  console.log(result2);
  console.log(
    `✅ Updated Anki note type "${noteType}" style from ${stylePath}`,
  );
}

main().catch((err) => {
  console.error("❌ Failed to update note type:", err);
  process.exit(1);
});
