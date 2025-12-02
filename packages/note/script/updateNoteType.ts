import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { generateCssVars, getCssVar } from "../src/util/config.js";
import { defaultConfig } from "../src/util/defaulConfig.js";
import { AnkiConnect, log } from "./util.js";

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
    .replace("__DATA_PICTURE_ON_FRONT__", "false")
    .replace("__DATA_MOD_VERTICAL__", "false");
  const backTemplate = backSrc
    .replace("__DATA_THEME__", "light")
    .replace("__DATA_BLUR_NSFW__", "true")
    .replace("__DATA_PICTURE_ON_FRONT__", "false")
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

  log.gray(`updateModelTemplates: ${JSON.stringify(result)}`);
  console.log(
    `✅ Updated Anki note type "${noteType}" Front/Back from ${basename(frontPath)} and ${basename(backPath)}`,
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

  log.gray(`updateModelTemplates: ${JSON.stringify(result2)}`);
  console.log(
    `✅ Updated Anki note type "${noteType}" style from ${basename(stylePath)}`,
  );
}

main().catch((err) => {
  console.error("❌ Failed to update note type:", err);
  process.exit(1);
});
