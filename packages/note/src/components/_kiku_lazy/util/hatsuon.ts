// https://github.com/DJTB/hatsuon/tree/master
// biome-ignore format: this looks nicer
export const HIRA_DIGRAPHS = ['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ゃ', 'ゅ', 'ょ', 'ゎ', 'ゕ', 'ゖ'];
// biome-ignore format: this looks nicer
export const KATA_DIGRAPHS = ['ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'ャ', 'ュ', 'ョ', 'ヮ', 'ヵ', 'ヶ'];
// biome-ignore format: this looks nicer
export const PATTERN_NAMES = {
  HEIBAN: { EN: 'heiban', JA: '平板', },
  ATAMADAKA: { EN: 'atamadaka', JA: '頭高', },
  NAKADAKA: { EN: 'nakadaka', JA: '中高', },
  ODAKA: { EN: 'odaka', JA: '尾高', },
};
type Locale = "EN" | "JA";

/**
 * Checks if character is a digraph
 *
 * @export
 * @param {string} [kana=''] character to test
 * @returns {boolean} true if digraph
 */
export function isDigraph(kana = "") {
  return KATA_DIGRAPHS.includes(kana) || HIRA_DIGRAPHS.includes(kana);
}

/**
 * Splits string into morae
 *
 * @export
 * @param {string} [reading=''] Japanese word
 * @returns {[string]} morae
 */
export function getMorae(reading = "") {
  // [か, し, ゅ, う] => [か, しゅ, う]
  const combineDigraphs = (arr: string[] = [], char = "") =>
    isDigraph(char)
      ? arr.slice(0, -1).concat(arr.slice(-1) + char)
      : arr.concat(char);

  return reading.split("").reduce(combineDigraphs, []);
}

/**
 * Mora count of Japanese word
 *
 * @export
 * @param {string} [reading=''] Japanese word
 * @returns {number} mora count
 */
export function getMoraCount(reading = "") {
  return getMorae(reading).length;
}

/**
 * Get name of pitch type
 *
 * @export
 * @param {number} [moraCount=0] mora count
 * @param {any} [pitchNum=-1] pitch number
 * @param {string} [locale='EN'] localization of pitch type name
 * @returns {string} pitch type name
 */
export function getPitchPatternName(
  moraCount = 0,
  pitchNum = -1,
  locale: Locale = "EN",
) {
  let names = { EN: "unknown", JA: "不詳" };
  if (pitchNum === 0) {
    names = PATTERN_NAMES.HEIBAN;
  }
  if (pitchNum === 1) {
    names = PATTERN_NAMES.ATAMADAKA;
  }
  if (pitchNum > 1 && pitchNum < moraCount) {
    names = PATTERN_NAMES.NAKADAKA;
  }
  if (pitchNum > 1 && pitchNum === moraCount) {
    names = PATTERN_NAMES.ODAKA;
  }
  return names[locale] || "unknown";
}

/**
 * Creates an Heiban pitch pattern
 * initial low -> rest high, particle high
 * [0, 1, 1, 1, 1, 1]
 *
 * @export
 * @param {number} [moraCount=0] mora count
 * @returns {[number]} pitch pattern
 */
export function makeHeiban(moraCount = 0) {
  if (moraCount < 1) return [];
  return [0, ...Array(moraCount).fill(1).slice(0, -1), 1];
}

/**
 * Creates an Atamadaka pitch pattern
 * initial high -> rest low, particle low
 * [1, 0, 0, 0, 0, 0]
 *
 * @export
 * @param {number} [moraCount=0] mora count
 * @returns {[number]} pitch pattern
 */
export function makeAtamadaka(moraCount = 0) {
  if (moraCount < 1) return [];
  return [1, ...Array(moraCount).fill(0).slice(0, -1), 0];
}

/**
 * Creates an Odaka pitch pattern
 * initial low, rest high, particle low
 * [0, 1, 1, 1, 1, 0]
 * @export
 * @param {number} [moraCount=0] mora count
 * @returns {[number]} pitch pattern
 */
export function makeOdaka(moraCount = 0) {
  if (moraCount < 2) return [];
  return [0, ...Array(moraCount).fill(1).slice(0, -1), 0];
}

/**
 * Creates a Nakadaka pitch pattern
 * initial low, one or more high, rest (at least 1) low, particle low
 * final mora before particle *must* be low
 * [0, 1, 0, 0, 0, 0]
 * [0, 1, 1, 0, 0, 0]
 * [0, 1, 1, 1, 0, 0]
 *
 * @export
 * @param {number} [moraCount=0] mora count
 * @param {number} [pitchNum=0] pitch number
 * @returns {[number]} pitch pattern
 */
export function makeNakadaka(moraCount = 0, pitchNum = 0) {
  if (moraCount < 3 || pitchNum < 2 || pitchNum >= moraCount) return [];
  return [
    0,
    ...Array(pitchNum - 1).fill(1),
    ...Array(moraCount - pitchNum).fill(0),
    0,
  ];
}

/**
 * Removes digraph pitch numbers from a pitch pattern
 * used in getPitchNumFromPattern()
 *
 * @export
 * @param {string} [reading=''] Japanese word
 * @param {[number]} [pattern=[]] pitch pattern
 * @returns {[number]} pitch pattern with digraph points removed
 */
export function removeDigraphPitches(reading = "", pattern = []) {
  return pattern.filter((_, i) => !isDigraph(reading[i]));
}

/**
 * Determine pitch number from provided pattern.
 * Some sources include digraphs as points in the pitch pattern,
 * in that instance use the digraphsIncluded flag to strip them,
 * to maintain consistency with makePitchPattern()
 * @export
 * @param {string} [reading=''] Japanese word
 * @param {[number]} [pitchPattern=[]] pitch pattern
 * @param {boolean} [digraphsIncluded=false] are digraph pitch points present
 * @returns {number} pitch number
 */
export function getPitchNumFromPattern(
  reading = "",
  pitchPattern = [],
  digraphsIncluded = false,
) {
  if (!reading || !pitchPattern.length) {
    return -1;
  }
  let pattern = pitchPattern.slice();
  const particle = pattern.pop();
  const isHeiban = particle === 1;
  if (isHeiban) {
    return 0;
  }
  if (digraphsIncluded) {
    pattern = removeDigraphPitches(reading, pattern);
  }
  pattern = pattern.slice(1);
  return pattern.findIndex((x) => x === 0) + 1 || pattern.length + 1;
}

/**
 * Creates the relevant pitch pattern determined by mora count & pitch number
 *
 * @export
 * @param {number} [moraCount=0] mora count
 * @param {number} [pitchNum=-1] pitch number
 * @returns {[number]} pitch pattern
 */
export function makePitchPattern(moraCount = 0, pitchNum = -1) {
  switch (getPitchPatternName(moraCount, pitchNum)) {
    case PATTERN_NAMES.HEIBAN.EN:
      return makeHeiban(moraCount);
    case PATTERN_NAMES.ATAMADAKA.EN:
      return makeAtamadaka(moraCount);
    case PATTERN_NAMES.ODAKA.EN:
      return makeOdaka(moraCount);
    case PATTERN_NAMES.NAKADAKA.EN:
      return makeNakadaka(moraCount, pitchNum);
    default:
      return [];
  }
}

/**
 * Returns pitch accent information for the provided word and pitch number
 *
 * @module
 * @param {string} [reading=''] Japanese word represented in kana
 * @param {number} [pitchNum=-1] pitch number
 * @returns {object} pitch data
 */
export function hatsuon({
  reading = "",
  pitchNum = -1,
  locale = "JA",
}: {
  reading?: string;
  pitchNum?: number;
  locale?: Locale;
} = {}) {
  const morae = getMorae(reading);

  return {
    reading,
    morae,
    pitchNum,
    pattern: makePitchPattern(morae.length, pitchNum),
    patternName: getPitchPatternName(morae.length, pitchNum, locale),
  };
}

export type PitchInfo = ReturnType<typeof hatsuon>;
