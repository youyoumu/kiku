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
  "Sentence",
  "kanji:Sentence",
  "furigana:Sentence",
  "SentenceFurigana",
  "furigana:SentenceFurigana",
  "kana:SentenceFurigana",

  "IsWordAndSentenceCard",
  "IsSentenceCard",
  "IsClickCard",
  "IsAudioCard",
  "SentenceAudio",
  "ExpressionAudio",
  "Hint",
  "Picture",
] satisfies readonly (keyof AnkiFields)[];

type ExtractUsedFields<T, U extends readonly (keyof T)[]> = Pick<T, U[number]>;

export type AnkiFrontFields = ExtractUsedFields<AnkiFields, typeof frontKeys>;
export type AnkiBackFields = AnkiFields;
export type AnkiFrontFieldNodes = ExtractUsedFields<
  AnkiFieldNodes,
  typeof frontKeys
>;
export type AnkiBackFieldNodes = AnkiFieldNodes;

export type AnkiNote = {
  cards: number[];
  fields: Record<keyof AnkiFields, { order: number; value: string }>;
  mod: number;
  modelName: string;
  noteId: number;
  profile: string;
  tags: string[];
};

export type KikuNotesChunk = {
  /** Path or filename of the chunk, e.g. "_kiku_notes_0.json.gz" */
  file: string;
  /** Number of notes contained in this chunk */
  count: number;
  /** [minNoteId, maxNoteId] range covered by this chunk */
  range: [number, number];
};

export interface KikuNotesManifest {
  profile: string;
  totalNotes: number;
  chunks: KikuNotesChunk[];
  generatedAt: number;
}

export type Kanji = {
  level: number;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  important_reading: "onyomi" | "kunyomi";
  nanori: string[];
};

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
