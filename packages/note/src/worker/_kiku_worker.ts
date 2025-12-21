import type {
  AnkiFields,
  AnkiNote,
  KanjiInfo,
  KanjiInfoCompact,
  KikuDbMainManifest,
  KikuNotesManifest,
} from "#/types";
import type { KikuConfig } from "#/util/config";
import type { Env } from "#/util/general";

let ankiConnectAddress = "";

const logger = {
  trace: (...args: unknown[]) => postMessage({ log: { level: "trace", args } }),
  debug: (...args: unknown[]) => postMessage({ log: { level: "debug", args } }),
  info: (...args: unknown[]) => postMessage({ log: { level: "info", args } }),
  warn: (...args: unknown[]) => postMessage({ log: { level: "warn", args } }),
  error: (...args: unknown[]) => postMessage({ log: { level: "error", args } }),
};

const AnkiConnect = {
  invoke: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch(ankiConnectAddress, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version: 6, params }),
    });

    const result = await res.json();
    if (result.error) throw new Error(result.error);
    return result;
  },

  queryFieldContains: async ({
    kanjiList,
    readingList,
    expressionList,
  }: {
    kanjiList?: string[];
    readingList?: string[];
    expressionList?: string[];
  }) => {
    const kanjiListResult: Record<string, AnkiNote[]> = {};
    const readingListResult: Record<string, AnkiNote[]> = {};
    const expressionListResult: Record<string, AnkiNote[]> = {};

    const noteFilter = `("note:Kiku" OR "note:Lapis")`;

    // --- search kanji (contains) ---
    if (kanjiList) {
      for (const kanji of kanjiList) {
        const query = `${noteFilter} AND "Expression:*${kanji}*"`;

        const idsRes = await AnkiConnect.invoke("findNotes", { query });
        const ids: number[] = idsRes.result ?? [];
        if (ids.length === 0) continue;

        const notesRes = await AnkiConnect.invoke("notesInfo", { notes: ids });
        kanjiListResult[kanji] = notesRes.result ?? [];
      }
    }

    // --- search reading (exact) ---
    if (readingList) {
      for (const reading of readingList) {
        const query = `${noteFilter} AND "ExpressionReading:${reading}"`;

        const idsRes = await AnkiConnect.invoke("findNotes", { query });
        const ids: number[] = idsRes.result ?? [];
        if (ids.length === 0) continue;

        const notesRes = await AnkiConnect.invoke("notesInfo", { notes: ids });
        readingListResult[reading] = notesRes.result ?? [];
      }
    }

    // --- search expression (exact) ---
    if (expressionList) {
      for (const expression of expressionList) {
        const query = `${noteFilter} AND "Expression:${expression}"`;

        const idsRes = await AnkiConnect.invoke("findNotes", { query });
        const ids: number[] = idsRes.result ?? [];
        if (ids.length === 0) continue;

        const notesRes = await AnkiConnect.invoke("notesInfo", { notes: ids });
        expressionListResult[expression] = notesRes.result ?? [];
      }
    }

    return {
      kanjiListResult,
      readingListResult,
      expressionListResult,
    };
  },
};

export class Nex {
  assetsPath!: string;
  env!: Env;
  config!: KikuConfig;
  preferAnkiConnect!: boolean;
  cache = new Map();

  constructor(payload: {
    assetsPath: string;
    env: Env;
    config: KikuConfig;
    preferAnkiConnect: boolean;
  }) {
    this.init(payload);
  }

  init(payload: {
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
    ankiConnectAddress = this.config.ankiConnectAddress;
  }

  chunkCache = new Map<string, AnkiNote[]>();
  async query({
    kanjiList,
    readingList,
    expressionList,
  }: {
    kanjiList: string[];
    readingList: string[];
    expressionList: string[];
  }) {
    const queryWithNotesCache = async () => {
      const kanjiListResult: Record<string, AnkiNote[]> = {};
      const readingListResult: Record<string, AnkiNote[]> = {};
      const expressionListResult: Record<string, AnkiNote[]> = {};

      const manifest = await this.notesManifest();

      const kanjiSet = new Set(kanjiList);
      const readingSet = new Set(readingList);
      const expressionSet = new Set(expressionList);

      for (const chunk of manifest.chunks) {
        let notes = this.chunkCache.get(chunk.file);
        if (!notes) {
          const res = await fetch(`${this.assetsPath}/${chunk.file}`);
          const text = await Nex.gunzip(res).text();
          notes = JSON.parse(text) as AnkiNote[];
          this.chunkCache.set(chunk.file, notes);
        }

        for (const note of notes) {
          if (note.modelName !== "Kiku" && note.modelName !== "Lapis") continue;

          const expr = note.fields.Expression.value;
          const reading = note.fields.ExpressionReading?.value ?? "";

          // ------- Kanji Search (contains) -------
          for (const kanji of kanjiSet) {
            if (expr.includes(kanji)) {
              kanjiListResult[kanji] ??= [];
              kanjiListResult[kanji].push(note);
            }
          }

          // ------- Reading Search (exact) -------
          if (readingSet.has(reading)) {
            readingListResult[reading] ??= [];
            readingListResult[reading].push(note);
          }

          // ------- Expression Search (exact) -------
          if (expressionSet.has(expr)) {
            expressionListResult[expr] ??= [];
            expressionListResult[expr].push(note);
          }
        }
      }

      return {
        kanjiListResult,
        readingListResult,
        expressionListResult,
      };
    };

    if (this.preferAnkiConnect) {
      try {
        logger.info("Querying with AnkiConnect");
        return await AnkiConnect.queryFieldContains({
          kanjiList,
          readingList,
          // expressionList intentionally not passed yet
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
        // expressionList intentionally not passed yet
      });
    }
  }
  debounceTimer: number | null = null;
  debounceMs = 200;
  async queryShared({
    kanjiList,
    readingList,
    expressionList,
    ankiFields,
  }: {
    kanjiList: string[];
    readingList?: string[];
    expressionList?: string[];
    ankiFields: AnkiFields;
  }) {
    return new Promise<{
      kanjiResult: Record<string, AnkiNote[]>;
      readingResult: Record<string, AnkiNote[]>;
      expressionResult: Record<string, AnkiNote[]>;
    }>((resolve) => {
      this.pendingQueryShared.push({
        kanjiList,
        readingList: readingList ?? [],
        expressionList: expressionList ?? [],
        ankiFields,
        resolve,
      });
      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      this.debounceTimer = setTimeout(() => {
        this.actualQueryShared();
      }, this.debounceMs);
    });
  }

  pendingQueryShared: {
    kanjiList: string[];
    readingList: string[];
    expressionList: string[];
    ankiFields: AnkiFields;
    resolve: (v: {
      kanjiResult: Record<string, AnkiNote[]>;
      readingResult: Record<string, AnkiNote[]>;
      expressionResult: Record<string, AnkiNote[]>;
    }) => void;
  }[] = [];

  async actualQueryShared() {
    const requests = this.pendingQueryShared;
    this.pendingQueryShared = [];

    const batchedKanjiList = [...new Set(requests.flatMap((r) => r.kanjiList))];
    const batchedReadingList = [
      ...new Set(requests.flatMap((r) => r.readingList)),
    ];
    const batchedExpressionList = [
      ...new Set(requests.flatMap((r) => r.expressionList)),
    ];

    const { kanjiListResult, readingListResult, expressionListResult } =
      await this.query({
        kanjiList: batchedKanjiList,
        readingList: batchedReadingList,
        expressionList: batchedExpressionList,
      });

    for (const req of requests) {
      const { kanjiList, readingList, expressionList, ankiFields } = req;

      //TODO: use card id to filter
      const filterSameNote = (note: AnkiNote) => {
        if (
          note.fields.Expression.value === ankiFields.Expression &&
          note.fields.Sentence.value === ankiFields.Sentence &&
          note.fields.Hint.value === ankiFields.Hint &&
          note.fields.MiscInfo.value === ankiFields.MiscInfo
        )
          return false;
        return true;
      };

      // --- kanji ---
      const kanjiResult: Record<string, AnkiNote[]> = {};
      for (const kanji of kanjiList) {
        kanjiResult[kanji] =
          kanjiListResult[kanji]?.filter(filterSameNote) ?? [];
      }

      // --- reading ---
      const readingResult: Record<string, AnkiNote[]> = {};
      for (const reading of readingList) {
        readingResult[reading] =
          readingListResult[reading]
            ?.filter(filterSameNote)
            .filter(
              (n) => n.fields.Expression.value !== ankiFields.Expression,
            ) ?? [];
      }

      // --- expression ---
      const expressionResult: Record<string, AnkiNote[]> = {};
      for (const expression of expressionList) {
        expressionResult[expression] =
          expressionListResult[expression]?.filter(filterSameNote) ?? [];
      }

      req.resolve({
        kanjiResult,
        readingResult,
        expressionResult,
      });
    }
  }

  lookupKanjiPromise:
    | PromiseWithResolvers<Record<string, KanjiInfo>>
    | undefined;
  async lookupKanji(kanji: string): Promise<KanjiInfo | undefined> {
    const key = this.lookupKanji.name;
    const cached = this.cache.get(key);
    let result: KanjiInfo | undefined;
    if (cached) {
      result = cached[kanji];
    } else if (this.lookupKanjiPromise) {
      result = (await this.lookupKanjiPromise.promise)[kanji];
    } else {
      this.lookupKanjiPromise = Promise.withResolvers();
      const manifest = await this.dbMainManifest();
      const file = manifest.files[this.env.KIKU_DB_KANJI_COMPACT];
      let res = await fetch(`${this.assetsPath}/${this.env.KIKU_DB_MAIN_TAR}`, {
        headers: { Range: `bytes=${file.start}-${file.end}` },
      });
      if (res.status === 200) {
        res = Nex.sliceBytes(await res.arrayBuffer(), file.start, file.end);
      } else {
        let buf = await res.arrayBuffer();
        if (buf.byteLength > file.size) {
          buf = buf.slice(0, file.size);
        }
        res = new Response(buf);
      }

      const text = await Nex.gunzip(res).text();
      const dbKanjiCompact = JSON.parse(text);
      const dbKanji: Record<string, KanjiInfo> = {};
      for (const kanji of Object.keys(dbKanjiCompact)) {
        const data = Nex.fromCompact(dbKanjiCompact[kanji]);
        if (data) dbKanji[kanji] = data;
      }
      this.cache.set(key, dbKanji);
      this.lookupKanjiPromise.resolve(dbKanji);
      result = dbKanji[kanji];
    }
    return result;
  }

  async dbMainManifest(): Promise<KikuDbMainManifest> {
    const key = this.dbMainManifest.name;
    if (this.cache.has(key)) return this.cache.get(key);
    const res = await fetch(
      `${this.assetsPath}/${this.env.KIKU_DB_MAIN_MANIFEST_JSON}`,
    );
    if (!res.ok) {
      logger.error("Failed to load db main manifest");
      throw new Error(`Failed to load db main manifest`);
    }
    const manifest = await res.json();
    this.cache.set(key, manifest);
    return manifest;
  }

  async notesManifest(): Promise<KikuNotesManifest> {
    const key = this.notesManifest.name;
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

  static fromCompact(c: KanjiInfoCompact | undefined): KanjiInfo | undefined {
    if (!c) return undefined;
    return {
      composedOf: c[0],
      usedIn: c[1],
      wkMeaning: c[2],
      meanings: c[3],
      keyword: c[4],
      readings: c[5],
      frequency: c[6],
      kind: c[7],
      visuallySimilar: c[8],
      related: c[9],
    };
  }

  static gunzip(res: Response) {
    if (!res.body) {
      logger.error("No body for", res.url);
      throw new Error(`No body for ${res.url}`);
    }
    const ds = new DecompressionStream("gzip");
    const decompressed = res.body.pipeThrough(ds);
    return new Response(decompressed);
  }

  static sliceBytes(buf: ArrayBuffer, start: number, end: number): Response {
    const slice = buf.slice(start, end + 1);
    return new Response(slice);
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
  async init(payload: ConstructorParameters<typeof Nex>[0]) { if (nex) { nex.init(payload); } else { nex = new Nex(payload); }},
  notesManifest: () => nex.notesManifest(),
  query: (...args: Parameters<typeof nex.query>) => nex.query(...args),
  queryShared: ( ...args: Parameters<typeof nex.queryShared>) => nex.queryShared(...args),
  lookupKanji: (...args: Parameters<typeof nex.lookupKanji>) => nex.lookupKanji(...args),
} satisfies NexApi$;

export type NexApi = typeof nexApi;

expose(nexApi);
