import type { AnkiNote, Kanji, KikuNotesManifest } from "#/types";
import type { KikuConfig } from "#/util/config";
import type { Env } from "#/util/general";

type SimilarKanjiDB = Record<
  string,
  Array<string | { score: number; kan: string }>
>;
type SimilarKanjiDBSource = Record<string, SimilarKanjiDB>;

export class Nex {
  assetsPath: string;
  env: Env;
  config: KikuConfig;

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

  constructor(payload: {
    assetsPath: string;
    env: Env;
    config: KikuConfig;
  }) {
    this.assetsPath = payload.assetsPath;
    this.env = payload.env;
    this.config = payload.config;
  }
  async getSimilarKanji(kanji: string) {
    const store: Record<string, { kanji: string; score: number }> = {};
    const sources = this.similar_kanji_sources();
    const similarKanjiDbs = await this.getSimilarKanjiDBs();

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

  async query(kanjiList: string[]) {
    const result: Record<string, AnkiNote[]> = {};
    const manifest = await this.manifest();

    // Create a quick lookup for kanji to reduce nested loops
    const kanjiSet = new Set(kanjiList);
    console.log("DEBUG[1059]: kanjiSet=", kanjiSet);

    for (const chunk of manifest.chunks) {
      const res = await fetch(`${this.assetsPath}/${chunk.file}`);
      if (!res.body) throw new Error(`No body for ${chunk.file}`);

      const ds = new DecompressionStream("gzip");
      const decompressed = res.body.pipeThrough(ds);
      const text = await new Response(decompressed).text();
      const notes = JSON.parse(text) as AnkiNote[];

      for (const note of notes) {
        // Skip irrelevant models early
        if (note.modelName !== "Kiku" && note.modelName !== "Lapis") continue;

        const expr = note.fields.Expression.value;

        // Only check relevant kanji that actually appear in the expression
        for (const kanji of kanjiSet) {
          if (expr.includes(kanji)) {
            result[kanji] ??= [];
            result[kanji].push(note);
          }
        }
      }
    }

    return result;
  }

  async querySharedAndSimilar(kanjiList: string[]) {
    const similarKanji: Record<string, string[]> = Object.fromEntries(
      await Promise.all(
        kanjiList.map(async (k) => [k, await this.getSimilarKanji(k)]),
      ),
    );

    const allKanji = [
      ...new Set(kanjiList.flatMap((k) => [k, ...(similarKanji[k] ?? [])])),
    ];
    const queryResult = await this.query(allKanji);

    const result: Record<
      string,
      { shared: AnkiNote[]; similar: Record<string, AnkiNote[]> }
    > = {};

    for (const kanji of kanjiList) {
      const similars = similarKanji[kanji] ?? [];

      result[kanji] = {
        shared: queryResult[kanji] ?? [],
        similar: Object.fromEntries(
          similars
            .filter((k) => queryResult[k])
            .map((k) => [k, queryResult[k]]),
        ),
      };
    }

    return result;
  }

  lookupCache: Record<string, Kanji> | undefined;
  async lookup(kanji: string) {
    if (this.lookupCache) return this.lookupCache[kanji];
    const res = await fetch(
      `${this.assetsPath}/${this.env.KIKU_DB_SIMILAR_KANJI_LOOKUP}`,
    );
    if (!res.ok) throw new Error(`Failed to lookup ${kanji}`);
    const lookupCache = await res.json();
    this.lookupCache = lookupCache;
    return lookupCache[kanji];
  }

  similar_kanji_min_score = 0.5;
  manifestCache: KikuNotesManifest | undefined;
  async manifest() {
    if (this.manifestCache) return this.manifestCache;
    const manifest = fetch(
      `${this.assetsPath}/${this.env.KIKU_NOTES_MANIFEST}`,
    ).then((res) => res.json()) as Promise<KikuNotesManifest>;
    return manifest;
  }

  similarKanjiDbSource: SimilarKanjiDBSource | undefined = undefined;
  async getSimilarKanjiDBs() {
    if (this.similarKanjiDbSource) return this.similarKanjiDbSource;
    const similarKanjiDbSource: SimilarKanjiDBSource = {};
    const allSources = [
      ...this.similar_kanji_sources(),
      // ...this.alternative_similar_kanji_sources,
    ];
    for (const src of allSources) {
      if (!similarKanjiDbSource[src.file]) {
        const res = await fetch(`${src.file}`);
        if (!res.ok) throw new Error(`Failed to load ${src.file}`);
        similarKanjiDbSource[src.file] = await res.json();
      }
    }
    this.similarKanjiDbSource = similarKanjiDbSource;
    return this.similarKanjiDbSource;
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
