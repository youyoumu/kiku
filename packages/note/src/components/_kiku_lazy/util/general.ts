export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const DEFAULT_EXCEPTIONS = new Set([
  "of",
  "and",
  "to",
  "in",
  "on",
  "for",
  "with",
  "a",
  "an",
  "the",
]);

export function capitalizeSmart(
  word: string,
  exceptions = DEFAULT_EXCEPTIONS,
): string {
  const lower = word.toLowerCase();
  if (exceptions.has(lower)) return lower;
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function capitalizeSentence(sentence?: string) {
  return sentence
    ?.split(" ")
    .map((k) => capitalizeSmart(k))
    .join(" ");
}
