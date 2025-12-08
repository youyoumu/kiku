export function parseFurigana(input: string) {
  const result: Array<
    | { type: "ruby"; text: string; reading: string }
    | { type: "text"; text: string }
  > = [];

  const regex = /([^[\]]+)\[([^[\]]+)\]/g;
  let lastIndex = 0;

  let match: RegExpExecArray | null = regex.exec(input);

  while (match !== null) {
    const [full, kanji, reading] = match;

    // Text before the matched ruby
    if (match.index > lastIndex) {
      result.push({
        type: "text",
        text: input.slice(lastIndex, match.index),
      });
    }

    // Ruby data
    result.push({
      type: "ruby",
      text: kanji,
      reading,
    });

    lastIndex = regex.lastIndex;

    // Next match
    match = regex.exec(input);
  }

  // Remaining text
  if (lastIndex < input.length) {
    result.push({
      type: "text",
      text: input.slice(lastIndex),
    });
  }

  return result;
}
