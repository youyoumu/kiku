const SMALL_YOON = ["ゃ", "ゅ", "ょ", "ャ", "ュ", "ョ", "ゎ", "ヮ"];
const SOKUON = ["っ", "ッ"];
const NASAL_N = ["ん", "ン"];
const LONG_VOWEL = ["ー"];

export function groupMorae(kana: string) {
  const chars = Array.from(kana);
  const result = [];

  for (let i = 0; i < chars.length; i++) {
    const current = chars[i];
    const next = chars[i + 1];

    // 1 Handle sokuon or nasal
    if (SOKUON.includes(current) || NASAL_N.includes(current)) {
      result.push(current);
      continue;
    }

    // 2 Handle kana + small kana (e.g., きゃ, しゃ, みょ)
    if (SMALL_YOON.includes(next)) {
      result.push(current + next);
      i++;
      continue;
    }

    // 3 Handle long vowel mark (ー)
    if (LONG_VOWEL.includes(current)) {
      if (result.length > 0) {
        result[result.length - 1] += current;
      } else {
        result.push(current);
      }
      continue;
    }

    // 4 Regular kana
    result.push(current);
  }

  return result;
}

export function pitchPattern(morae: string, accentNumber: number) {
  const pattern = [];

  if (accentNumber === 0) {
    // Heiban: low → high → high → ...
    pattern.push("L"); // first mora low
    for (let i = 1; i < morae.length; i++) pattern.push("H");
  } else if (accentNumber === 1) {
    // Atamadaka: high → low → low ...
    pattern.push("H");
    for (let i = 1; i < morae.length; i++) pattern.push("L");
  } else {
    // Nakadaka / Odaka
    for (let i = 0; i < morae.length; i++) {
      if (i < accentNumber) pattern.push("H");
      else pattern.push("L");
    }
  }

  return pattern;
}

export function visualizePitch(
  kana: string,
  morae: string[],
  accentNumber: number,
) {
  const pitch = pitchPattern(kana, accentNumber);
  console.log("DEBUG[7]: pitch=", pitch);
  const display = morae.map((m, i) => {
    const tone = pitch[i] === "H" ? "¯" : "_";
    return `${m}${tone}`;
  });
  return display.join(" ");
}

export function extractAccentNumber(html: string) {
  const match = html.match(/\[(\d+)\]/);
  return match ? Number(match[1]) : 0;
}

const html =
  '<span style="display:inline;"><span>[</span><span>5</span><span>]</span></span>';
console.log(extractAccentNumber(html)); // 5

// --- Test cases ---
const tests = [
  "きょう", // kyo-u
  "がっこう", // ga-k-ko-u
  "にほんご", // ni-ho-n-go
  "スーパー", // su-u-paa
  "ちゃっかり", // cha-k-ka-ri
  "コンピューター", // kon-pyuu-taa
  "ヴァイオリン", // va-i-o-rin
  "おばあさん", // o-baa-sa-n
  "きゃりーぱみゅぱみゅ", // kya-ryii-pa-myu-pa-myu
  "てぃーたいむ", // tii-ta-i-mu
  "ファミリー", // fa-mi-rii
  "ミュージック", // myuu-jik-ku
  "トラック", // to-rak-ku
  "じっけん", // jik-ken
  "おんがく", // o-n-ga-ku
  "さんぽ", // sa-n-po
];

// --- Display results ---
for (const text of tests) {
  const grouped = groupMorae(text);
  // console.log(`${text.padEnd(20)} => ${JSON.stringify(grouped)}`);
}
