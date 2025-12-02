import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";

class KanjiByFrequency {
  KYOIKU_URL = "https://jpdb.io/kanji-by-frequency?show_only=kyouiku";
  JOYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jouyou";
  JINMEIYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jinmeiyou";
  HYOGAI_URL = "https://jpdb.io/kanji-by-frequency?show_only=hyougai";

  root = join(import.meta.dirname, "../../");
  jpdbDir = join(this.root, ".jpdb");
  kanjiByFrequency = join(this.jpdbDir, "kanji-by-frequency");
  kyoikuHtml = join(this.kanjiByFrequency, "kyoiku.html");
  kyoikuJson = join(this.kanjiByFrequency, "kyoiku.json");
  joyoHtml = join(this.kanjiByFrequency, "joyo.html");
  joyoJson = join(this.kanjiByFrequency, "joyo.json");
  jinmeiyoHtml = join(this.kanjiByFrequency, "jinmeiyo.html");
  jinmeiyoJson = join(this.kanjiByFrequency, "jinmeiyo.json");
  hyogaiHtml = join(this.kanjiByFrequency, "hyogai.html");
  hyogaiJson = join(this.kanjiByFrequency, "hyogai.json");

  async mkdir() {
    await mkdir(this.kanjiByFrequency, { recursive: true });
  }

  async writeKanjiByFrequencyHtml() {
    const kyoikuRes = await fetch(this.KYOIKU_URL);
    const kyoikuHtml = await kyoikuRes.text();
    await writeFile(this.kyoikuHtml, kyoikuHtml);

    const joyoRes = await fetch(this.JOYO_URL);
    const joyoHtml = await joyoRes.text();
    await writeFile(this.joyoHtml, joyoHtml);

    const jinmeiyoRes = await fetch(this.JINMEIYO_URL);
    const jinmeiyoHtml = await jinmeiyoRes.text();
    await writeFile(this.jinmeiyoHtml, jinmeiyoHtml);

    const hyogaiRes = await fetch(this.HYOGAI_URL);
    const hyogaiHtml = await hyogaiRes.text();
    await writeFile(this.hyogaiHtml, hyogaiHtml);
  }

  async writeKanjiByFrequencyJson() {
    const category = [
      {
        src: this.kyoikuHtml,
        dest: this.kyoikuJson,
      },
      {
        src: this.joyoHtml,
        dest: this.joyoJson,
      },
      {
        src: this.jinmeiyoHtml,
        dest: this.jinmeiyoJson,
      },
      {
        src: this.hyogaiHtml,
        dest: this.hyogaiJson,
      },
    ];

    for (const { src, dest } of category) {
      const $ = cheerio.load(await readFile(src, "utf8"));
      const rows = $("tbody tr");
      const json: { position: string; kanji: string; kind: string }[] = [];

      rows.each((i, row) => {
        if (i === 0) return;
        const position = $(row)
          .children("td")
          .first()
          .text()
          .replace(/\.$/, "");
        const kanji = $(row).children("td").first().next().text();
        const kind = $(row).children("td").first().next().next().text();
        json.push({ position, kanji, kind });
      });
      await writeFile(dest, JSON.stringify(json, null, 2));
    }
  }
}

const kanjiByFrequency = new KanjiByFrequency();
// await kanjiByFrequency.mkdir();
// kanjiByFrequency.writeKanjiByFrequencyHtml();

await kanjiByFrequency.writeKanjiByFrequencyJson();
