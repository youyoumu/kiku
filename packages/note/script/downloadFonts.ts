import fs from "node:fs/promises";
import { join } from "node:path";
import extract from "extract-zip";

type FontMeta = {
  id: string;
  family: string;
};

class Script {
  GOOGLE_FONTS = ["Hina Mincho", "Klee One", "IBM Plex Sans JP"];
  OUTPUT_DIR = join(import.meta.dirname, "../.fonts");
  API_BASE = "https://gwfh.mranftl.com/api/fonts";
  allFonts: FontMeta[] = [];

  async ensureOutputDir() {
    await fs.mkdir(this.OUTPUT_DIR, { recursive: true });
  }

  async fetchFontMetadata() {
    console.log("📡 Fetching font metadata...");
    this.allFonts = await fetch(this.API_BASE).then((r) => r.json());
  }

  findFontId(name: string) {
    return this.allFonts.find(
      (f) => f.family.toLowerCase() === name.toLowerCase(),
    )?.id;
  }

  buildDownloadUrl(id: string) {
    return `${this.API_BASE}/${id}?download=zip&subsets=latin,japanese&formats=woff2&variants=regular`;
  }

  async downloadAndExtractFont(name: string) {
    const id = this.findFontId(name);
    if (!id) {
      console.error(`❌ Font not found in API: ${name}`);
      return;
    }

    const zipPath = join(this.OUTPUT_DIR, `${id}.zip`);
    const extractDir = join(this.OUTPUT_DIR, id);
    const url = this.buildDownloadUrl(id);

    try {
      console.log(`📦 Downloading ${name} (${id})...`);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      await fs.writeFile(zipPath, Buffer.from(buffer));
      console.log(`📂 Extracting ${id}...`);
      await extract(zipPath, { dir: extractDir });
      await this.renameWoff2(extractDir, id);
      await fs.rm(extractDir, { recursive: true, force: true });
      await fs.rm(zipPath, { force: true });
    } catch (err) {
      console.error(`❌ Failed for ${name}:`, err.message);
    }
  }

  async renameWoff2(dir: string, id: string) {
    const files = await fs.readdir(dir);
    for (const file of files) {
      if (!file.endsWith(".woff2")) continue;
      const src = join(dir, file);
      const dest = join(this.OUTPUT_DIR, `_kiku_font_${id}.woff2`);
      await fs.rename(src, dest);
      console.log(`🎨 Renamed → ${dest}`);
    }
  }

  async run() {
    await this.ensureOutputDir();
    await this.fetchFontMetadata();
    for (const name of this.GOOGLE_FONTS) {
      await this.downloadAndExtractFont(name);
    }
    console.log("\n🎉 All fonts downloaded and renamed!");
  }
}

const script = new Script();
script.run();
