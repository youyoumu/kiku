import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";

type JmdictTerm = {
  kanji: string[];
  reading: string[];
  meanings: string[];
};

export class JmdictParser {
  ROOT_PATH = join(import.meta.dirname, "../");
  JMDICT_DIR = join(this.ROOT_PATH, ".jmdict");
  JMDICT_PATH = join(this.JMDICT_DIR, "JMdict_e");
  JMDICT_TERM_PATH = join(this.JMDICT_DIR, "term.json");
  JMDICT_TERM_MAP_PATH = join(this.JMDICT_DIR, "termMap.json");

  async ensureDir() {
    await mkdir(this.JMDICT_DIR, { recursive: true });
  }

  async load() {
    const xml = await readFile(this.JMDICT_PATH, "utf8");
    return cheerio.load(xml, { xmlMode: true });
  }

  async parseAll() {
    const $ = await this.load();

    const entries: {
      kanji: string[];
      reading: string[];
      meanings: string[];
    }[] = [];

    $("entry").each((_, entry) => {
      const $entry = $(entry);

      const kanji = $entry
        .find("k_ele keb")
        .map((_, el) => $(el).text())
        .get();

      const reading = $entry
        .find("r_ele reb")
        .map((_, el) => $(el).text())
        .get();

      const meanings = $entry
        .find("sense gloss")
        .map((_, el) => $(el).text())
        .get();

      entries.push({ kanji, reading, meanings });
    });

    console.log(entries);
    return entries;
  }

  async writeTerm() {
    const terms = await this.parseAll();
    await writeFile(this.JMDICT_TERM_PATH, JSON.stringify(terms, null, 2));
  }

  async writeTermMap() {
    const terms = JSON.parse(
      await readFile(this.JMDICT_TERM_PATH, "utf8"),
    ) as JmdictTerm[];
    const termMap: Record<string, JmdictTerm> = {};
    const duplicatedTerms: JmdictTerm[] = [];
    terms.forEach((term) => {
      term.kanji.forEach((kanji) => {
        if (termMap[kanji]) {
          duplicatedTerms.push(term);
        } else {
          termMap[kanji] = term;
        }
      });
    });

    await writeFile(
      this.JMDICT_TERM_MAP_PATH,
      JSON.stringify(termMap, null, 2),
    );
  }
}

const jmdictParser = new JmdictParser();

// await jmdictParser.writeTerm();

await jmdictParser.writeTermMap();
