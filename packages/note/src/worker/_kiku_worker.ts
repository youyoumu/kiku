import type { AnkiFields, AnkiNote, Kanji, KikuNotesManifest } from "#/types";
import type { KikuConfig } from "#/util/config";
import type { Env } from "#/util/general";

type SimilarKanjiDB = Record<
  string,
  Array<string | { score: number; kan: string }>
>;
type SimilarKanjiDBs = Record<string, SimilarKanjiDB>;

let ankiConnectPort = 8765;

const logger = {
  trace: (...args: unknown[]) => postMessage({ log: { level: "trace", args } }),
  debug: (...args: unknown[]) => postMessage({ log: { level: "debug", args } }),
  info: (...args: unknown[]) => postMessage({ log: { level: "info", args } }),
  warn: (...args: unknown[]) => postMessage({ log: { level: "warn", args } }),
  error: (...args: unknown[]) => postMessage({ log: { level: "error", args } }),
};

const AnkiConnect = {
  invoke: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch(`http://127.0.0.1:${ankiConnectPort}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version: 6, params }),
    });

    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  },

  // Generalized search for Expression:*X* OR Reading:*Y*
  queryFieldContains: async ({
    kanjiList,
    readingList,
  }: {
    kanjiList?: string[];
    readingList?: string[];
  }) => {
    const kanjiListResult: Record<string, AnkiNote[]> = {};
    const readingListResult: Record<string, AnkiNote[]> = {};

    // --- search kanji ---
    if (kanjiList) {
      for (const kanji of kanjiList) {
        const query = `("note:Kiku" OR "note:Lapis") AND "Expression:*${kanji}*"`;

        const idsRes = await AnkiConnect.invoke("findNotes", { query });
        const ids: number[] = idsRes.result ?? [];

        if (ids.length === 0) continue;

        const notesRes = await AnkiConnect.invoke("notesInfo", { notes: ids });
        kanjiListResult[kanji] = notesRes.result ?? [];
      }
    }

    // --- search reading ---
    if (readingList) {
      for (const reading of readingList) {
        const query = `("note:Kiku" OR "note:Lapis") AND "ExpressionReading:${reading}"`;

        const idsRes = await AnkiConnect.invoke("findNotes", { query });
        const ids: number[] = idsRes.result ?? [];

        if (ids.length === 0) continue;

        const notesRes = await AnkiConnect.invoke("notesInfo", { notes: ids });
        readingListResult[reading] = notesRes.result ?? [];
      }
    }

    return { kanjiListResult, readingListResult };
  },
};

export class Nex {
  assetsPath: string;
  env: Env;
  config: KikuConfig;
  preferAnkiConnect: boolean;

  similar_kanji_min_score = 0.5;
  //biome-ignore format: this looks nicer
  similar_kanji_sources = () => [
    { file: `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_FROM_KEISEI}`, base_score: 0.65, },
    { file: `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_MANUAL}`, base_score: 0.9, },
    { file: `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_WK_NIAI_NOTO}`, base_score: 0.1, },
  ];
  //biome-ignore format: this looks nicer
  alternative_similar_kanji_sources = () => [
    { file: `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_OLD_SCRIPT}`, base_score: 0.4, },
    { file: `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_STROKE_EDIT_DIST}`, base_score: -0.2, },
    { file: `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_YL_RADICAL}`, base_score: -0.2, },
  ];

  cache = new Map();

  constructor(payload: {
    assetsPath: string;
    env: Env;
    config: KikuConfig;
    preferAnkiConnect: boolean;
  }) {
    logger.debug("init Worker", payload);

    this.assetsPath = payload.assetsPath;
    this.env = payload.env;
    this.config = payload.config;
    this.preferAnkiConnect = payload.preferAnkiConnect;
    ankiConnectPort = Number(this.config.ankiConnectPort);
  }
  async getSimilarKanji(kanji: string) {
    const store: Record<string, { kanji: string; score: number }> = {};
    const sources = this.similar_kanji_sources();
    const similarKanjiDbs = await this.similarKanjiDBs();

    sources.forEach((source) => {
      const db = similarKanjiDbs[source.file];
      if (!db || !(kanji in db)) return;

      db[kanji].forEach((similarity_info) => {
        const isObject =
          typeof similarity_info !== "string" && "kan" in similarity_info;
        const similar_kanji = isObject ? similarity_info.kan : similarity_info;
        const score =
          source.base_score + (isObject ? (similarity_info.score ?? 0) : 0);

        const oldScore = store[similar_kanji]?.score ?? 0;
        if (
          score > this.similar_kanji_min_score ||
          (score > 0 && oldScore > 0)
        ) {
          store[similar_kanji] = { kanji: similar_kanji, score };
        } else if (score < 0) {
          delete store[similar_kanji];
        }
      });
    });

    return Object.keys(store);
  }

  async query({
    kanjiList,
    readingList,
  }: {
    kanjiList: string[];
    readingList: string[];
  }) {
    const queryWithNotesCache = async () => {
      const kanjiListResult: Record<string, AnkiNote[]> = {};
      const readingListResult: Record<string, AnkiNote[]> = {};

      const manifest = await this.manifest();

      const kanjiSet = kanjiList ? new Set(kanjiList) : null;
      const readingSet = readingList ? new Set(readingList) : null;

      for (const chunk of manifest.chunks) {
        const res = await fetch(`${this.assetsPath}/${chunk.file}`);
        if (!res.body) throw new Error(`No body for ${chunk.file}`);

        const ds = new DecompressionStream("gzip");
        const decompressed = res.body.pipeThrough(ds);
        const text = await new Response(decompressed).text();
        const notes = JSON.parse(text) as AnkiNote[];

        for (const note of notes) {
          if (note.modelName !== "Kiku" && note.modelName !== "Lapis") continue;

          const expr = note.fields.Expression.value;
          const reading = note.fields.ExpressionReading?.value ?? "";

          // ------- Kanji Search -------
          if (kanjiSet) {
            for (const kanji of kanjiSet) {
              if (expr.includes(kanji)) {
                kanjiListResult[kanji] ??= [];
                kanjiListResult[kanji].push(note);
              }
            }
          }

          // ------- Reading Search -------
          if (readingSet) {
            for (const readingStr of readingSet) {
              if (reading === readingStr) {
                readingListResult[readingStr] ??= [];
                readingListResult[readingStr].push(note);
              }
            }
          }
        }
      }

      return { kanjiListResult, readingListResult };
    };

    if (this.preferAnkiConnect) {
      try {
        logger.info("Querying with AnkiConnect");
        return await AnkiConnect.queryFieldContains({
          kanjiList,
          readingList,
        });
      } catch {
        logger.warn(
          "Failed to query with AnkiConnect, falling back to notes cache",
        );
        return await queryWithNotesCache();
      }
    }

    try {
      logger.info("Querying with notes cache");
      return await queryWithNotesCache();
    } catch {
      logger.warn(
        "Failed to query with notes cache, falling back to AnkiConnect",
      );
      return await AnkiConnect.queryFieldContains({
        kanjiList,
        readingList,
      });
    }
  }

  async querySharedAndSimilar({
    kanjiList,
    readingList,
    ankiFields,
  }: {
    kanjiList: string[];
    readingList: string[];
    ankiFields: AnkiFields;
  }) {
    logger.debug("querySharedAndSimilar:", {
      kanjiList,
      readingList,
      ankiFields,
    });
    const similarKanji: Record<string, string[]> = Object.fromEntries(
      await Promise.all(
        kanjiList.map(async (k) => [k, await this.getSimilarKanji(k)]),
      ),
    );

    const allKanji = [
      ...new Set(kanjiList.flatMap((k) => [k, ...(similarKanji[k] ?? [])])),
    ];
    const { kanjiListResult, readingListResult } = await this.query({
      kanjiList: allKanji,
      readingList,
    });

    const kanjiResult: Record<
      string,
      { shared: AnkiNote[]; similar: Record<string, AnkiNote[]> }
    > = {};

    const filterSameNote = (note: AnkiNote) => {
      // TODO: use CardID to filter same note
      //https://github.com/ankitects/anki/pull/4046
      //only available in Anki >25.9
      if (
        note.fields.Expression.value === ankiFields.Expression &&
        note.fields.Sentence.value === ankiFields.Sentence &&
        note.fields.Hint.value === ankiFields.Hint &&
        note.fields.MiscInfo.value === ankiFields.MiscInfo
      )
        return false;
      return true;
    };

    for (const kanji of kanjiList) {
      const similars = similarKanji[kanji] ?? [];

      kanjiResult[kanji] = {
        shared: kanjiListResult[kanji]?.filter(filterSameNote) ?? [],
        similar: Object.fromEntries(
          similars
            .filter((k) => kanjiListResult[k])
            .map((k) => [k, kanjiListResult[k]?.filter(filterSameNote)]),
        ),
      };
    }

    readingList.forEach((reading) => {
      readingListResult[reading] =
        readingListResult[reading]?.filter(filterSameNote) ?? [];
    });

    return { kanjiResult, readingResult: readingListResult };
  }

  async lookup(kanji: string): Promise<Kanji> {
    const key = this.lookup.name;
    const cache = this.cache.get(key);
    if (!cache) {
      const res = await fetch(
        `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_LOOKUP}`,
      );
      if (!res.body) {
        logger.error("Failed to lookup", kanji);
        throw new Error(`Failed to lookup ${kanji}`);
      }
      const ds = new DecompressionStream("gzip");
      const decompressed = res.body.pipeThrough(ds);
      const text = await new Response(decompressed).text();
      const lookupDb = JSON.parse(text);

      this.cache.set(key, lookupDb);
    }
    return this.cache.get(key)[kanji];
  }

  async manifest(): Promise<KikuNotesManifest> {
    const key = this.manifest.name;
    if (this.cache.has(key)) return this.cache.get(key);
    const res = await fetch(
      `${this.assetsPath}/${this.env.KIKU_NOTES_MANIFEST}`,
    );
    if (!res.ok) {
      logger.error("Failed to load manifest");
      throw new Error(`Failed to load manifest`);
    }
    const manifest = await res.json();
    this.cache.set(key, manifest);
    return manifest;
  }

  async similarKanjiDBs(): Promise<SimilarKanjiDBs> {
    const key = this.similarKanjiDBs.name;
    if (this.cache.has(key)) return this.cache.get(key);
    const similarKanjiDbs: SimilarKanjiDBs = {};
    const allSources = [
      ...this.similar_kanji_sources(),
      // ...this.alternative_similar_kanji_sources,
    ];
    for (const src of allSources) {
      if (!similarKanjiDbs[src.file]) {
        const res = await fetch(src.file);
        if (!res.body) {
          logger.error("Failed to load", src.file);
          throw new Error(`Failed to load ${src.file}`);
        }
        const ds = new DecompressionStream("gzip");
        const decompressed = res.body.pipeThrough(ds);
        const text = await new Response(decompressed).text();
        const db = JSON.parse(text);

        similarKanjiDbs[src.file] = db;
      }
    }
    this.cache.set(key, similarKanjiDbs);
    return this.cache.get(key);
  }
}

function expose(api: Record<string, unknown>) {
  self.onmessage = async (e) => {
    const { id, fn, args } = e.data;
    let result: unknown;
    try {
      const maybeFn = api[fn];
      if (typeof maybeFn === "function") {
        result = await maybeFn(...args);
      } else {
        result = maybeFn;
      }
      postMessage({ id, result });
    } catch (error) {
      postMessage({ id, error });
    }
  };
}

let nex: Nex;
type NexKey = keyof typeof Nex.prototype | "init";
type NexApi$ = Partial<Record<NexKey, unknown>>;

//biome-ignore format: this looks nicer
const nexApi = {
  async init(payload: ConstructorParameters<typeof Nex>[0]) { nex = new Nex(payload); },
  manifest: () => nex.manifest(),
  query: (...args: Parameters<typeof nex.query>) => nex.query(...args),
  getSimilarKanji: (...args: Parameters<typeof nex.getSimilarKanji>) => nex.getSimilarKanji(...args),
  querySharedAndSimilar: ( ...args: Parameters<typeof nex.querySharedAndSimilar>) => nex.querySharedAndSimilar(...args),
  lookup: (...args: Parameters<typeof nex.lookup>) => nex.lookup(...args),
} satisfies NexApi$;

export type NexApi = typeof nexApi;

expose(nexApi);
