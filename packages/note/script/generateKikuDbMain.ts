import { writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import * as tar from "tar";
import { jmdictParser } from "./parseJmdict.js";
import { kanjiVgParser } from "./parseKanjiVg.js";
import { jpdbScraper } from "./scrapJpdb.js";
import { wkScraper } from "./scrapWk.js";
import { gzipFile } from "./util.js";

type KikuKanji = {
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

type KikuKanjiCompact = [
  string[], // composedOf
  string[], // usedIn
  string, // wkMeaning
  string[], // meanings
  string, // keyword
  { reading: string; percentage: string }[], // readings
  string, // frequency
  string, // kind
  string[], // visuallySimilar
  string[], // related
];

type KikuDbKanji = Record<string, KikuKanji>;
type KikuDbKanjiCompact = Record<string, KikuKanjiCompact>;

type KikuDbMainManifest = {
  files: Record<string, { start: number; end: number; size: number }>;
};

function toCompact(entry: KikuKanji): KikuKanjiCompact {
  return [
    entry.composedOf,
    entry.usedIn,
    entry.wkMeaning,
    entry.meanings,
    entry.keyword,
    entry.readings,
    entry.frequency,
    entry.kind,
    entry.visuallySimilar,
    entry.related,
  ];
}

class Script {
  ROOT_DIR = join(import.meta.dirname, "../");
  DB_DIR = join(this.ROOT_DIR, ".db");
  KIKU_DB_KANJI_JSON = join(this.DB_DIR, "kiku_db_kanji.json");
  KIKU_DB_KANJI_COMPACT_JSON = join(this.DB_DIR, "kiku_db_kanji_compact.json");
  KIKU_DB_KANJI_COMPACT_JSON_GZ = join(
    this.DB_DIR,
    "kiku_db_kanji_compact.json.gz",
  );

  async compareKanjiVgAndJpdb() {
    const kanjiVgJson = await kanjiVgParser.readKanjiVgJson();
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

  async writeKikuDbKanji() {
    const kanjiVgJson = await kanjiVgParser.readKanjiVgJson();
    const jpdbJson = await jpdbScraper.readKanjiJson();
    const wkJson = await wkScraper.readWkKanjiInfoJson();

    const extraKeywordMap = {};
    for (const kanji of Object.keys(jpdbJson)) {
      for (const keyword of jpdbJson[kanji].composedOf) {
        extraKeywordMap[keyword.kanji] = keyword.keyword;
      }
      for (const keyword of jpdbJson[kanji].usedInKanji) {
        extraKeywordMap[keyword.kanji] = keyword.keyword;
      }
    }

    const tempKikuDbKanji: KikuDbKanji = {};
    const meaningIndex: Record<string, Set<string>> = {};

    for (const kanji of Object.keys(kanjiVgJson)) {
      const { composedOf, usedIn } = kanjiVgJson[kanji];
      const wkMeaning = wkJson[kanji]?.primaryMeaning ?? "";
      const visuallySimilar = wkJson[kanji]?.visuallySimilar ?? [];
      const keyword =
        jpdbJson[kanji]?.keyword ?? extraKeywordMap[kanji] ?? "???";
      const readings = jpdbJson[kanji]?.readings ?? [];
      const frequency = jpdbJson[kanji]?.frequency ?? "Unknown";
      const kind = jpdbJson[kanji]?.kind ?? "Unknown";

      tempKikuDbKanji[kanji] = {
        composedOf,
        usedIn,
        wkMeaning,
        meanings: [],
        keyword,
        readings,
        frequency,
        kind,
        visuallySimilar,
        related: [],
      };

      const entry = await jmdictParser.lookup(kanji);
      if (!entry) {
        console.log("term not found", kanji);
        continue;
      }

      const meanings = entry.meanings ?? [];
      tempKikuDbKanji[kanji].meanings = meanings;

      for (const m of meanings) {
        if (!meaningIndex[m]) meaningIndex[m] = new Set();
        meaningIndex[m].add(kanji);
      }
    }

    const kikuDbKanji: KikuDbKanji = {};
    for (const kanji of Object.keys(tempKikuDbKanji)) {
      const entry = tempKikuDbKanji[kanji];
      const meaningSet = new Set<string>();

      for (const meaning of entry.meanings) {
        for (const otherKanji of meaningIndex[meaning] ?? []) {
          if (otherKanji !== kanji) meaningSet.add(otherKanji);
        }
      }

      const related = [...meaningSet];
      kikuDbKanji[kanji] = {
        ...entry,
        related: related,
      };
    }

    console.log(kikuDbKanji);

    const kikuDbKanjiCompact: KikuDbKanjiCompact = {};
    for (const kanji of Object.keys(kikuDbKanji)) {
      kikuDbKanjiCompact[kanji] = toCompact(kikuDbKanji[kanji]);
    }

    await writeFile(
      this.KIKU_DB_KANJI_COMPACT_JSON,
      JSON.stringify(kikuDbKanjiCompact),
    );
  }

  async gzipKikuDbKanjiCompactJson() {
    await gzipFile(
      this.KIKU_DB_KANJI_COMPACT_JSON,
      this.KIKU_DB_KANJI_COMPACT_JSON_GZ,
      false,
    );
  }

  KIKU_DB_MAIN_TAR = join(this.DB_DIR, "_kiku_db_main.tar");
  KIKU_DB_MAIN_MANIFEST_JSON = join(this.DB_DIR, "_kiku_db_main_manifest.json");
  async generateDbMainTar() {
    const filesToInclude = [
      this.KIKU_DB_KANJI_COMPACT_JSON_GZ,
      // this.KIKU_DB_KANJI_COMPACT_JSON,
    ].map((file) => basename(file));

    await tar.create(
      {
        cwd: this.DB_DIR,
        portable: true,
        file: this.KIKU_DB_MAIN_TAR,
      },
      filesToInclude,
    );
  }

  async writeDbMainManifest() {
    let offset = 0; // current byte offset in the tar
    const manifest: KikuDbMainManifest = {
      files: {},
    };

    await tar.t({
      file: this.KIKU_DB_MAIN_TAR,
      onReadEntry(entry) {
        const headerSize = 512;
        const fileSize = entry.size;

        // actual file content inside the tar
        const contentStart = offset + headerSize;
        const contentEnd = contentStart + fileSize - 1;

        console.log({
          path: entry.path,
          contentStart,
          contentEnd,
          fileSize,
        });

        manifest.files[entry.path] = {
          start: contentStart,
          end: contentEnd,
          size: fileSize,
        };

        offset += entry.startBlockSize; // skip header + padded data
      },
    });

    await writeFile(
      this.KIKU_DB_MAIN_MANIFEST_JSON,
      JSON.stringify(manifest, null, 2),
    );
  }
}

const kikuDbMainScript = new Script();
// step 1
// await kikuDbMainScript.compareKanjiVgAndJpdb();

// step 2
// await kikuDbMainScript.writeKikuDbKanji();

// step 3
// await kikuDbMainScript.gzipKikuDbKanjiCompactJson();

// step 4
await kikuDbMainScript.generateDbMainTar();

// step 5
await kikuDbMainScript.writeDbMainManifest();
