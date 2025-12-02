import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";

type Kanji = {
  svg: string;
  keyword: string;
  frequency: string;
  type: string;
  kanji: string;
  heisig: string;
  readings: {
    reading: string;
    percentage: string;
  }[];
  composedOf: {
    kanji: string;
    keyword: string;
  }[];
  usedInKanji: {
    kanji: string;
    keyword: string;
  }[];
};

type KanjiFreqKind = {
  position: string;
  kanji: string;
  kind: string;
};

class KanjiByFrequency {
  KYOIKU_URL = "https://jpdb.io/kanji-by-frequency?show_only=kyouiku";
  JOYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jouyou";
  JINMEIYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jinmeiyou";
  HYOGAI_URL = "https://jpdb.io/kanji-by-frequency?show_only=hyougai";

  root = join(import.meta.dirname, "../../");
  jpdbDir = join(this.root, ".jpdb");
  kanjiByFrequencyDir = join(this.jpdbDir, "kanji-by-frequency");
  kanjiDir = join(this.jpdbDir, "kanji");
  kanjiErrorJson = join(this.jpdbDir, "kanji-error.json");

  kyoikuHtml = join(this.kanjiByFrequencyDir, "kyoiku.html");
  kyoikuJson = join(this.kanjiByFrequencyDir, "kyoiku.json");
  joyoHtml = join(this.kanjiByFrequencyDir, "joyo.html");
  joyoJson = join(this.kanjiByFrequencyDir, "joyo.json");
  jinmeiyoHtml = join(this.kanjiByFrequencyDir, "jinmeiyo.html");
  jinmeiyoJson = join(this.kanjiByFrequencyDir, "jinmeiyo.json");
  hyogaiHtml = join(this.kanjiByFrequencyDir, "hyogai.html");
  hyogaiJson = join(this.kanjiByFrequencyDir, "hyogai.json");

  async mkdir() {
    await mkdir(this.kanjiByFrequencyDir, { recursive: true });
    await mkdir(this.kanjiDir, { recursive: true });
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

  async writeKanjiHtml(someKanjis?: string[]) {
    const kyoiku = JSON.parse(
      await readFile(this.kyoikuJson, "utf8"),
    ) as KanjiFreqKind[];
    const joyo = JSON.parse(
      await readFile(this.joyoJson, "utf8"),
    ) as KanjiFreqKind[];
    const jinmeiyo = JSON.parse(
      await readFile(this.jinmeiyoJson, "utf8"),
    ) as KanjiFreqKind[];
    const hyogai = JSON.parse(
      await readFile(this.hyogaiJson, "utf8"),
    ) as KanjiFreqKind[];

    const merged = [...kyoiku, ...joyo, ...jinmeiyo, ...hyogai];
    const kanjis = someKanjis ?? [...new Set(merged.map((k) => k.kanji))];

    console.log(`Total kanji to fetch: ${kanjis.length}`);
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let kanjiError: string[] = [];

    for (let i = 0; i < kanjis.length; i++) {
      const kanji = kanjis[i];
      const url = `https://jpdb.io/kanji/${encodeURIComponent(kanji)}?expand=k`;

      console.log(`[${i + 1}/${kanjis.length}] Fetching ${kanji} (${url})`);

      try {
        const res = await fetch(url);
        const html = await res.text();

        const dest = join(this.kanjiDir, `${kanji}.html`);
        await writeFile(dest, html);

        console.log(`Saved → ${dest}`);
      } catch (err) {
        kanjiError.push(kanji);
        console.error(`Failed to fetch ${kanji}:`, err);
      }

      await sleep(250);
    }

    try {
      const kanjiErrorJson = JSON.parse(
        await readFile(this.kanjiErrorJson, "utf8"),
      );
      kanjiError = Array.from(new Set([...kanjiError, ...kanjiErrorJson]));
    } catch {
      console.log("Error reading kanjiErrorJson");
    }
    await writeFile(this.kanjiErrorJson, JSON.stringify(kanjiError, null, 2));
  }
}

const kanjiByFrequency = new KanjiByFrequency();
await kanjiByFrequency.mkdir();

// fist step
// kanjiByFrequency.writeKanjiByFrequencyHtml();

// second step
// await kanjiByFrequency.writeKanjiByFrequencyJson();

// third step
await kanjiByFrequency.writeKanjiHtml();
