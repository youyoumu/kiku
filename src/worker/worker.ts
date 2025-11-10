import type { AnkiNote, KikuNotesManifest } from "#/types";
import { env } from "#/util/general";

export type WorkerChannels = {
  query: {
    payload: string[];
    result: Record<string, AnkiNote[]>;
  };
  querySharedAndSimilar: {
    payload: string[];
    result: Record<
      string,
      { shared: AnkiNote[]; similar: Record<string, AnkiNote[]> }
    >;
  };
  getSimilarKanji: {
    payload: string;
    result: string[];
  };
};
export type Key = keyof WorkerChannels;
export type WorkerResponse<T extends Key> =
  | { type: T; result: WorkerChannels[T]["result"]; error: null }
  | { type: T; result: null; error: string };
export type WorkerRequest<T extends Key> = {
  type: T;
  payload: WorkerChannels[T]["payload"];
};
type WorkerMethod = (
  payload: WorkerChannels[Key]["payload"],
) => Promise<WorkerChannels[Key]["result"]>;

class AppWorker {
  constructor() {
    AppWorker.manifest = fetch(`/${env.KIKU_NOTES_MANIFEST}`).then((res) =>
      res.json(),
    );

    self.onmessage = async (e: MessageEvent<WorkerRequest<Key>>) => {
      const method = AppWorker[e.data.type] as WorkerMethod;
      method(e.data.payload)
        .then((result) => {
          self.postMessage({
            type: e.data.type,
            result,
            error: null,
          });
        })
        .catch((err) => {
          self.postMessage({
            type: e.data.type,
            result: null,
            error: (err as Error).message,
          });
        });
    };
  }

  static async getSimilarKanji(
    kanji: string,
  ): Promise<WorkerChannels["getSimilarKanji"]["result"]> {
    const store: Record<string, { kanji: string; score: number }> = {};
    const sources = AppWorker.similar_kanji_sources;
    const similarKanjiDbs = await AppWorker.getSimilarKanjiDBs();

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
          score > AppWorker.similar_kanji_min_score ||
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

  static async query(
    kanjiList: string[],
  ): Promise<WorkerChannels["query"]["result"]> {
    const result: Record<string, AnkiNote[]> = {};
    const manifest = await AppWorker.manifest;

    // Create a quick lookup for kanji to reduce nested loops
    const kanjiSet = new Set(kanjiList);

    for (const chunk of manifest.chunks) {
      const res = await fetch(`/${chunk.file}`);
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

  static async querySharedAndSimilar(
    kanjiList: string[],
  ): Promise<WorkerChannels["querySharedAndSimilar"]["result"]> {
    const similarKanji: Record<string, string[]> = Object.fromEntries(
      await Promise.all(
        kanjiList.map(async (k) => [k, await AppWorker.getSimilarKanji(k)]),
      ),
    );

    const allKanji = [
      ...new Set(kanjiList.flatMap((k) => [k, ...(similarKanji[k] ?? [])])),
    ];
    const queryResult = await AppWorker.query(allKanji);

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

  static similar_kanji_min_score = 0.5;
  static manifest: Promise<KikuNotesManifest>;
  static similar_kanji_sources = [
    { file: `/${env.KIKU_DB_SIMILAR_KANJI_FROM_KEISEI}`, base_score: 0.65 },
    { file: `/${env.KIKU_DB_SIMILAR_KANJI_MANUAL}`, base_score: 0.9 },
    { file: `/${env.KIKU_DB_SIMILAR_KANJI_WK_NIAI_NOTO}`, base_score: 0.1 },
  ];
  //biome-ignore format: this looks nicer
  static alternative_similar_kanji_sources = [
    { file: `/${env.KIKU_DB_SIMILAR_KANJI_OLD_SCRIPT}`, base_score: 0.4 },
    { file: `/${env.KIKU_DB_SIMILAR_KANJI_STROKE_EDIT_DIST}`, base_score: -0.2, },
    { file: `/${env.KIKU_DB_SIMILAR_KANJI_YL_RADICAL}`, base_score: -0.2 },
  ];

  static dbCache:
    | Record<
        string,
        Record<string, Array<string | { score: number; kan: string }>>
      >
    | undefined = undefined;

  static async getSimilarKanjiDBs() {
    if (AppWorker.dbCache) return AppWorker.dbCache;
    AppWorker.dbCache = {};
    const allSources = [
      ...AppWorker.similar_kanji_sources,
      // ...WorkerMain.alternative_similar_kanji_sources,
    ];
    for (const src of allSources) {
      if (!AppWorker.dbCache[src.file]) {
        const res = await fetch(src.file);
        if (!res.ok) throw new Error(`Failed to load ${src.file}`);
        AppWorker.dbCache[src.file] = await res.json();
      }
    }
    return AppWorker.dbCache;
  }
}

new AppWorker();
