import fs from "node:fs";
import https from "node:https";
import path from "node:path";
import { createGzip } from "node:zlib";

const baseUrl =
  "https://raw.githubusercontent.com/youyoumu/wanikani-userscripts/refs/heads/master/wanikani-similar-kanji/db/";

const dbFiles = [
  "from_keisei.json",
  "stroke_edit_dist.json",
  "yl_radical.json",
  "old_script.json",
  "wk_niai_noto.json",
  "manual.json",
  "lookup.json",
];

const outputDir = path.join(import.meta.dirname, "../.db");
fs.mkdirSync(outputDir, { recursive: true });

function downloadFile(url: string, dest: string) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to fetch ${url}: ${res.statusCode}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(resolve));
      })
      .on("error", (err) => {
        fs.unlink(dest, () => reject(err));
      });
  });
}

async function gzipFile(src: string) {
  return new Promise<void>((resolve, reject) => {
    const dest = `${src}.gz`;
    const gzip = createGzip();

    const input = fs.createReadStream(src);
    const output = fs.createWriteStream(dest);

    input.pipe(gzip).pipe(output);

    output.on("finish", () => {
      // Optionally delete the original JSON file
      fs.unlink(src, () => resolve());
    });
    output.on("error", reject);
  });
}

async function main() {
  console.log(`Downloading databases to ${outputDir}...\n`);
  for (const file of dbFiles) {
    const url = `${baseUrl}${file}`;
    const fileName = `_kiku_db_similar_kanji_${file}`;
    const dest = path.join(outputDir, fileName);

    console.log(`→ ${file}`);
    try {
      await downloadFile(url, dest);
      await gzipFile(dest);
    } catch (err) {
      console.error(`Failed for ${file}:`, err.message);
    }
  }
  console.log("\n✅ All downloads + gzip complete!");
}

main();
