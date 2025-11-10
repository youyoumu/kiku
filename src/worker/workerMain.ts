import type { AnkiNote, KikuNotesManifest } from "#/types";
import { env } from "#/util/general";

export type QueryRequest = {
  type: "query";
  kanjiList: string[];
};

export type QueryResponse =
  | { type: "progress"; chunk: string; found: number }
  | { type: "success"; totalFound: number; notes: AnkiNote[] }
  | { type: "error"; error: string };

const similar_kanji_sources = [
  { file: `/${env.KIKU_DB_SIMILAR_KANJI_FROM_KEISEI}`, base_score: 0.65 },
  { file: `/${env.KIKU_DB_SIMILAR_KANJI_MANUAL}`, base_score: 0.9 },
  { file: `/${env.KIKU_DB_SIMILAR_KANJI_WK_NIAI_NOTO}`, base_score: 0.1 },
];

const similar_kanji_similar_sources = [
  { file: `/${env.KIKU_DB_SIMILAR_KANJI_OLD_SCRIPT}`, base_score: 0.4 },
  { file: `/${env.KIKU_DB_SIMILAR_KANJI_STROKE_EDIT_DIST}`, base_score: -0.2 },
  { file: `/${env.KIKU_DB_SIMILAR_KANJI_YL_RADICAL}`, base_score: -0.2 },
];

const similar_kanji_min_score = 0.3;

// cache all loaded DBs here
const dbCache: Record<string, Record<string, any>> = {};

async function loadSimilarKanjiDBs() {
  const allSources = [
    ...similar_kanji_sources,
    ...similar_kanji_similar_sources,
  ];
  for (const src of allSources) {
    if (!dbCache[src.file]) {
      const res = await fetch(src.file);
      if (!res.ok) throw new Error(`Failed to load ${src.file}`);
      dbCache[src.file] = await res.json();
    }
  }
}

// inspired by old getSimilar
function getSimilar(
  kanji: string,
  sources: { file: string; base_score: number }[],
  min_score: number,
) {
  const similar: Record<string, { kan: string; score: number }> = {};

  sources.forEach((source) => {
    const db = dbCache[source.file];
    if (!db || !(kanji in db)) return;

    db[kanji].forEach((sim_info: any) => {
      const isObject = typeof sim_info !== "string" && "kan" in sim_info;
      const sim_kanji = isObject ? sim_info.kan : sim_info;
      const score = source.base_score + (isObject ? (sim_info.score ?? 0) : 0);

      // optionally check if score passes threshold
      const oldScore = similar[sim_kanji]?.score ?? 0;
      if (score > min_score || (score > 0 && oldScore > 0)) {
        similar[sim_kanji] = { kan: sim_kanji, score };
      } else if (score < 0) {
        delete similar[sim_kanji];
      }
    });
  });

  return Object.keys(similar);
}

self.onmessage = async (e: MessageEvent<QueryRequest>) => {
  if (e.data.type !== "query") return;
  const { kanjiList } = e.data;

  try {
    await loadSimilarKanjiDBs();

    kanjiList.forEach((k) => {
      const similar = getSimilar(
        k,
        [...similar_kanji_sources],
        similar_kanji_min_score,
      );
      console.log("DEBUG[960]: similar=", similar);
    });

    const manifestRes = await fetch(`/${env.KIKU_NOTES_MANIFEST}`);
    if (!manifestRes.ok) throw new Error("Failed to load manifest");
    const manifest = (await manifestRes.json()) as KikuNotesManifest;

    const matchedNotes: AnkiNote[] = [];

    for (const chunk of manifest.chunks) {
      const res = await fetch(`/${chunk.file}`);
      if (!res.body) throw new Error(`No body for ${chunk.file}`);

      const ds = new DecompressionStream("gzip");
      const decompressed = res.body.pipeThrough(ds);
      const text = await new Response(decompressed).text();
      const notes = JSON.parse(text) as AnkiNote[];

      const matches = notes.filter(
        (note) =>
          (note.modelName === "Kiku" || note.modelName === "Lapis") &&
          Array.from(kanjiList).some((kanji) =>
            note.fields.Expression.value.includes(kanji),
          ),
      );

      if (matches.length > 0) matchedNotes.push(...matches);

      self.postMessage({
        type: "progress",
        chunk: chunk.file,
        found: matches.length,
      } satisfies QueryResponse);
    }

    self.postMessage({
      type: "success",
      totalFound: matchedNotes.length,
      notes: matchedNotes.sort((a, b) => b.mod - a.mod),
    } satisfies QueryResponse);
  } catch (err) {
    self.postMessage({
      type: "error",
      error: (err as Error).message,
    } satisfies QueryResponse);
  }
};
