import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

class KanjiByFrequency {
  KYOIKU_URL = "https://jpdb.io/kanji-by-frequency?show_only=kyouiku";
  JOYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jouyou";
  JINMEIYO_URL = "https://jpdb.io/kanji-by-frequency?show_only=jinmeiyou";
  HYOGAI_URL = "https://jpdb.io/kanji-by-frequency?show_only=hyougai";

  root = join(import.meta.dirname, "../../");
  jpdbDir = join(this.root, ".jpdb");
  kanjiByFrequency = join(this.jpdbDir, "kanji-by-frequency");
  kyoikuHtml = join(this.kanjiByFrequency, "kyoiku.html");
  joyoHtml = join(this.kanjiByFrequency, "joyo.html");
  jinmeiyoHtml = join(this.kanjiByFrequency, "jinmeiyo.html");
  hyogaiHtml = join(this.kanjiByFrequency, "hyogai.html");

  async mkdir() {
    await mkdir(this.kanjiByFrequency, { recursive: true });
  }

  async writeKanjiByFrequency() {
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
}

const kanjiByFrequency = new KanjiByFrequency();
await kanjiByFrequency.mkdir();
kanjiByFrequency.writeKanjiByFrequency();
