import fs from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import archiver from "archiver";

async function zipFiles(files: string[], outputPath: string) {
  const output = fs.createWriteStream(outputPath);
  const archive = archiver("zip", { zlib: { level: 9 } });

  output.on("close", () => {
    console.log(`✅ Created ${outputPath} (${archive.pointer()} bytes)`);
  });

  archive.on("error", (err) => {
    throw err;
  });

  archive.pipe(output);

  for (const file of files) {
    const name = path.basename(file);
    archive.file(file, { name });
  }

  archive.finalize();
}

const filesToZip = ["__init__.py", "config.json", "manifest.json"].map((file) =>
  path.join(import.meta.dirname, "../", file),
);
const outputDir = path.join(import.meta.dirname, "../dist");
await mkdir(outputDir, { recursive: true });
const outputZip = path.join(outputDir, "kiku_note_manager.ankiaddon");

zipFiles(filesToZip, outputZip).catch((err) =>
  console.error("❌ Error creating zip:", err),
);
