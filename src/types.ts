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
