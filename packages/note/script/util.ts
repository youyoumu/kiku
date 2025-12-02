import { createReadStream, createWriteStream } from "node:fs";
import { rm } from "node:fs/promises";
import { createGzip } from "node:zlib";

export const AnkiConnect = {
  call: async (action: string, params: Record<string, unknown> = {}) => {
    const res = await fetch("http://127.0.0.1:8765", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, version: 6, params }),
    });

    const result = (await res.json()) as { result: unknown; error?: string };
    if (result.error) {
      throw new Error(result.error);
    }
    return result;
  },
};

export async function gzipFile(
  src: string,
  dest: string = `${src}.gz`,
  removeSrc = true,
) {
  return new Promise<void>((resolve, reject) => {
    const gzip = createGzip();
    const input = createReadStream(src);
    const output = createWriteStream(dest);

    input.pipe(gzip).pipe(output);

    output.on("finish", async () => {
      if (removeSrc) {
        await rm(src, { force: true });
      }
      resolve();
    });

    output.on("error", reject);
  });
}
