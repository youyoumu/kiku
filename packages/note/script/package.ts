import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { AnkiConnect } from "./util.js";

async function main() {
  const projectRoot = join(import.meta.dirname, "..");
  const pkgJsonPath = join(projectRoot, "package.json");
  const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
  const version = pkg.version;

  const deckName = "Kiku"; // change to your deck name
  const releaseDir = join(import.meta.dirname, "../.release");
  await mkdir(releaseDir, { recursive: true });
  const outputPath = join(releaseDir, `${deckName}_v${version}.apkg`);

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
