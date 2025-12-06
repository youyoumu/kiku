import type { Debug } from "./util/debug";
import type { Logger } from "./util/logger";
import type { NexClient } from "./worker/client";

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
  "Tags",
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
  file: string;
  count: number;
  range: [number, number];
};

export type KikuNotesManifest = {
  profile: string;
  totalNotes: number;
  chunks: KikuNotesChunk[];
  generatedAt: number;
};

export type KikuDbMainManifest = {
  files: Record<string, { start: number; end: number; size: number }>;
};

export type Kanji = {
  level: number;
  meanings: string[];
  onyomi: string[];
  kunyomi: string[];
  important_reading: "onyomi" | "kunyomi";
  nanori: string[];
};

export type KanjiInfo = {
  composedOf: string[];
  usedIn: string[];
  wkMeaning: string;
  meanings: string[];
  keyword: string;
  readings: { reading: string; percentage: string }[];
  frequency: string;
  kind: string;
  visuallySimilar: string[];
  related: string[];
};

export type KanjiInfoCompact = [
  string[], // composedOf
  string[], // usedIn
  string, // wkMeaning
  string[], // meanings
  string, // keyword
  { reading: string; percentage: string }[], // readings
  string, // frequency
  string, // kind
  string[], // visuallySimilar
  string[], // related
];

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

type AnkiResponse<T = unknown> = {
  success: boolean;
  value?: T;
  error?: string;
};

export type AnkiDroidAPI = {
  ankiGetNewCardCount(): Promise<AnkiResponse>;
  ankiGetLrnCardCount(): Promise<AnkiResponse>;
  ankiGetRevCardCount(): Promise<AnkiResponse>;
  ankiGetETA(): Promise<AnkiResponse>;
  ankiGetCardMark(): Promise<AnkiResponse>;
  ankiGetCardFlag(): Promise<AnkiResponse>;
  ankiGetNextTime1(): Promise<AnkiResponse>;
  ankiGetNextTime2(): Promise<AnkiResponse>;
  ankiGetNextTime3(): Promise<AnkiResponse>;
  ankiGetNextTime4(): Promise<AnkiResponse>;
  ankiGetCardReps(): Promise<AnkiResponse>;
  ankiGetCardInterval(): Promise<AnkiResponse>;
  ankiGetCardFactor(): Promise<AnkiResponse>;
  ankiGetCardMod(): Promise<AnkiResponse>;
  ankiGetCardId(): Promise<AnkiResponse>;
  ankiGetCardNid(): Promise<AnkiResponse>;
  ankiGetCardType(): Promise<AnkiResponse>;
  ankiGetCardDid(): Promise<AnkiResponse>;
  ankiGetCardLeft(): Promise<AnkiResponse>;
  ankiGetCardODid(): Promise<AnkiResponse>;
  ankiGetCardODue(): Promise<AnkiResponse>;
  ankiGetCardQueue(): Promise<AnkiResponse>;
  ankiGetCardLapses(): Promise<AnkiResponse>;
  ankiGetCardDue(): Promise<AnkiResponse>;
  ankiIsInFullscreen(): Promise<AnkiResponse>;
  ankiIsTopbarShown(): Promise<AnkiResponse>;
  ankiIsInNightMode(): Promise<AnkiResponse>;
  ankiIsDisplayingAnswer(): Promise<AnkiResponse>;
  ankiGetDeckName(): Promise<AnkiResponse>;
  ankiIsActiveNetworkMetered(): Promise<AnkiResponse>;
  ankiTtsFieldModifierIsAvailable(): Promise<AnkiResponse>;
  ankiTtsIsSpeaking(): Promise<AnkiResponse>;
  ankiTtsStop(): Promise<AnkiResponse>;
  ankiBuryCard(): Promise<AnkiResponse>;
  ankiBuryNote(): Promise<AnkiResponse>;
  ankiSuspendCard(): Promise<AnkiResponse>;
  ankiSuspendNote(): Promise<AnkiResponse>;
  ankiAddTagToCard(): Promise<AnkiResponse>;
  ankiResetProgress(): Promise<AnkiResponse>;
  ankiMarkCard(): Promise<AnkiResponse>;
  ankiToggleFlag(): Promise<AnkiResponse>;
  ankiSearchCard(query: string): Promise<AnkiResponse>;
  ankiSearchCardWithCallback(): Promise<AnkiResponse>;
  ankiTtsSpeak(): Promise<AnkiResponse>;
  ankiTtsSetLanguage(): Promise<AnkiResponse>;
  ankiTtsSetPitch(): Promise<AnkiResponse>;
  ankiTtsSetSpeechRate(): Promise<AnkiResponse>;
  ankiEnableHorizontalScrollbar(): Promise<AnkiResponse>;
  ankiEnableVerticalScrollbar(): Promise<AnkiResponse>;
  ankiSetCardDue(): Promise<AnkiResponse>;
  ankiShowNavigationDrawer(): Promise<AnkiResponse>;
  ankiShowOptionsMenu(): Promise<AnkiResponse>;
  ankiShowToast(): Promise<AnkiResponse>;
  ankiShowAnswer(): Promise<AnkiResponse>;
  ankiAnswerEase1(): Promise<AnkiResponse>;
  ankiAnswerEase2(): Promise<AnkiResponse>;
  ankiAnswerEase3(): Promise<AnkiResponse>;
  ankiAnswerEase4(): Promise<AnkiResponse>;
  ankiSttSetLanguage(): Promise<AnkiResponse>;
  ankiSttStart(): Promise<AnkiResponse>;
  ankiSttStop(): Promise<AnkiResponse>;
  ankiAddTagToNote(): Promise<AnkiResponse>;
  ankiSetNoteTags(): Promise<AnkiResponse>;
  ankiGetNoteTags(): Promise<AnkiResponse>;
};

declare global {
  var KIKU_STATE: {
    relax?: boolean;
    startupTime?: number;
    root?: HTMLElement;
    isAnkiWeb?: boolean;
    assetsPath: string;
    logger: Logger;
    ankiDroidAPI?: AnkiDroidAPI;
    isAnkiDesktop?: boolean;
    nexClient?: NexClient;
    side?: "front" | "back";
    ssr?: boolean;
    aborter: AbortController;
    debug: Debug;
    dispose?: () => void;
    unload?: () => void;
  };
  var pycmd: () => void;
  var AnkiDroidJS: {
    new (contract: { version: string; developer?: string }): AnkiDroidAPI;
    prototype: AnkiDroidAPI;
  };
}
