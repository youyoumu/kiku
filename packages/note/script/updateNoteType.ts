import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { AnkiConnect } from "./util.ts";

async function main() {
  const noteType = "Kiku";
  const cardType = "Mining";
  const frontPath = join(import.meta.dirname, "../dist/front.html");
  const backPath = join(import.meta.dirname, "../dist/back.html");
  const stylePath = join(import.meta.dirname, "../src/style.css");

  // Read your local HTML templates
  const [front, back, style] = await Promise.all([
    readFile(frontPath, "utf8"),
    readFile(backPath, "utf8"),
    readFile(stylePath, "utf8"),
  ]);

  // Send them to AnkiConnect
  const result = await AnkiConnect.call("updateModelTemplates", {
    model: {
      name: noteType,
      templates: {
        [cardType]: {
          Front: front,
          Back: back,
        },
      },
    },
  });

  console.log(result);
  console.log(
    `✅ Updated Anki note type "${noteType}" Front/Back from ${frontPath} and ${backPath}`,
  );

  const result2 = await AnkiConnect.call("updateModelStyling", {
    model: {
      name: noteType,
      css: style,
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
