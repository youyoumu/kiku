import { cp, stat } from "node:fs/promises";
import { basename, join } from "node:path";

class Script {
  BASE_DIR =
    process.platform === "win32"
      ? process.env.APPDATA
      : join(process.env.HOME ?? "", ".local/share");
  USER = "yym"; // change if needed
  ANKI_MEDIA_DIR = join(
    this.BASE_DIR ?? "",
    `Anki2/${this.USER}/collection.media`,
  );

  async ensureAnkiDir() {
    await stat(this.ANKI_MEDIA_DIR);
  }

  async copyFiles(files: string[], srcDir: string) {
    for (const file of files) {
      const src = join(srcDir, file);
      await stat(src);
      const dest = join(this.ANKI_MEDIA_DIR, file);
      await cp(src, dest);
      console.log(`✅ Copied ${basename(src)}`);
    }
  }

  async copyDist() {
    const FILES = [
      "_kiku_front.html",
      "_kiku_back.html",
      "_kiku_style.css",
      "_kiku.css",
      "_kiku.js",
      "_kiku_lazy.js",
      "_kiku_libs.js",
      "_kiku_shared.js",
      "_kiku_worker.js",
      "_kiku_plugin.js",
    ];

    const srcDir = join(import.meta.dirname, "../dist");

    console.log("\n📁 Copying DIST files...");
    await this.copyFiles(FILES, srcDir);
  }

  async copyFonts() {
    const FONTS = [
      "_kiku_font_hina-mincho.woff2",
      "_kiku_font_klee-one.woff2",
      "_kiku_font_ibm-plex-sans-jp.woff2",
    ];

    const srcDir = join(import.meta.dirname, "../.fonts");

    console.log("\n📁 Copying FONTS...");
    await this.copyFiles(FONTS, srcDir);
  }

  async copyDatabases() {
    const DBS = [
      "_kiku_db_similar_kanji_from_keisei.json.gz",
      "_kiku_db_similar_kanji_lookup.json.gz",
      "_kiku_db_similar_kanji_manual.json.gz",
      "_kiku_db_similar_kanji_old_script.json.gz",
      "_kiku_db_similar_kanji_stroke_edit_dist.json.gz",
      "_kiku_db_similar_kanji_wk_niai_noto.json.gz",
      "_kiku_db_similar_kanji_yl_radical.json.gz",
    ];

    const srcDir = join(import.meta.dirname, "../.db");
    console.log("\n📁 Copying DATABASES...");
    await this.copyFiles(DBS, srcDir);
  }

  async run() {
    console.log(`🔍 Checking Anki collection at: ${this.ANKI_MEDIA_DIR}`);
    await this.ensureAnkiDir();
    await this.copyDist();
    await this.copyFonts();
    await this.copyDatabases();
    console.log("\n🎉 Done!");
  }
}

const script = new Script();
script.run();
