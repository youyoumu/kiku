type Token =
  | { type: "kanji"; value: string }
  | { type: "kana"; value: string }
  | { type: "furigana"; value: string };

const isKanji = (char: string) => /[\u4E00-\u9FFF\u3005]/.test(char);
const isKana = (char: string) => /[\u3040-\u30FF]/.test(char);

function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < input.length) {
    const char = input[i];

    // Furigana block
    if (char === "[") {
      let value = "";
      i++; // skip '['

      while (i < input.length && input[i] !== "]") {
        value += input[i];
        i++;
      }

      // skip ']'
      if (input[i] === "]") i++;

      tokens.push({ type: "furigana", value });
      continue;
    }

    if (isKanji(char)) {
      tokens.push({ type: "kanji", value: char });
    } else if (isKana(char)) {
      tokens.push({ type: "kana", value: char });
    } else {
      // fallback (latin, punctuation, space, etc.)
      tokens.push({ type: "kana", value: char });
    }

    i++;
  }

  return tokens;
}

type RenderItem =
  | { type: "ruby"; text: string; reading: string }
  | { type: "text"; text: string };

function tokensToRenderItems(tokens: Token[]): RenderItem[] {
  const result: RenderItem[] = [];

  let textBuffer = "";
  let kanjiBuffer = "";

  const flushText = () => {
    if (textBuffer) {
      result.push({ type: "text", text: textBuffer });
      textBuffer = "";
    }
  };

  const flushKanjiAsText = () => {
    if (kanjiBuffer) {
      textBuffer += kanjiBuffer;
      kanjiBuffer = "";
    }
  };

  for (const token of tokens) {
    switch (token.type) {
      case "kanji": {
        kanjiBuffer += token.value;
        break;
      }

      case "furigana": {
        if (kanjiBuffer) {
          flushText();
          result.push({
            type: "ruby",
            text: kanjiBuffer,
            reading: token.value, // can be "" or " "
          });
          kanjiBuffer = "";
        } else {
          // literal furigana
          // textBuffer += `[${token.value}]`;
        }
        break;
      }

      case "kana": {
        flushKanjiAsText();
        textBuffer += token.value;
        break;
      }
    }
  }

  flushKanjiAsText();
  flushText();
  return result;
}

export function parseFurigana(input: string): RenderItem[] {
  return tokensToRenderItems(tokenize(input));
}
