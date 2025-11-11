import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { AnkiConnect } from "./util.ts";

async function main() {
  const deckName = "Kiku"; // change to your deck name
  const releaseDir = join(import.meta.dirname, "../.release");
  await mkdir(releaseDir, { recursive: true });
  const outputPath = join(releaseDir, `${deckName}.apkg`);

  console.log(`📦 Exporting deck "${deckName}" to ${outputPath}...`);

  const result = await AnkiConnect.call("exportPackage", {
    deck: deckName,
    path: outputPath,
    includeSched: false,
  });

  if (result) {
    console.log(
      `✅ Successfully exported deck "${deckName}" to: ${outputPath}`,
    );
  } else {
    console.error(`❌ Failed to export deck "${deckName}".`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Error exporting deck:", err);
  process.exit(1);
});
