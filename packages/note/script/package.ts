import { mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { AnkiConnect } from "./util.js";

class Script {
  DECK_NAME = "Kiku"; // change if needed
  ROOT_DIR = join(import.meta.dirname, "..");
  RELEASE_DIR = join(import.meta.dirname, "../.release");

  async getVersion() {
    const pkgJsonPath = join(this.ROOT_DIR, "package.json");
    const pkg = JSON.parse(await readFile(pkgJsonPath, "utf8"));
    return pkg.version as string;
  }

  async ensureReleaseDir() {
    await mkdir(this.RELEASE_DIR, { recursive: true });
  }

  buildOutputPath(version: string) {
    return join(this.RELEASE_DIR, `${this.DECK_NAME}_v${version}.apkg`);
  }

  async exportDeck(outputPath: string) {
    console.log(`📦 Exporting deck "${this.DECK_NAME}" to ${outputPath}...`);
    const result = await AnkiConnect.call("exportPackage", {
      deck: this.DECK_NAME,
      path: outputPath,
      includeSched: false,
    });
    if (!result) throw new Error(`Failed to export deck "${this.DECK_NAME}"`);
    console.log(
      `✅ Successfully exported deck "${this.DECK_NAME}" to: ${outputPath}`,
    );
  }

  async run() {
    const version = await this.getVersion();
    await this.ensureReleaseDir();
    const outputPath = this.buildOutputPath(version);
    await this.exportDeck(outputPath);
  }
}

const script = new Script();
script.run().catch((err) => {
  console.error("❌ Error exporting deck:", err);
  process.exit(1);
});
