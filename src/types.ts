export type AnkiFields = {
  Expression: string;
  ExpressionFurigana: string;
  ExpressionReading: string;
  ExpressionAudio: string;
  SelectionText: string;
  MainDefinition: string;
  DefinitionPicture: string;
  Sentence: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  Picture: string;
  Glossary: string;
  Hint: string;
  IsWordAndSentenceCard: string;
  IsClickCard: string;
  IsSentenceCard: string;
  IsAudioCard: string;
  PitchPosition: string;
  PitchCategories: string;
  Frequency: string;
  FreqSort: string;
  MiscInfo: string;
  Tags: string;

  // === Variants (for furigana/kana helpers) ===
  "furigana:ExpressionFurigana": string;
  "kana:ExpressionFurigana": string;
  "furigana:Sentence": string;
  "kanji:Sentence": string;
  "furigana:SentenceFurigana": string;
  "kana:SentenceFurigana": string;
};

export type AnkiFieldNodes = {
  Expression: NodeList;
  ExpressionFurigana: NodeList;
  ExpressionReading: NodeList;
  ExpressionAudio: NodeList;
  SelectionText: NodeList;
  MainDefinition: NodeList;
  DefinitionPicture: NodeList;
  Sentence: NodeList;
  SentenceFurigana: NodeList;
  SentenceAudio: NodeList;
  Picture: NodeList;
  Glossary: NodeList;
  Hint: NodeList;
  IsWordAndSentenceCard: NodeList;
  IsClickCard: NodeList;
  IsSentenceCard: NodeList;
  IsAudioCard: NodeList;
  PitchPosition: NodeList;
  PitchCategories: NodeList;
  Frequency: NodeList;
  FreqSort: NodeList;
  MiscInfo: NodeList;
  Tags: NodeList;

  // === Variants (for furigana/kana helpers) ===
  "furigana:ExpressionFurigana": NodeList;
  "kana:ExpressionFurigana": NodeList;
  "furigana:Sentence": NodeList;
  "kanji:Sentence": NodeList;
  "furigana:SentenceFurigana": NodeList;
  "kana:SentenceFurigana": NodeList;
};

const frontKeys = [
  "Expression",
  "kanji:Sentence",
  "IsWordAndSentenceCard",
  "IsSentenceCard",
  "IsClickCard",
  "IsAudioCard",
  "SentenceAudio",
  "ExpressionAudio",
  "Hint",
] satisfies readonly (keyof AnkiFields)[];

type ExtractUsedFields<T, U extends readonly (keyof T)[]> = Pick<T, U[number]>;

export type AnkiFrontFields = ExtractUsedFields<AnkiFields, typeof frontKeys>;
export type AnkiBackFields = AnkiFields;
export type AnkiFrontFieldNodes = ExtractUsedFields<
  AnkiFieldNodes,
  typeof frontKeys
>;
export type AnkiBackFieldNodes = AnkiFieldNodes;

// biome-ignore format: this looks nicer
export const ankiFieldsSkeleton: AnkiFields = {
  "Expression": "",
  "ExpressionFurigana": "",
  "ExpressionReading": "",
  "ExpressionAudio": "",
  "SelectionText": "",
  "MainDefinition": "",
  "DefinitionPicture": "",
  "Sentence": "",
  "SentenceFurigana": "",
  "SentenceAudio": "",
  "Picture": "",
  "Glossary": "",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "",
  "PitchCategories": "",
  "Frequency": "",
  "FreqSort": "",
  "MiscInfo": "",
  "Tags": "",
  "furigana:ExpressionFurigana": "",
  "kana:ExpressionFurigana": "",
  "furigana:Sentence": "",
  "kanji:Sentence": "",
  "furigana:SentenceFurigana": "",
  "kana:SentenceFurigana": ""
}

// biome-ignore format: this looks nicer
export const exampleFields: AnkiFields = {
  "Expression": "十中八九",
  "ExpressionFurigana": "十中八九[じっちゅうはっく]",
  "ExpressionReading": "じっちゅうはっく",
  "ExpressionAudio": "<a class=\"replay-button soundLink\" href=# onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\" />\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\" />\n    </svg>\n</a>",
  "SelectionText": "",
  "MainDefinition": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><ol><li data-dictionary=\"JMdict\"><i>(adv, n, yoji, JMdict)</i> <span><ul data-sc-content=\"glossary\" lang=\"en\" style=\"list-style-type: circle;\"><li>in 8 or 9 cases out of ten</li><li>in all probability</li></ul></span></li><li data-dictionary=\"JMdict\"><i>(forms)</i> <span><div style=\"display:block;\"><table data-sc-content=\"formsTable\" style=\"table-layout:auto;border-collapse:collapse;\"><tbody><tr><th style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;\"></th><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">十中八九</th></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: left;\">じっちゅうはっく</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">㊒</td></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: left;\">じゅうちゅうはっく</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">㊒</td></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: left;\">じゅっちゅうはっく</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">㊒</td></tr></tbody></table></div></span></li></ol></div>",
  "DefinitionPicture": "",
  "Sentence": "<b>十中八九</b>せこい小遣い稼ぎだと思う<br>Hey there! Thanks a lot for downloading Lapis! Please refer to its <a href=\"https://github.com/donkuri/lapis\">documentation</a> to learn more about the note type!",
  "SentenceFurigana": "<b> 十中八九[じっちゅうはっく]</b>せこい 小遣[こづか]い 稼[かせ]ぎだと 思[おも]う<br>Hey there! <br>Thanks a lot for downloading Lapis. Please refer to its <a href=\"https://github.com/donkuri/lapis\">documentation</a> to learn more about the note type!",
  "SentenceAudio": "<a class=\"replay-button soundLink\" href=# onclick=\"pycmd('play:a:1'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\" />\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\" />\n    </svg>\n</a>",
  "Picture": "<img alt=\"snapshot\" src=\"shoushiminseries04_08m46s485ms.webp\">",
  "Glossary": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><ol><li data-dictionary=\"JMdict\"><i>(adv, n, yoji, JMdict)</i> <span><ul data-sc-content=\"glossary\" lang=\"en\" style=\"list-style-type: circle;\"><li>in 8 or 9 cases out of ten</li><li>in all probability</li></ul></span></li><li data-dictionary=\"JMdict\"><i>(forms)</i> <span><div style=\"display:block;\"><table data-sc-content=\"formsTable\" style=\"table-layout:auto;border-collapse:collapse;\"><tbody><tr><th style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;\"></th><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">十中八九</th></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: left;\">じっちゅうはっく</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">㊒</td></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: left;\">じゅうちゅうはっく</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">㊒</td></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: left;\">じゅっちゅうはっく</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\">㊒</td></tr></tbody></table></div></span></li><li data-dictionary=\"三省堂国語辞典　第八版\"><i>(三省堂国語辞典　第八版)</i> <span><span data-sc-name=\"見出部\"><span data-sc-name=\"見出仮名\" lang=\"ja\" style=\"font-weight: bold;\">じっちゅう<span data-sc-name=\"語構成\" style=\"margin-right: 0.5em;\"></span>は<span data-sc-name=\"アクセント\"><span style=\"vertical-align: text-bottom;\"><a target=\"_blank\" rel=\"noreferrer noopener\" href=\"yomitan_dictionary_media_1_2024-07-20-15-08-08-382.svg\" style=\"cursor:inherit;display:inline-block;position:relative;line-height:1;max-width:100%;color:inherit;\"><span style=\"display:inline-block;white-space:nowrap;max-width:100%;max-height:100vh;position:relative;vertical-align:top;line-height:0;overflow:hidden;font-size:1px;font-size:1em;width: 0.5em;\"><span style=\"display:inline-block;width:0;vertical-align:top;font-size:0;padding-top: 200%;\"></span><span style=\"--image:none;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center center;-webkit-mask-mode:alpha;-webkit-mask-size:contain;-webkit-mask-image:var(--image);mask-repeat:no-repeat;mask-position:center center;mask-mode:alpha;mask-size:contain;mask-image:var(--image);background-color:currentColor;display:none;--image: url(&quot;yomitan_dictionary_media_1_2024-07-20-15-08-08-382.svg&quot;);\"></span><img alt=\"\" src=\"yomitan_dictionary_media_1_2024-07-20-15-08-08-382.svg\" style=\"display:inline-block;vertical-align:top;object-fit:contain;border:none;outline:none;position:absolute;left:0;top:0;width:100%;height:100%;\"><span style=\"position:absolute;left:0;top:0;width:100%;height:100%;display:table;table-layout:fixed;white-space:normal;font-size:initial;line-height:initial;color:initial;\"></span></span><span style=\"display:none;line-height:initial;\">Image</span></a></span></span>っく</span><span data-sc-name=\"表記G\" lang=\"ja\">［<span data-sc-name=\"表記\"><span data-sc-name=\"教育漢字\" lang=\"ja\">十中八九</span></span>］</span><span data-sc-name=\"品詞G\"><span data-sc-name=\"品詞subG\" lang=\"ja\">｟<span data-sc-name=\"品詞\" lang=\"ja\">副</span>｠</span></span></span><div data-sc-name=\"解説部\"><div data-sc-name=\"大語義\"><div data-sc-name=\"語義\"><span data-sc-name=\"語釈\" lang=\"ja\">十のうち八か九か。おおかた。たいてい。じゅうちゅう<span data-sc-name=\"分書\" style=\"margin-right: 0.5em;\"></span>はっく。<span data-sc-name=\"電子検索キー\" lang=\"ja\">じゅっちゅう<span data-sc-name=\"語構成\" style=\"margin-right: 0.5em;\"></span>はっく</span>。</span><div data-sc-name=\"用例G\" lang=\"ja\">「<span data-sc-name=\"用例\" lang=\"ja\"><span data-sc-name=\"見出相当部\" style=\"margin-left: 0.125em; margin-right: 0.125em;\">━</span>成功する</span>」</div></div></div></div></span></li><li data-dictionary=\"大辞林　第四版\"><i>(大辞林　第四版)</i> <span><span data-sc-name=\"見出部\"><span data-sc-name=\"見出仮名\" lang=\"ja\" style=\"font-weight: bold;\">じっちゅう<span data-sc-name=\"語構成\" style=\"margin-right: 0.5em;\"></span>はっく</span><span data-sc-name=\"アクセントG\" style=\"font-size: 0.7em; vertical-align: super; margin-left: 0.25em; margin-right: 0.25em;\"><span data-sc-name=\"アクセント\"><span data-sc-name=\"accent\">[5]</span></span></span><span data-sc-name=\"表記G\" lang=\"ja\">【<span data-sc-name=\"標準表記\" lang=\"ja\">十中八九</span>】</span></span><div data-sc-name=\"解説部\"><div data-sc-name=\"大語義\"><div data-sc-name=\"準大語義\"><div data-sc-name=\"中語義\"><div data-sc-name=\"語義G\"><span data-sc-name=\"語釈\" lang=\"ja\">一〇のうち八か九まで。ほとんど。たいてい。十に八九。じゅっちゅうはっく。</span><div data-sc-name=\"用例\" lang=\"ja\">「<span data-sc-name=\"見出相当部\" style=\"font-weight: bold;\">━</span>成功する」</div><div data-sc-name=\"用例\" lang=\"ja\">「<span data-sc-name=\"見出相当部\" style=\"font-weight: bold;\">━</span>は反対されるだろう」</div></div></div></div></div></div></span></li><li data-dictionary=\"旺文社国語辞典 第十一版\"><i>(旺文社国語辞典 第十一版)</i> じっちゅう‐はっく【十中八九】<br>（名・副）一○のうち八か九まで。ほとんど。おおかた。「―間違いない」</li></ol></div>",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "x",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "<span style=\"display:inline;\"><span>[</span><span>5</span><span>]</span></span>",
  "PitchCategories": "",
  "Frequency": "<ul style=\"text-align: left;\"><li>JPDB: 14171</li><li>Anime &amp; J-drama: 25407</li><li>Wikipedia: 134746</li><li>Innocent Ranked: 32798</li></ul>",
  "FreqSort": "27056",
  "MiscInfo": "Shoushimin_Series EP04 (08m46s485ms)",
  "Tags": "アニメ::小市民シリーズ",
  "furigana:ExpressionFurigana": "<ruby><rb>十中八九</rb><rt>じっちゅうはっく</rt></ruby>",
  "kana:ExpressionFurigana": "じっちゅうはっく",
  "furigana:Sentence": "<b>十中八九</b>せこい小遣い稼ぎだと思う<br>Hey there! Thanks a lot for downloading Lapis! Please refer to its <a href=\"https://github.com/donkuri/lapis\">documentation</a> to learn more about the note type!",
  "kanji:Sentence": "<b>十中八九</b>せこい小遣い稼ぎだと思う<br>Hey there! Thanks a lot for downloading Lapis! Please refer to its <a href=\"https://github.com/donkuri/lapis\">documentation</a> to learn more about the note type!",
  "furigana:SentenceFurigana": "<b><ruby><rb>十中八九</rb><rt>じっちゅうはっく</rt></ruby></b>せこい<ruby><rb>小遣</rb><rt>こづか</rt></ruby>い<ruby><rb>稼</rb><rt>かせ</rt></ruby>ぎだと<ruby><rb>思</rb><rt>おも</rt></ruby>う<br>Hey there! <br>Thanks a lot for downloading Lapis. Please refer to its <a href=\"https://github.com/donkuri/lapis\">documentation</a> to learn more about the note type!",
  "kana:SentenceFurigana": "<b>じっちゅうはっく</b>せこいこづかいかせぎだとおもう<br>Hey there! <br>Thanks a lot for downloading Lapis. Please refer to its <a href=\"https://github.com/donkuri/lapis\">documentation</a> to learn more about the note type!"
};

// biome-ignore format: this looks nicer
export const exampleFields2: AnkiFields = {
  "Expression": "太る",
  "ExpressionFurigana": "太[ふと]る",
  "ExpressionReading": "ふとる",
  "ExpressionAudio": "<a class=\"replay-button soundLink\" href=# onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\" />\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\" />\n    </svg>\n</a>",
  "SelectionText": "",
  "MainDefinition": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><i>(priority&nbsp;form, ★, Jitendex.org [2025-06-01])</i> <span><div><span data-sc-code=\"v5r\" title=\"Godan verb with 'ru' ending\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">5-dan</span><span data-sc-code=\"vi\" title=\"intransitive verb\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">intransitive</span><div><ul data-sc-content=\"glossary\"><li>to put on weight</li><li>to gain weight</li><li>to grow fat</li><li>to get stout</li></ul><div data-sc-content=\"extra-info\" style=\"margin-left: 0.5em;\"><div><div data-sc-content=\"example-sentence\" data-sc-source=\"230305\" style=\"background-color: color-mix(in srgb, var(--text-color, var(--fg, #333)) 5%, transparent); border-color: var(--text-color, var(--fg, #333)); border-style: none none none solid; border-radius: 0.4rem; border-width: calc(3em / var(--font-size-no-units, 14)); margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem;\"><div data-sc-content=\"example-sentence-a\" lang=\"ja\" style=\"font-size: 1.3em;\">あまり<span data-sc-content=\"example-keyword\" lang=\"ja\" style=\"color: color-mix(in srgb, lime, var(--text-color, var(--fg, #333)));\"><ruby lang=\"ja\">太<rt lang=\"ja\">ふと</rt></ruby>った</span>のでカラーの<ruby lang=\"ja\">前<rt lang=\"ja\">まえ</rt></ruby>が<ruby lang=\"ja\">合<rt lang=\"ja\">あ</rt></ruby>わなかった。</div><div data-sc-content=\"example-sentence-b\" style=\"font-size: 0.8em;\">He got so stout that his collar did not meet.<span data-sc-content=\"attribution-footnote\" style=\"font-size: 0.8em; color: rgb(119, 119, 119); vertical-align: top; margin-left: 0.25rem;\">[1]</span></div></div><div data-sc-content=\"example-sentence\" data-sc-source=\"228392\" style=\"background-color: color-mix(in srgb, var(--text-color, var(--fg, #333)) 5%, transparent); border-color: var(--text-color, var(--fg, #333)); border-style: none none none solid; border-radius: 0.4rem; border-width: calc(3em / var(--font-size-no-units, 14)); margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem;\"><div data-sc-content=\"example-sentence-a\" lang=\"ja\" style=\"font-size: 1.3em;\">インシュリンを<ruby lang=\"ja\">打<rt lang=\"ja\">う</rt></ruby>つので<ruby lang=\"ja\">彼<rt lang=\"ja\">かの</rt></ruby><ruby lang=\"ja\">女<rt lang=\"ja\">じょ</rt></ruby>は<span data-sc-content=\"example-keyword\" lang=\"ja\" style=\"color: color-mix(in srgb, lime, var(--text-color, var(--fg, #333)));\"><ruby lang=\"ja\">太<rt lang=\"ja\">ふと</rt></ruby>っていた</span>。</div><div data-sc-content=\"example-sentence-b\" style=\"font-size: 0.8em;\">The insulin was making her fat.<span data-sc-content=\"attribution-footnote\" style=\"font-size: 0.8em; color: rgb(119, 119, 119); vertical-align: top; margin-left: 0.25rem;\">[2]</span></div></div></div></div></div></div><div data-sc-content=\"forms\" style=\"margin-top: 0.5rem;\"><span title=\"spelling and reading variants\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">forms</span><div style=\"margin-top: 0.2em;\"><div style=\"display:block;\"><table style=\"table-layout:auto;border-collapse:collapse;\"><tbody><tr><th style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;\"></th><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;font-weight: normal; font-size: 1.2em; text-align: center;\">太る</th><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;font-weight: normal; font-size: 1.2em; text-align: center;\">肥る</th></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;font-weight: normal;\">ふとる</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\"><div title=\"high priority form\" style=\"font-weight: bold; color: white; background: radial-gradient(green 50%, white 100%); clip-path: circle(); padding: 0px 0.5em; cursor: help;\">△</div></td><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\"><div title=\"rarely used form\" style=\"font-weight: bold; color: white; background: radial-gradient(purple 50%, white 100%); clip-path: circle(); padding: 0px 0.5em; cursor: help;\">▽</div></td></tr></tbody></table></div></div></div><div data-sc-content=\"attribution\" style=\"font-size: 0.7em; text-align: right;\"><a href=\"https://www.edrdg.org/jmwsgi/entr.py?svc=jmdict&amp;q=1408220\"><span>JMdict</span><span style=\"display:none;\"></span></a> | Tatoeba <a href=\"https://tatoeba.org/en/sentences/show/230305\"><span>[1]</span><span style=\"display:none;\"></span></a><a href=\"https://tatoeba.org/en/sentences/show/228392\"><span>[2]</span><span style=\"display:none;\"></span></a></div></span></div>",
  "DefinitionPicture": "",
  "Sentence": "「こんなに食べたら<b>太っちゃいそう</b>だけど、仕方ないね」",
  "SentenceFurigana": "<span class=\"term\">「</span><span class=\"term\">こんなに</span><span class=\"term\"><ruby>食<rt>た</rt></ruby>べたら</span><span class=\"term\"><ruby>太<rt>ふと</rt></ruby>っちゃいそう</span><span class=\"term\">だけど、</span><span class=\"term\"><ruby>仕方<rt>しかた</rt></ruby>ないね</span><span class=\"term\">」</span>",
  "SentenceAudio": "<a class=\"replay-button soundLink\" href=# onclick=\"pycmd('play:a:1'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\" />\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\" />\n    </svg>\n</a>",
  "Picture": "<img src=\"20251021_140049_32e.webp\">",
  "Glossary": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><i>(priority&nbsp;form, ★, Jitendex.org [2025-06-01])</i> <span><div><span data-sc-code=\"v5r\" title=\"Godan verb with 'ru' ending\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">5-dan</span><span data-sc-code=\"vi\" title=\"intransitive verb\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">intransitive</span><div><ul data-sc-content=\"glossary\"><li>to put on weight</li><li>to gain weight</li><li>to grow fat</li><li>to get stout</li></ul><div data-sc-content=\"extra-info\" style=\"margin-left: 0.5em;\"><div><div data-sc-content=\"example-sentence\" data-sc-source=\"230305\" style=\"background-color: color-mix(in srgb, var(--text-color, var(--fg, #333)) 5%, transparent); border-color: var(--text-color, var(--fg, #333)); border-style: none none none solid; border-radius: 0.4rem; border-width: calc(3em / var(--font-size-no-units, 14)); margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem;\"><div data-sc-content=\"example-sentence-a\" lang=\"ja\" style=\"font-size: 1.3em;\">あまり<span data-sc-content=\"example-keyword\" lang=\"ja\" style=\"color: color-mix(in srgb, lime, var(--text-color, var(--fg, #333)));\"><ruby lang=\"ja\">太<rt lang=\"ja\">ふと</rt></ruby>った</span>のでカラーの<ruby lang=\"ja\">前<rt lang=\"ja\">まえ</rt></ruby>が<ruby lang=\"ja\">合<rt lang=\"ja\">あ</rt></ruby>わなかった。</div><div data-sc-content=\"example-sentence-b\" style=\"font-size: 0.8em;\">He got so stout that his collar did not meet.<span data-sc-content=\"attribution-footnote\" style=\"font-size: 0.8em; color: rgb(119, 119, 119); vertical-align: top; margin-left: 0.25rem;\">[1]</span></div></div><div data-sc-content=\"example-sentence\" data-sc-source=\"228392\" style=\"background-color: color-mix(in srgb, var(--text-color, var(--fg, #333)) 5%, transparent); border-color: var(--text-color, var(--fg, #333)); border-style: none none none solid; border-radius: 0.4rem; border-width: calc(3em / var(--font-size-no-units, 14)); margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem;\"><div data-sc-content=\"example-sentence-a\" lang=\"ja\" style=\"font-size: 1.3em;\">インシュリンを<ruby lang=\"ja\">打<rt lang=\"ja\">う</rt></ruby>つので<ruby lang=\"ja\">彼<rt lang=\"ja\">かの</rt></ruby><ruby lang=\"ja\">女<rt lang=\"ja\">じょ</rt></ruby>は<span data-sc-content=\"example-keyword\" lang=\"ja\" style=\"color: color-mix(in srgb, lime, var(--text-color, var(--fg, #333)));\"><ruby lang=\"ja\">太<rt lang=\"ja\">ふと</rt></ruby>っていた</span>。</div><div data-sc-content=\"example-sentence-b\" style=\"font-size: 0.8em;\">The insulin was making her fat.<span data-sc-content=\"attribution-footnote\" style=\"font-size: 0.8em; color: rgb(119, 119, 119); vertical-align: top; margin-left: 0.25rem;\">[2]</span></div></div></div></div></div></div><div data-sc-content=\"forms\" style=\"margin-top: 0.5rem;\"><span title=\"spelling and reading variants\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">forms</span><div style=\"margin-top: 0.2em;\"><div style=\"display:block;\"><table style=\"table-layout:auto;border-collapse:collapse;\"><tbody><tr><th style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;\"></th><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;font-weight: normal; font-size: 1.2em; text-align: center;\">太る</th><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;font-weight: normal; font-size: 1.2em; text-align: center;\">肥る</th></tr><tr><th lang=\"ja\" style=\"font-weight:bold;border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;font-weight: normal;\">ふとる</th><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\"><div title=\"high priority form\" style=\"font-weight: bold; color: white; background: radial-gradient(green 50%, white 100%); clip-path: circle(); padding: 0px 0.5em; cursor: help;\">△</div></td><td style=\"border-style:solid;padding:0.25em;vertical-align:top;border-width:1px;border-color:currentColor;text-align: center;\"><div title=\"rarely used form\" style=\"font-weight: bold; color: white; background: radial-gradient(purple 50%, white 100%); clip-path: circle(); padding: 0px 0.5em; cursor: help;\">▽</div></td></tr></tbody></table></div></div></div><div data-sc-content=\"attribution\" style=\"font-size: 0.7em; text-align: right;\"><a href=\"https://www.edrdg.org/jmwsgi/entr.py?svc=jmdict&amp;q=1408220\"><span>JMdict</span><span style=\"display:none;\"></span></a> | Tatoeba <a href=\"https://tatoeba.org/en/sentences/show/230305\"><span>[1]</span><span style=\"display:none;\"></span></a><a href=\"https://tatoeba.org/en/sentences/show/228392\"><span>[2]</span><span style=\"display:none;\"></span></a></div></span></div>",
  "Hint": "not いぬ",
  "IsWordAndSentenceCard": "x",
  "IsClickCard": "",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "",
  "PitchCategories": "",
  "Frequency": "<ul style=\"text-align: left;\"><li>JLPT_Level: N4</li><li>SoL: 2909</li><li>Shonen: 6321</li><li>Netflix Freq: ★★★★ (3006)</li><li>Anime &amp; J-drama: 3993</li><li>Youtube: 4129</li><li>VN: 4001</li><li>ICR: 3819</li><li>Narou: 5085</li><li>CC100: 3234</li><li>BCCWJ: 2891</li><li>BCCWJ: 3766</li><li>JPDBv2㋕: 4929</li><li>JPDBv2㋕: 52092㋕</li><li>H Freq: 4427-4454</li></ul>",
  "FreqSort": "51",
  "MiscInfo": "",
  "Tags": "Seruni yomitan",
  "furigana:ExpressionFurigana": "<ruby><rb>太</rb><rt>ふと</rt></ruby>る",
  "kana:ExpressionFurigana": "ふとる",
  "furigana:Sentence": "「こんなに食べたら<b>太っちゃいそう</b>だけど、仕方ないね」",
  "kanji:Sentence": "「こんなに食べたら<b>太っちゃいそう</b>だけど、仕方ないね」",
  "furigana:SentenceFurigana": "<span class=\"term\">「</span><span class=\"term\">こんなに</span><span class=\"term\"><ruby>食<rt>た</rt></ruby>べたら</span><span class=\"term\"><ruby>太<rt>ふと</rt></ruby>っちゃいそう</span><span class=\"term\">だけど、</span><span class=\"term\"><ruby>仕方<rt>しかた</rt></ruby>ないね</span><span class=\"term\">」</span>",
  "kana:SentenceFurigana": "<span class=\"term\">「</span><span class=\"term\">こんなに</span><span class=\"term\"><ruby>食<rt>た</rt></ruby>べたら</span><span class=\"term\"><ruby>太<rt>ふと</rt></ruby>っちゃいそう</span><span class=\"term\">だけど、</span><span class=\"term\"><ruby>仕方<rt>しかた</rt></ruby>ないね</span><span class=\"term\">」</span>"
}

// biome-ignore format: this looks nicer
export const exampleFields3: AnkiFields = {
  "Expression": "かたじけない",
  "ExpressionFurigana": "かたじけない",
  "ExpressionReading": "かたじけない",
  "ExpressionAudio": "<a class=\"replay-button soundLink\" href=# onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\" />\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\" />\n    </svg>\n</a>",
  "SelectionText": "<ol><li data-details=\"実用日本語表現辞典\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">実用日本語表現辞典</span></span></span><span class=\"dict-group__glossary\"><span class=\"dict-group__glossary--first-line\">かたじけない 別表記：辱い、忝い</span><span class=\"dict-group__glossary--first-line-break\"><br></span>感謝の意を表す言葉。 古語の「かたじけなし」の口語形。「こんなことをしてもらって、かたじけない」など、恐れ多さを表す際に使用する。語源は「難し気無し」や「勝たじ気甚し」など、諸説がある。</span></li></ol>",
  "MainDefinition": "",
  "DefinitionPicture": "",
  "Sentence": "本当に…<br>本当に <b>かたじけない</b>です！",
  "SentenceFurigana": "",
  "SentenceAudio": "<a class=\"replay-button soundLink\" href=# onclick=\"pycmd('play:a:1'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\" />\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\" />\n    </svg>\n</a>",
  "Picture": "<div><img src=\"SubsPlease%20Yuru%20Camp%20Movie%20(1080p)%20547C8607.mkv_4986679.jpeg\"></div>",
  "Glossary": "",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "",
  "PitchCategories": "",
  "Frequency": "",
  "FreqSort": "17352",
  "MiscInfo": "",
  "Tags": "yomichan",
  "furigana:ExpressionFurigana": "かたじけない",
  "kana:ExpressionFurigana": "かたじけない",
  "furigana:Sentence": "本当に…<br>本当に <b>かたじけない</b>です！",
  "kanji:Sentence": "本当に…<br>本当に <b>かたじけない</b>です！",
  "furigana:SentenceFurigana": "",
  "kana:SentenceFurigana": ""
}

// biome-ignore format: this looks nicer
export const exampleFields4: AnkiFields = {
  "Expression": "押し切る",
  "ExpressionFurigana": "押[お]し 切[き]る",
  "ExpressionReading": "おしきる",
  "ExpressionAudio": "<a class=\"replay-button soundLink\" href=\"#\" onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\"></circle>\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\"></path>\n    </svg>\n</a>",
  "SelectionText": "<ol><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">1</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">v5r</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">vt</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\">to overcome (opposition) | to push past | to force one's way</span></li><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">2</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">v5r</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">vt</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\">to press and cut</span></li><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">forms</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\">押し切る（★） | 押切る | 押しきる</span></li></ol>",
  "MainDefinition": "",
  "DefinitionPicture": "",
  "Sentence": "まひるんも ＯＫしてくれたから！<br>（周）<b>押し切られた</b>な…",
  "SentenceFurigana": "",
  "SentenceAudio": "<a class=\"replay-button soundLink\" href=\"#\" onclick=\"pycmd('play:a:1'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\"></circle>\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\"></path>\n    </svg>\n</a>",
  "Picture": "<div><img src=\"7.mkv_260094.webp\"></div>",
  "Glossary": "",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "",
  "IsSentenceCard": "1",
  "IsAudioCard": "",
  "PitchPosition": "<div class=\"pa-positions__group\" data-details=\"アクセント辞典\"><div class=\"pa-positions__dictionary\"><div class=\"pa-positions__dictionary-inner\">アクセント辞典</div></div><ol><li><span style=\"display:inline;\"><span>[</span><span>3</span><span>]</span></span></li></ol></div>",
  "PitchCategories": "",
  "Frequency": "",
  "FreqSort": "9978",
  "MiscInfo": "",
  "Tags": "yomichan",
  "furigana:ExpressionFurigana": "<ruby><rb>押</rb><rt>お</rt></ruby>し<ruby><rb>切</rb><rt>き</rt></ruby>る",
  "kana:ExpressionFurigana": "おしきる",
  "furigana:Sentence": "まひるんも ＯＫしてくれたから！<br>（周）<b>押し切られた</b>な…",
  "kanji:Sentence": "まひるんも ＯＫしてくれたから！<br>（周）<b>押し切られた</b>な…",
  "furigana:SentenceFurigana": "",
  "kana:SentenceFurigana": ""
}

// biome-ignore format: this looks nicer
export const exampleFields5: AnkiFields = {
  "Expression": "鼓",
  "ExpressionFurigana": "鼓[つづみ]",
  "ExpressionReading": "つづみ",
  "ExpressionAudio": "<a class=\"replay-button soundLink\" href=\"#\" onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\"></circle>\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\"></path>\n    </svg>\n</a>",
  "SelectionText": "",
  "MainDefinition": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><i>(★, Jitendex.org [2025-06-01])</i> <span><div><span data-sc-code=\"n\" title=\"noun (common) (futsuumeishi)\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">noun</span><div><ul data-sc-content=\"glossary\" style=\"padding-left: 0px; list-style-type: none;\"><li>hand drum</li></ul></div></div><div data-sc-content=\"attribution\" style=\"font-size: 0.7em; text-align: right;\"><a href=\"https://www.edrdg.org/jmwsgi/entr.py?svc=jmdict&amp;q=1267900\"><span>JMdict</span><span style=\"display:none;\"></span></a></div></span></div>",
  "DefinitionPicture": "<img alt=\"鼓 - Wikipedia\" src=\"paste-28b2da635b78620a0131d8df5ac754dcaf87fe52.jpg\">",
  "Sentence": "それからみんなで一緒に寮に帰って、みくりのお雑煮と苺華のおせちに舌<b>鼓</b>を打ったのだった。",
  "SentenceFurigana": "<span class=\"term\">それから</span><span class=\"term\">みんな</span><span class=\"term\">で</span><span class=\"term\"><ruby>一緒<rt>いっしょ</rt></ruby>に</span><span class=\"term\"><ruby>寮<rt>りょう</rt></ruby></span><span class=\"term\">に</span><span class=\"term\"><ruby>帰<rt>かえ</rt></ruby>って、</span><span class=\"term\">みくり</span><span class=\"term\">の</span><span class=\"term\">お<ruby>雑煮<rt>ぞうに</rt></ruby></span><span class=\"term\">と</span><span class=\"term\"><ruby>苺<rt>いちご</rt></ruby></span><span class=\"term\"><ruby>華<rt>はな</rt></ruby></span><span class=\"term\">の</span><span class=\"term\">おせち</span><span class=\"term\">に</span><span class=\"term\"><ruby>舌鼓<rt>したつづみ</rt></ruby>を<ruby>打<rt>う</rt></ruby>った</span><span class=\"term\">のだ</span><span class=\"term\">った</span><span class=\"term\"><ruby>。<rt>まる</rt></ruby></span>",
  "SentenceAudio": "",
  "Picture": "<img src=\"AmairoChocolata_2025-09-13-02-58-27-616.webp\">",
  "Glossary": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><i>(★, Jitendex.org [2025-06-01])</i> <span><div><span data-sc-code=\"n\" title=\"noun (common) (futsuumeishi)\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">noun</span><div><ul data-sc-content=\"glossary\" style=\"padding-left: 0px; list-style-type: none;\"><li>hand drum</li></ul></div></div><div data-sc-content=\"attribution\" style=\"font-size: 0.7em; text-align: right;\"><a href=\"https://www.edrdg.org/jmwsgi/entr.py?svc=jmdict&amp;q=1267900\"><span>JMdict</span><span style=\"display:none;\"></span></a></div></span></div>",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "",
  "PitchCategories": "",
  "Frequency": "<ul style=\"text-align: left;\"><li>Shonen: 18351</li><li>Netflix Freq: ★★★ (8614)</li><li>Anime &amp; J-drama: 20350</li><li>Youtube: 45427</li><li>VN: 30015</li><li>ICR: 11007</li><li>Narou: 34853</li><li>CC100: 39605</li><li>BCCWJ: 28444</li><li>BCCWJ: 39114</li><li>JPDBv2㋕: 28272</li><li>JPDBv2㋕: 56986㋕</li><li>H Freq: 21429-23831</li></ul>",
  "FreqSort": "20482",
  "MiscInfo": "",
  "Tags": "Game::AmairoChocolata GSM yomitan",
  "furigana:ExpressionFurigana": "<ruby><rb>鼓</rb><rt>つづみ</rt></ruby>",
  "kana:ExpressionFurigana": "つづみ",
  "furigana:Sentence": "それからみんなで一緒に寮に帰って、みくりのお雑煮と苺華のおせちに舌<b>鼓</b>を打ったのだった。",
  "kanji:Sentence": "それからみんなで一緒に寮に帰って、みくりのお雑煮と苺華のおせちに舌<b>鼓</b>を打ったのだった。",
  "furigana:SentenceFurigana": "<span class=\"term\">それから</span><span class=\"term\">みんな</span><span class=\"term\">で</span><span class=\"term\"><ruby>一緒<rt>いっしょ</rt></ruby>に</span><span class=\"term\"><ruby>寮<rt>りょう</rt></ruby></span><span class=\"term\">に</span><span class=\"term\"><ruby>帰<rt>かえ</rt></ruby>って、</span><span class=\"term\">みくり</span><span class=\"term\">の</span><span class=\"term\">お<ruby>雑煮<rt>ぞうに</rt></ruby></span><span class=\"term\">と</span><span class=\"term\"><ruby>苺<rt>いちご</rt></ruby></span><span class=\"term\"><ruby>華<rt>はな</rt></ruby></span><span class=\"term\">の</span><span class=\"term\">おせち</span><span class=\"term\">に</span><span class=\"term\"><ruby>舌鼓<rt>したつづみ</rt></ruby>を<ruby>打<rt>う</rt></ruby>った</span><span class=\"term\">のだ</span><span class=\"term\">った</span><span class=\"term\"><ruby>。<rt>まる</rt></ruby></span>",
  "kana:SentenceFurigana": "<span class=\"term\">それから</span><span class=\"term\">みんな</span><span class=\"term\">で</span><span class=\"term\"><ruby>一緒<rt>いっしょ</rt></ruby>に</span><span class=\"term\"><ruby>寮<rt>りょう</rt></ruby></span><span class=\"term\">に</span><span class=\"term\"><ruby>帰<rt>かえ</rt></ruby>って、</span><span class=\"term\">みくり</span><span class=\"term\">の</span><span class=\"term\">お<ruby>雑煮<rt>ぞうに</rt></ruby></span><span class=\"term\">と</span><span class=\"term\"><ruby>苺<rt>いちご</rt></ruby></span><span class=\"term\"><ruby>華<rt>はな</rt></ruby></span><span class=\"term\">の</span><span class=\"term\">おせち</span><span class=\"term\">に</span><span class=\"term\"><ruby>舌鼓<rt>したつづみ</rt></ruby>を<ruby>打<rt>う</rt></ruby>った</span><span class=\"term\">のだ</span><span class=\"term\">った</span><span class=\"term\"><ruby>。<rt>まる</rt></ruby></span>"
}

// biome-ignore format: this looks nicer
export const exampleFields6: AnkiFields = {
  "Expression": "からくり",
  "ExpressionFurigana": "絡繰[からくり]",
  "ExpressionReading": "",
  "ExpressionAudio": "",
  "SelectionText": "<ol><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">1</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">n</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">uk</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\">mechanism | machinery | contrivance | device</span></li><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">2</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">n</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">uk</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\">trick | dodge</span></li><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">3</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">n</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">abbr</span></span><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">uk</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\"><span><ul data-sc-content=\"glossary\" lang=\"en\" style=\"list-style-type: circle;\"><li>mechanical doll</li><li>string puppet</li></ul><ul data-sc-content=\"references\" lang=\"en\" style=\"list-style-type: &quot;➡ &quot;;\"><li>see: <a lang=\"ja\" href=\"#\"><span>からくり人形</span></a><span data-sc-content=\"refGlosses\" style=\"font-size: 65%; vertical-align: middle;\"> mechanical doll; automaton; string puppet; marionette</span></li></ul></span></span></li><li data-details=\"JMdict\"><span class=\"dict-group__tag-list\"><span class=\"dict-group__tag dict-group__tag--name\"><span class=\"dict-group__tag-inner\">forms</span></span><span class=\"dict-group__tag dict-group__tag--dict\"><span class=\"dict-group__tag-inner\">JMdict</span></span></span><span class=\"dict-group__glossary\">からくり | カラクリ | 絡繰り（🅁） | 絡繰（🅁） | 機関（🅁）</span></li></ol>",
  "MainDefinition": "",
  "DefinitionPicture": "",
  "Sentence": "ゴールの方程式の<b>からくり</b>は<br>分かったけど",
  "SentenceFurigana": "ゴールの 方程式[ほうていしき]の<b>からくり</b>は<br> 分[わ]かったけど",
  "SentenceAudio": "<a class=\"replay-button soundLink\" href=\"#\" onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\"></circle>\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\"></path>\n    </svg>\n</a>",
  "Picture": "<div><img src=\"trix%20blue%20lock%20-%20s01e08%20(720p%20av1).mkv_1033903_9070.webp\"></div>",
  "Glossary": "",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "<div class=\"pa-positions__group\" data-details=\"アクセント辞典\"><div class=\"pa-positions__dictionary\"><div class=\"pa-positions__dictionary-inner\">アクセント辞典</div></div><ol><li><span style=\"display:inline;\"><span>[</span><span>0</span><span>]</span></span></li><li><span style=\"display:inline;\"><span>[</span><span>2</span><span>]</span></span></li></ol></div>",
  "PitchCategories": "",
  "Frequency": "",
  "FreqSort": "14614",
  "MiscInfo": "",
  "Tags": "yomichan",
  "furigana:ExpressionFurigana": "<ruby><rb>絡繰</rb><rt>からくり</rt></ruby>",
  "kana:ExpressionFurigana": "からくり",
  "furigana:Sentence": "ゴールの方程式の<b>からくり</b>は<br>分かったけど",
  "kanji:Sentence": "ゴールの方程式の<b>からくり</b>は<br>分かったけど",
  "furigana:SentenceFurigana": "ゴールの<ruby><rb>方程式</rb><rt>ほうていしき</rt></ruby>の<b>からくり</b>は<br><ruby><rb>分</rb><rt>わ</rt></ruby>かったけど",
  "kana:SentenceFurigana": "ゴールのほうていしきの<b>からくり</b>は<br>わかったけど"
}

// biome-ignore format: this looks nicer
export const exampleFields7: AnkiFields = {
  "Expression": "媚びる",
  "ExpressionFurigana": "媚[こ]びる",
  "ExpressionReading": "こびる",
  "ExpressionAudio": "<a class=\"replay-button soundLink\" href=\"#\" onclick=\"pycmd('play:a:0'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\"></circle>\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\"></path>\n    </svg>\n</a>",
  "SelectionText": "彼かの女じょは先せん生せいにこびてばかり。<br>\nShe always kisses up to teachers.",
  "MainDefinition": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><ol><li data-dictionary=\"Jitendex.org [2025-06-01]\"><i>(Jitendex.org [2025-06-01])</i> <span><div><span data-sc-code=\"v1\" title=\"Ichidan verb\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">1-dan</span><span data-sc-code=\"vi\" title=\"intransitive verb\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">intransitive</span><ol><li style=\"padding-left: 0.25em; list-style-type: &quot;①&quot;;\"><ul data-sc-content=\"glossary\"><li>to flatter</li><li>to curry favor (with)</li><li>to fawn (on)</li></ul><div data-sc-content=\"extra-info\" style=\"margin-left: 0.5em;\"><div><div data-sc-content=\"example-sentence\" data-sc-source=\"88247\" style=\"background-color: color-mix(in srgb, var(--text-color, var(--fg, #333)) 5%, transparent); border-color: var(--text-color, var(--fg, #333)); border-style: none none none solid; border-radius: 0.4rem; border-width: calc(3em / var(--font-size-no-units, 14)); margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem;\"><div data-sc-content=\"example-sentence-a\" lang=\"ja\" style=\"font-size: 1.3em;\"><ruby lang=\"ja\">彼<rt lang=\"ja\">かの</rt></ruby><ruby lang=\"ja\">女<rt lang=\"ja\">じょ</rt></ruby>は<ruby lang=\"ja\">先<rt lang=\"ja\">せん</rt></ruby><ruby lang=\"ja\">生<rt lang=\"ja\">せい</rt></ruby><span lang=\"ja\" style=\"color: color-mix(in srgb, lime, var(--text-color, var(--fg, #333)));\">にこびて</span>ばかり。</div><div data-sc-content=\"example-sentence-b\" style=\"font-size: 0.8em;\">She always kisses up to teachers.</div></div></div></div></li><li style=\"padding-left: 0.25em; list-style-type: &quot;②&quot;;\"><ul data-sc-content=\"glossary\"><li>to flirt (with; a man)</li><li>to make eyes (at)</li></ul></li></ol></div><div data-sc-content=\"attribution\" style=\"font-size: 0.7em; text-align: right;\"><a href=\"https://www.edrdg.org/jmwsgi/entr.py?svc=jmdict&amp;q=1566080\"><span>JMdict</span><span style=\"display:none;\"></span></a> | <a href=\"https://tatoeba.org/en/sentences/show/88247\"><span>Tatoeba</span><span style=\"display:none;\"></span></a></div></span></li></ol></div>",
  "DefinitionPicture": "",
  "Sentence": "あ… ちょっと<br><b>こびすぎ</b>じゃない？",
  "SentenceFurigana": "<span class=\"term\">ちょっと</span><span class=\"term\">こびすぎ</span><span class=\"term\">じゃない</span><span class=\"term\">？</span>",
  "SentenceAudio": "<a class=\"replay-button soundLink\" href=\"#\" onclick=\"pycmd('play:a:1'); return false;\">\n    <svg class=\"playImage\" viewBox=\"0 0 64 64\" version=\"1.1\">\n        <circle cx=\"32\" cy=\"32\" r=\"29\"></circle>\n        <path d=\"M56.502,32.301l-37.502,20.101l0.329,-40.804l37.173,20.703Z\"></path>\n    </svg>\n</a>",
  "Picture": "<img src=\"AV1ARY_New_Game!_-_05__36932_VM066QnE.jpeg\">",
  "Glossary": "<div style=\"text-align: left;\" class=\"yomitan-glossary\"><ol><li data-dictionary=\"Jitendex.org [2025-06-01]\"><i>(Jitendex.org [2025-06-01])</i> <span><div><span data-sc-code=\"v1\" title=\"Ichidan verb\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">1-dan</span><span data-sc-code=\"vi\" title=\"intransitive verb\" style=\"font-weight: bold; font-size: 0.8em; color: white; background-color: rgb(86, 86, 86); vertical-align: text-bottom; border-radius: 0.3em; margin-right: 0.25em; padding: 0.2em 0.3em; word-break: keep-all; cursor: help;\">intransitive</span><ol><li style=\"padding-left: 0.25em; list-style-type: &quot;①&quot;;\"><ul data-sc-content=\"glossary\"><li>to flatter</li><li>to curry favor (with)</li><li>to fawn (on)</li></ul><div data-sc-content=\"extra-info\" style=\"margin-left: 0.5em;\"><div><div data-sc-content=\"example-sentence\" data-sc-source=\"88247\" style=\"background-color: color-mix(in srgb, var(--text-color, var(--fg, #333)) 5%, transparent); border-color: var(--text-color, var(--fg, #333)); border-style: none none none solid; border-radius: 0.4rem; border-width: calc(3em / var(--font-size-no-units, 14)); margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 0.5rem;\"><div data-sc-content=\"example-sentence-a\" lang=\"ja\" style=\"font-size: 1.3em;\"><ruby lang=\"ja\">彼<rt lang=\"ja\">かの</rt></ruby><ruby lang=\"ja\">女<rt lang=\"ja\">じょ</rt></ruby>は<ruby lang=\"ja\">先<rt lang=\"ja\">せん</rt></ruby><ruby lang=\"ja\">生<rt lang=\"ja\">せい</rt></ruby><span lang=\"ja\" style=\"color: color-mix(in srgb, lime, var(--text-color, var(--fg, #333)));\">にこびて</span>ばかり。</div><div data-sc-content=\"example-sentence-b\" style=\"font-size: 0.8em;\">She always kisses up to teachers.</div></div></div></div></li><li style=\"padding-left: 0.25em; list-style-type: &quot;②&quot;;\"><ul data-sc-content=\"glossary\"><li>to flirt (with; a man)</li><li>to make eyes (at)</li></ul></li></ol></div><div data-sc-content=\"attribution\" style=\"font-size: 0.7em; text-align: right;\"><a href=\"https://www.edrdg.org/jmwsgi/entr.py?svc=jmdict&amp;q=1566080\"><span>JMdict</span><span style=\"display:none;\"></span></a> | <a href=\"https://tatoeba.org/en/sentences/show/88247\"><span>Tatoeba</span><span style=\"display:none;\"></span></a></div></span></li><li data-dictionary=\"三省堂国語辞典　第八版\"><i>(三省堂国語辞典　第八版)</i> <span><span data-sc-name=\"見出部\"><span data-sc-name=\"見出仮名\" lang=\"ja\" style=\"font-weight: bold;\">こ<span data-sc-name=\"活用分節\" lang=\"ja\">・</span>び<span data-sc-name=\"アクセント\"><span style=\"vertical-align: text-bottom;\"><a target=\"_blank\" rel=\"noreferrer noopener\" href=\"yomitan_dictionary_media_1_2025-07-15-17-49-16-086.svg\" style=\"cursor:inherit;display:inline-block;position:relative;line-height:1;max-width:100%;color:inherit;\"><span style=\"display:inline-block;white-space:nowrap;max-width:100%;max-height:100vh;position:relative;vertical-align:top;line-height:0;overflow:hidden;font-size:1px;font-size:1em;width: 0.5em;\"><span style=\"display:inline-block;width:0;vertical-align:top;font-size:0;padding-top: 200%;\"></span><span style=\"--image:none;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center center;-webkit-mask-mode:alpha;-webkit-mask-size:contain;-webkit-mask-image:var(--image);mask-repeat:no-repeat;mask-position:center center;mask-mode:alpha;mask-size:contain;mask-image:var(--image);background-color:currentColor;display:none;--image: url(&quot;yomitan_dictionary_media_1_2025-07-15-17-49-16-086.svg&quot;);\"></span><span style=\"position:absolute;left:0;top:0;width:100%;height:100%;font-size:calc(1em * var(--font-size-no-units));line-height:var(--line-height);display:table;table-layout:fixed;white-space:normal;color:var(--text-color-light3);\"></span><img width=\"14\" height=\"28\" src=\"yomitan_dictionary_media_1_2025-07-15-17-49-16-086.svg\" style=\"display:inline-block;vertical-align:top;object-fit:contain;border:none;outline:none;position:absolute;left:0;top:0;width:100%;height:100%;width: 100%; height: 100%;\"></span><span style=\"display:none;line-height:var(--line-height);\">Image</span></a></span></span>る</span><span data-sc-name=\"表記G\" lang=\"ja\">［<span data-sc-name=\"表記\"><span data-sc-name=\"仮名書き可\" lang=\"ja\"><span data-sc-name=\"red\" style=\"vertical-align: text-bottom;\"><a target=\"_blank\" rel=\"noreferrer noopener\" href=\"yomitan_dictionary_media_2_2025-07-15-17-49-16-086.svg\" style=\"cursor:inherit;display:inline-block;position:relative;line-height:1;max-width:100%;color:inherit;\"><span style=\"display:inline-block;white-space:nowrap;max-width:100%;max-height:100vh;position:relative;vertical-align:top;line-height:0;overflow:hidden;font-size:1px;font-size:1em;width: 1em;\"><span style=\"display:inline-block;width:0;vertical-align:top;font-size:0;padding-top: 100%;\"></span><span style=\"--image:none;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center center;-webkit-mask-mode:alpha;-webkit-mask-size:contain;-webkit-mask-image:var(--image);mask-repeat:no-repeat;mask-position:center center;mask-mode:alpha;mask-size:contain;mask-image:var(--image);background-color:currentColor;display:none;--image: url(&quot;yomitan_dictionary_media_2_2025-07-15-17-49-16-086.svg&quot;);\"></span><span style=\"position:absolute;left:0;top:0;width:100%;height:100%;font-size:calc(1em * var(--font-size-no-units));line-height:var(--line-height);display:table;table-layout:fixed;white-space:normal;color:var(--text-color-light3);\"></span><img width=\"28\" height=\"28\" src=\"yomitan_dictionary_media_2_2025-07-15-17-49-16-086.svg\" style=\"display:inline-block;vertical-align:top;object-fit:contain;border:none;outline:none;position:absolute;left:0;top:0;width:100%;height:100%;width: 100%; height: 100%;\"></span><span style=\"display:none;line-height:var(--line-height);\">Image</span></a></span><ruby data-sc-name=\"表外字\" lang=\"ja\">媚<rt data-sc-name=\"表外字マーク\">×</rt></ruby>びる<span data-sc-name=\"red\" style=\"vertical-align: text-bottom;\"><a target=\"_blank\" rel=\"noreferrer noopener\" href=\"yomitan_dictionary_media_3_2025-07-15-17-49-16-086.svg\" style=\"cursor:inherit;display:inline-block;position:relative;line-height:1;max-width:100%;color:inherit;\"><span style=\"display:inline-block;white-space:nowrap;max-width:100%;max-height:100vh;position:relative;vertical-align:top;line-height:0;overflow:hidden;font-size:1px;font-size:1em;width: 1em;\"><span style=\"display:inline-block;width:0;vertical-align:top;font-size:0;padding-top: 100%;\"></span><span style=\"--image:none;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center center;-webkit-mask-mode:alpha;-webkit-mask-size:contain;-webkit-mask-image:var(--image);mask-repeat:no-repeat;mask-position:center center;mask-mode:alpha;mask-size:contain;mask-image:var(--image);background-color:currentColor;display:none;--image: url(&quot;yomitan_dictionary_media_3_2025-07-15-17-49-16-086.svg&quot;);\"></span><span style=\"position:absolute;left:0;top:0;width:100%;height:100%;font-size:calc(1em * var(--font-size-no-units));line-height:var(--line-height);display:table;table-layout:fixed;white-space:normal;color:var(--text-color-light3);\"></span><img width=\"28\" height=\"28\" src=\"yomitan_dictionary_media_3_2025-07-15-17-49-16-086.svg\" style=\"display:inline-block;vertical-align:top;object-fit:contain;border:none;outline:none;position:absolute;left:0;top:0;width:100%;height:100%;width: 100%; height: 100%;\"></span><span style=\"display:none;line-height:var(--line-height);\">Image</span></a></span></span></span>］</span><span data-sc-name=\"品詞G\"><span data-sc-name=\"品詞subG\" lang=\"ja\">｟<span data-sc-name=\"品詞\" lang=\"ja\">自上一</span>｠</span></span></span><div data-sc-name=\"解説部\"><div data-sc-name=\"大語義\"><div data-sc-name=\"語義\"><span data-sc-name=\"語義番号\">①</span><span data-sc-name=\"語釈\" lang=\"ja\">相手の気に入るような言動をする。へつらう。おもねる。</span><div data-sc-name=\"用例G\" lang=\"ja\">「<span data-sc-name=\"用例\" lang=\"ja\">権勢に<span data-sc-name=\"見出相当部\" style=\"margin-left: 0.125em; margin-right: 0.125em;\">━</span></span>」</div></div><div data-sc-name=\"語義\"><span data-sc-name=\"語義番号\">②</span><span data-sc-name=\"語釈\" lang=\"ja\">色っぽく<span data-sc-name=\"分書\" style=\"margin-right: 0.5em;\"></span>さそうようすを見せる。</span><div data-sc-name=\"用例G\" lang=\"ja\">「<span data-sc-name=\"用例\" lang=\"ja\"><span data-sc-name=\"見出相当部\" style=\"margin-left: 0.125em; margin-right: 0.125em;\">━</span>ような目</span>」</div></div></div></div></span></li><li data-dictionary=\"明鏡国語辞典　第二版\"><i>(明鏡国語辞典　第二版)</i> <span lang=\"ja\">こ・びる【<ruby lang=\"ja\">媚<rt>▼</rt></ruby>びる】<br>〘自上一〙<br>❶ 人に気に入られるように機嫌をとる。へつらう。<br>「権力［上司］に━」<br>❷ 人の気を引くために、なまめかしい態度をとる。<br>「しなをつくって━」<br><span style=\"vertical-align: text-bottom; margin-right: 0.25em;\"><a target=\"_blank\" rel=\"noreferrer noopener\" href=\"yomitan_dictionary_media_4_2025-07-15-17-49-16-086.png\" style=\"cursor:inherit;display:inline-block;position:relative;line-height:1;max-width:100%;color:inherit;\"><span title=\"文語形\" style=\"display:inline-block;white-space:nowrap;max-width:100%;max-height:100vh;position:relative;vertical-align:top;line-height:0;overflow:hidden;font-size:1px;font-size:1em;width: 1em;\"><span style=\"display:inline-block;width:0;vertical-align:top;font-size:0;padding-top: 100%;\"></span><span style=\"--image:none;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center center;-webkit-mask-mode:alpha;-webkit-mask-size:contain;-webkit-mask-image:var(--image);mask-repeat:no-repeat;mask-position:center center;mask-mode:alpha;mask-size:contain;mask-image:var(--image);background-color:currentColor;display:none;--image: url(&quot;yomitan_dictionary_media_4_2025-07-15-17-49-16-086.png&quot;);\"></span><span style=\"position:absolute;left:0;top:0;width:100%;height:100%;font-size:calc(1em * var(--font-size-no-units));line-height:var(--line-height);display:table;table-layout:fixed;white-space:normal;color:var(--text-color-light3);\"></span><img width=\"28\" height=\"28\" src=\"yomitan_dictionary_media_4_2025-07-15-17-49-16-086.png\" style=\"display:inline-block;vertical-align:top;object-fit:contain;border:none;outline:none;position:absolute;left:0;top:0;width:100%;height:100%;width: 100%; height: 100%;\"></span><span style=\"display:none;line-height:var(--line-height);\">Image</span></a></span>こ・ぶ（上二）<br><span style=\"vertical-align: text-bottom; margin-right: 0.25em;\"><a target=\"_blank\" rel=\"noreferrer noopener\" href=\"yomitan_dictionary_media_5_2025-07-15-17-49-16-086.png\" style=\"cursor:inherit;display:inline-block;position:relative;line-height:1;max-width:100%;color:inherit;\"><span title=\"名詞への転成\" style=\"display:inline-block;white-space:nowrap;max-width:100%;max-height:100vh;position:relative;vertical-align:top;line-height:0;overflow:hidden;font-size:1px;font-size:1em;width: 1em;\"><span style=\"display:inline-block;width:0;vertical-align:top;font-size:0;padding-top: 100%;\"></span><span style=\"--image:none;position:absolute;left:0;top:0;width:100%;height:100%;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center center;-webkit-mask-mode:alpha;-webkit-mask-size:contain;-webkit-mask-image:var(--image);mask-repeat:no-repeat;mask-position:center center;mask-mode:alpha;mask-size:contain;mask-image:var(--image);background-color:currentColor;display:none;--image: url(&quot;yomitan_dictionary_media_5_2025-07-15-17-49-16-086.png&quot;);\"></span><span style=\"position:absolute;left:0;top:0;width:100%;height:100%;font-size:calc(1em * var(--font-size-no-units));line-height:var(--line-height);display:table;table-layout:fixed;white-space:normal;color:var(--text-color-light3);\"></span><img width=\"28\" height=\"28\" src=\"yomitan_dictionary_media_5_2025-07-15-17-49-16-086.png\" style=\"display:inline-block;vertical-align:top;object-fit:contain;border:none;outline:none;position:absolute;left:0;top:0;width:100%;height:100%;width: 100%; height: 100%;\"></span><span style=\"display:none;line-height:var(--line-height);\">Image</span></a></span>こび</span></li><li data-dictionary=\"デジタル大辞泉\"><i>(デジタル大辞泉)</i> こ・びる【×媚びる】<br>［動バ上一］［文］こ・ぶ［バ上二］<br>① 他人に気に入られるような態度をとる。機嫌をとる。へつらう。「権力者に―・びる」「観客に―・びる演技」<br>② 女が男の気を引こうとしてなまめかしい態度や表情をする。「―・びるような目つき」</li></ol></div>",
  "Hint": "",
  "IsWordAndSentenceCard": "",
  "IsClickCard": "",
  "IsSentenceCard": "",
  "IsAudioCard": "",
  "PitchPosition": "",
  "PitchCategories": "",
  "Frequency": "<ul style=\"text-align: left;\"><li>SoL: 25959</li><li>Shonen: 22525</li><li>Netflix Freq: ★ (42642)</li><li>Anime &amp; J-drama: 32377</li><li>Youtube: 19293</li><li>VN: 9410</li><li>ICR: 15111</li><li>Narou: 10618</li><li>CC100: 22915</li><li>BCCWJ: 21936</li><li>BCCWJ: 22787</li><li>JPDBv2㋕: 12717</li><li>JPDBv2㋕: 44292㋕</li><li>H Freq: 2451-2456</li></ul>",
  "FreqSort": "11632",
  "MiscInfo": "NEW GAME!シーズン 05.ass (0m36s)",
  "Tags": "yomitan",
  "furigana:ExpressionFurigana": "<ruby><rb>媚</rb><rt>こ</rt></ruby>びる",
  "kana:ExpressionFurigana": "こびる",
  "furigana:Sentence": "あ… ちょっと<br><b>こびすぎ</b>じゃない？",
  "kanji:Sentence": "あ… ちょっと<br><b>こびすぎ</b>じゃない？",
  "furigana:SentenceFurigana": "<span class=\"term\">ちょっと</span><span class=\"term\">こびすぎ</span><span class=\"term\">じゃない</span><span class=\"term\">？</span>",
  "kana:SentenceFurigana": "<span class=\"term\">ちょっと</span><span class=\"term\">こびすぎ</span><span class=\"term\">じゃない</span><span class=\"term\">？</span>"
}
