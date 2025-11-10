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

self.onmessage = async (e: MessageEvent<QueryRequest>) => {
  if (e.data.type !== "query") return;
  const { kanjiList } = e.data;

  try {
    // Load manifest
    const manifestRes = await fetch(`/${env.KIKU_NOTES_MANIFEST}`);
    if (!manifestRes.ok) throw new Error("Failed to load manifest");
    const manifest = (await manifestRes.json()) as KikuNotesManifest;

    const matchedNotes: AnkiNote[] = [];

    for (const chunk of manifest.chunks) {
      // Load & decompress each chunk sequentially
      const res = await fetch(`/${chunk.file}`);
      if (!res.body) throw new Error(`No body for ${chunk.file}`);

      const ds = new DecompressionStream("gzip");
      const decompressed = res.body.pipeThrough(ds);
      const text = await new Response(decompressed).text();
      const notes = JSON.parse(text) as AnkiNote[];

      // Filter notes that contain any of the kanji in their Expression
      const matches = notes.filter(
        (note) =>
          (note.modelName === "Kiku" || note.modelName === "Lapis") &&
          kanjiList.some((kanji) =>
            note.fields.Expression.value.includes(kanji),
          ),
      );

      if (matches.length > 0) {
        matchedNotes.push(...matches);
      }

      // Optional: stream partial progress to main thread
      self.postMessage({
        type: "progress",
        chunk: chunk.file,
        found: matches.length,
      } satisfies QueryResponse);
    }

    // Done — return all matches
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
