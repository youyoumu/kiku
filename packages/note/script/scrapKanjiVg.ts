import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";
import extract from "extract-zip";

type KanjiComposition = Record<
  string,
  {
    composedOf: string[];
    usedIn: string[];
  }
>;

class KanjiVgScraper {
  ROOT_DIR = join(import.meta.dirname, "../");
  KANJI_VG_DIR = join(this.ROOT_DIR, ".kanjivg");
  DOWNLOAD_URL =
    "https://github.com/KanjiVG/kanjivg/releases/download/r20250816/kanjivg-20250816-main.zip";
  DOWNLOAD_DEST = join(this.KANJI_VG_DIR, "kanjivg.zip");
  KANJI_VG_KANJI_DIR = join(this.KANJI_VG_DIR, "kanji");

  async fetchAndExtractKanjiVG(): Promise<void> {
    await mkdir(this.KANJI_VG_DIR, { recursive: true });

    console.log("Fetching ZIP from", this.DOWNLOAD_URL);
    const resp = await fetch(this.DOWNLOAD_URL);
    if (!resp.ok || !resp.body) {
      throw new Error(`Failed to download: ${resp.status} ${resp.statusText}`);
    }

    console.log("Writing ZIP to", this.DOWNLOAD_DEST);
    const buffer = await resp.arrayBuffer();
    await writeFile(this.DOWNLOAD_DEST, Buffer.from(buffer));

    console.log("Download complete, extracting...");

    await extract(this.DOWNLOAD_DEST, { dir: this.KANJI_VG_DIR });
    console.log("Extraction complete.");
  }

  parseKanjiVG(svgContent: string) {
    const $ = cheerio.load(svgContent, { xmlMode: true });
    const rootGroup = $("g[kvg\\:element]").first();
    const kanji = rootGroup.attr("kvg:element");
    const composedOf = new Set<string>();
    rootGroup.children("g[kvg\\:element]").each((_, g) => {
      const el = $(g).attr("kvg:element");
      if (el && el !== kanji) {
        composedOf.add(el);
      }
    });

    return {
      kanji,
      composedOf: Array.from(composedOf),
    };
  }

  async writeKanjiVgJson() {
    const files = await readdir(this.KANJI_VG_KANJI_DIR);
    const kanjiComposition: KanjiComposition = {};
    for (let i = 0; i < files.length; i++) {
      // if (i > 1) break;
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(`Processing ${i + 1}/${files.length}`);
      const file = files[i];
      const svgContent = await readFile(
        join(this.KANJI_VG_KANJI_DIR, file),
        "utf8",
      );
      const { kanji, composedOf } = this.parseKanjiVG(svgContent);
      if (!kanji) throw new Error(`Failed to parse ${file}`);
      kanjiComposition[kanji] = { composedOf, usedIn: [] };
    }

    for (const [kanji, data] of Object.entries(kanjiComposition)) {
      for (const part of data.composedOf) {
        if (kanjiComposition[part]) {
          kanjiComposition[part].usedIn.push(kanji);
        }
      }
    }

    console.log(kanjiComposition);
  }
}

const kanjiVgScraper = new KanjiVgScraper();
// step 1
// await kanjiVgScraper.fetchAndExtractKanjiVG();

// step 2
await kanjiVgScraper.writeKanjiVgJson();
