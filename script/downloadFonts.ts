import fs from "node:fs/promises";
import path, { join } from "node:path";
import extract from "extract-zip";

const googleFonts = [
  "Hina Mincho",
  "Klee One",
  "Noto Sans JP",
  "Noto Serif JP",
  "IBM Plex Sans JP",
];

const outputDir = join(import.meta.dirname, "../.fonts");
await fs.mkdir(outputDir, { recursive: true });

// Fetch all fonts metadata from GWFH
console.log("📡 Fetching font metadata...");
const allFonts = await fetch("https://gwfh.mranftl.com/api/fonts").then((r) =>
  r.json(),
);

// Helper: find font by name (case-insensitive)
const findFontId = (name: string) =>
  allFonts.find((f) => f.family.toLowerCase() === name.toLowerCase())?.id;

// Core function
async function downloadAndExtractFont(name) {
  const id = findFontId(name);
  if (!id) {
    console.error(`❌ Font not found in API: ${name}`);
    return;
  }

  const zipPath = path.join(outputDir, `${id}.zip`);
  const extractDir = path.join(outputDir, id);
  const url = `https://gwfh.mranftl.com/api/fonts/${id}?download=zip&subsets=latin,japanese&formats=woff2&variants=regular`;

  try {
    console.log(`📦 Downloading ${name} (${id})...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const buffer = await res.arrayBuffer();
    await fs.writeFile(zipPath, Buffer.from(buffer));
    console.log(`✅ Saved → ${zipPath}`);

    // Extract
    await extract(zipPath, { dir: extractDir });
    console.log(`📂 Extracted → ${extractDir}`);

    // Rename .woff2 files to _kiku_font_[id].woff2
    const files = await fs.readdir(extractDir);
    for (const file of files) {
      if (file.endsWith(".woff2")) {
        const oldPath = path.join(extractDir, file);
        const newPath = path.join(outputDir, `_kiku_font_${id}.woff2`);
        await fs.rename(oldPath, newPath);
        console.log(`🎨 Renamed → ${newPath}`);
      }
    }

    // Cleanup extracted dir + zip
    await fs.rm(extractDir, { recursive: true, force: true });
    await fs.rm(zipPath, { force: true });
  } catch (err) {
    console.error(`❌ Failed for ${name}:`, err.message);
  }
}

// Sequential download & extract
for (const name of googleFonts) {
  await downloadAndExtractFont(name);
  console.log("🎉 All fonts downloaded and renamed!");
}
