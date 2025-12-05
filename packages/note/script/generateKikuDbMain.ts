import { jpdbScraper } from "./scrapJpdb.js";
import { kanjiVgScraper } from "./scrapKanjiVg.js";

class Script {
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
}

const kikuDbMainScript = new Script();
await kikuDbMainScript.compareKanjiVgAndJpdb();
