import { readFile } from "node:fs/promises";
import { join } from "node:path";

const AnkiConnect = {
  call: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version: 6, params }),
    });

    const result = await res.json();
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  },
};

async function main() {
  const noteType = "Kiku";
  const cardType = "Mining";
  const frontPath = join(import.meta.dirname, "../dist/front.html");
  const backPath = join(import.meta.dirname, "../dist/back.html");
  const stylePath = join(import.meta.dirname, "../dist/_kiku.css");

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

  // const result2 = await AnkiConnect.call("updateModelStyling", {
  //   model: {
  //     name: noteType,
  //     css: style,
  //   },
  // });
  //
  // console.log(result2);
  // console.log(
  //   `✅ Updated Anki note type "${noteType}" style from ${stylePath}`,
  // );
}

main().catch((err) => {
  console.error("❌ Failed to update note type:", err);
  process.exit(1);
});
