import { join } from "path";
import { jmdictParser } from "./parseJmdict.js";
import { jpdbScraper } from "./scrapJpdb.js";
import { kanjiVgScraper } from "./scrapKanjiVg.js";
import { wkScraper } from "./scrapWk.js";

type KikuDbMainEntry = {
  composedOf: string[];
  usedIn: string[];
  wkMeaning: string;
  meanings: string[];
  keyword: string;
  readings: { reading: string; percentage: string }[];
  frequency: string;
  kind: string;
  visuallySimilar: string[];
  related: string[];
};

type KikuDbMain = Record<string, KikuDbMainEntry>;

class Script {
  ROOT_DIR = join(import.meta.dirname, "../");
  DB_DIR = join(this.ROOT_DIR, ".db");
  KIKU_DB_MAIN_JSON = join(this.DB_DIR, "kiku_db_main.json");
  KIKU_DB_MAIN_JSON_GZ = join(this.DB_DIR, "_kiku_db_main.json.gz");

  async compareKanjiVgAndJpdb() {
    const kanjiVgJson = await kanjiVgScraper.readKanjiVgJson();
    const jpdbJson = await jpdbScraper.readKanjiJson();

    const diff: Record<
      string,
      {
        onlyInKanjiVg: string[];
        onlyInJpdb: string[];
        vg: string[];
        jpdb: string[];
      }
    > = {};

    for (const kanji of Object.keys(kanjiVgJson)) {
      const vg = kanjiVgJson[kanji]?.composedOf ?? [];
      const jpdb = (jpdbJson[kanji]?.composedOf ?? []).map((c) => c.kanji);

      const onlyInKanjiVg = vg.filter((x) => !jpdb.includes(x));
      const onlyInJpdb = jpdb.filter((x) => !vg.includes(x));

      if (onlyInKanjiVg.length > 0 || onlyInJpdb.length > 0) {
        diff[kanji] = { onlyInKanjiVg, onlyInJpdb, vg, jpdb };
      }
    }

    Object.keys(diff).forEach((kanji) => {
      const item = diff[kanji];
      if (item.jpdb.length > item.vg.length) {
        console.log(kanji, item);
      }
    });
    return diff;
  }

  async writeKikuDbMain() {
    const kanjiVgJson = await kanjiVgScraper.readKanjiVgJson();
    const jpdbJson = await jpdbScraper.readKanjiJson();
    const wkJson = await wkScraper.readWkKanjiInfoJson();

    const temp: KikuDbMain = {};
    const meaningIndex: Record<string, Set<string>> = {};

    for (const kanji of Object.keys(kanjiVgJson)) {
      const { composedOf, usedIn } = kanjiVgJson[kanji];
      const wkMeaning = wkJson[kanji]?.primaryMeaning ?? "";
      const visuallySimilar = wkJson[kanji]?.visuallySimilar ?? [];
      const keyword = jpdbJson[kanji]?.keyword ?? "???";
      const readings = jpdbJson[kanji]?.readings ?? [];
      const frequency = jpdbJson[kanji]?.frequency ?? "Unknown";
      const kind = jpdbJson[kanji]?.kind ?? "Unknown";

      const entry = await jmdictParser.lookup(kanji);
      if (!entry) {
        console.log("term not found", kanji);
        continue;
      }

      const meanings = entry.meanings ?? [];

      temp[kanji] = {
        composedOf,
        usedIn,
        wkMeaning,
        meanings,
        keyword,
        readings,
        frequency,
        kind,
        visuallySimilar,
        related: [],
      };

      for (const m of meanings) {
        if (!meaningIndex[m]) meaningIndex[m] = new Set();
        meaningIndex[m].add(kanji);
      }
    }

    const kikuDbMain: KikuDbMain = {};
    for (const kanji of Object.keys(temp)) {
      const entry = temp[kanji];
      const meaningSet = new Set<string>();

      for (const meaning of entry.meanings) {
        for (const other of meaningIndex[meaning] ?? []) {
          if (other !== kanji) meaningSet.add(other);
        }
      }

      const related = [...meaningSet];
      kikuDbMain[kanji] = {
        ...entry,
        related: related,
      };
    }

    console.log(kikuDbMain);
  }
}

const kikuDbMainScript = new Script();
// await kikuDbMainScript.compareKanjiVgAndJpdb();

await kikuDbMainScript.writeKikuDbMain();
