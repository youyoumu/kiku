import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import * as cheerio from "cheerio";
import { gzipFile } from "./util";

type Kanji = {
  position: string;
  kind: string;
  svg: string;
  keyword: string;
  frequency: string;
  type: string;
  kanken: string;
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

class JpdbScraper {
  KYOIKU_URL = "https://jpdb.io/kanji-by-frequency?show_only=kyouiku";
  JOYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jouyou";
  JINMEIYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jinmeiyou";
  HYOGAI_URL = "https://jpdb.io/kanji-by-frequency?show_only=hyougai";

  root = join(import.meta.dirname, "../");
  jpdbDir = join(this.root, ".jpdb");
  kanjiByFrequencyDir = join(this.jpdbDir, "kanji-by-frequency");
  kanjiDir = join(this.jpdbDir, "kanji");
  kanjiJson = join(this.jpdbDir, "kanji.json");
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

  async getKanjiByType() {
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
    return { kyoiku, joyo, jinmeiyo, hyogai };
  }

  async writeKanjiHtml(someKanjis?: string[]) {
    const { kyoiku, joyo, jinmeiyo, hyogai } = await this.getKanjiByType();

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

  async writeKanjiJson() {
    const { kyoiku, joyo, jinmeiyo, hyogai } = await this.getKanjiByType();
    const allKanjiByType = [...kyoiku, ...joyo, ...jinmeiyo, ...hyogai];
    const kanjiJson: Record<string, Kanji> = {};
    const kanjis = (await readdir(this.kanjiDir))
      .map((file) => file.replace(".html", ""))
      .filter((kanji) => kanji);

    for (const kanji of kanjis) {
      const kanjiHtml = await readFile(
        join(this.kanjiDir, `${kanji}.html`),
        "utf8",
      );
      const $ = cheerio.load(kanjiHtml);
      const svg = $("svg.kanji").prop("outerHTML") ?? "";
      const keyword = $('h6.subsection-label:contains("Keyword")')
        .next(".subsection")
        .text()
        .trim();

      const infoTable = $('h6.subsection-label:contains("Info")')
        .next(".subsection")
        .find("table.cross-table");

      const frequency = infoTable
        .find('tr:has(td:contains("Frequency")) td:nth-child(2)')
        .text()
        .trim();

      const type = infoTable
        .find('tr:has(td:contains("Type")) td:nth-child(2)')
        .text()
        .replace(/\s+/g, " ")
        .trim()
        .replace("?", "")
        .trim();
      const info = allKanjiByType.find((k) => k.kanji === kanji);
      const position = info?.position ?? "";
      const kind = info?.kind ?? "";

      const kanken = infoTable
        .find('tr:has(td:contains("Kanken")) td:nth-child(2)')
        .text()
        .trim();

      const heisig = infoTable
        .find('tr:has(td:contains("Heisig")) td:nth-child(2)')
        .text()
        .trim();

      const commonReadings: { reading: string; percentage: string }[] = [];
      infoTable.find(".kanji-reading-list-common > div").each((_, el) => {
        const reading = $(el).find("a").text().trim();
        const percentage = $(el).find("div").text().replace(/[()]/g, "").trim();
        commonReadings.push({ reading, percentage });
      });

      const rareReadings: { reading: string; percentage: string }[] = [];
      infoTable.find(".kanji-reading-list > div").each((_, el) => {
        const reading = $(el).find("a").text().trim();
        rareReadings.push({ reading, percentage: "" });
      });

      const composedOf: { kanji: string; keyword: string }[] = [];
      $(".subsection-composed-of-kanji").each((_, el) => {
        const header = $(el).find("h6.subsection-label").text().trim();
        if (header === "Composed of") {
          $(el)
            .find(".subsection > div")
            .each((_, d) => {
              const kanji = $(d).find(".spelling a").text().trim();
              const keyword = $(d).find(".description").text().trim();
              if (kanji) composedOf.push({ kanji, keyword });
            });
        }
      });

      const usedInKanji: { kanji: string; keyword: string }[] = [];
      $(".subsection-composed-of-kanji").each((_, el) => {
        const headerId = $(el).find("h6.subsection-label").attr("id") || "";
        if (headerId.startsWith("used_in_")) {
          $(el)
            .find(".subsection .used-in")
            .each((_, d) => {
              const kanji = $(d).find(".spelling a").text().trim();
              const keyword = $(d).find(".description").text().trim();
              usedInKanji.push({ kanji, keyword });
            });
        }
      });

      const kanjiInfo: Kanji = {
        position,
        svg,
        keyword,
        frequency,
        kind,
        type,
        kanken,
        heisig,
        readings: [...commonReadings, ...rareReadings],
        composedOf,
        usedInKanji,
      };

      console.log("Kanji:", kanji);
      kanjiJson[kanji] = kanjiInfo;
    }

    await writeFile(this.kanjiJson, JSON.stringify(kanjiJson, null, 2));
  }

  async gzipKanjiJson() {
    const dest = join(this.jpdbDir, "_kiku_db_jpdb_kanji.json.gz");
    await gzipFile(this.kanjiJson, dest, false);
  }
}

const kanjiByFrequency = new JpdbScraper();
await kanjiByFrequency.mkdir();

// fist step
// kanjiByFrequency.writeKanjiByFrequencyHtml();

// second step
// await kanjiByFrequency.writeKanjiByFrequencyJson();

// third step
// await kanjiByFrequency.writeKanjiHtml();

// fourth step
await kanjiByFrequency.writeKanjiJson();

// fifth step
// await kanjiByFrequency.gzipKanjiJson();
