import type { WorkerApi } from "#/src/worker/client";
import type { Logger } from "./logger";

export type AnkiFields = {
  Expression: string;
  ExpressionFurigana: string;
  ExpressionReading: string;
  ExpressionAudio: string;
  RelatedExpression: string;
  SelectionText: string;
  MainDefinition: string;
  DefinitionPicture: string;
  Sentence: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  SentenceTranslation: string;
  Picture: string;
  Glossary: string;
  PreferredDictionary: string;
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
  CardID: string;

  // === Variants (for furigana/kana helpers) ===
  "furigana:ExpressionFurigana": string;
  "kana:ExpressionFurigana": string;
  "furigana:Sentence": string;
  "kanji:Sentence": string;
  "furigana:SentenceFurigana": string;
  "kana:SentenceFurigana": string;
  __IS_ROOT__?: boolean;
};

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

export type TermInfo = {
  forms: string[];
  antonym: string[];
  referenced: string[];
};

export type TermInfoCompact = [
  string[], // forms
  string[], // antonym
  string[], // referenced
];

export type Source = "forms" | "antonym" | "referenced" | "related";

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

export const ankiFieldsSkeleton: AnkiFields = {
  Expression: "",
  ExpressionFurigana: "",
  ExpressionReading: "",
  ExpressionAudio: "",
  RelatedExpression: "",
  SelectionText: "",
  MainDefinition: "",
  DefinitionPicture: "",
  Sentence: "",
  SentenceFurigana: "",
  SentenceTranslation: "",
  SentenceAudio: "",
  Picture: "",
  Glossary: "",
  PreferredDictionary: "",
  Hint: "",
  IsWordAndSentenceCard: "",
  IsClickCard: "",
  IsSentenceCard: "",
  IsAudioCard: "",
  PitchPosition: "",
  PitchCategories: "",
  Frequency: "",
  FreqSort: "",
  MiscInfo: "",
  Tags: "",
  CardID: "",
  "furigana:ExpressionFurigana": "",
  "kana:ExpressionFurigana": "",
  "furigana:Sentence": "",
  "kanji:Sentence": "",
  "furigana:SentenceFurigana": "",
  "kana:SentenceFurigana": "",
};

export type PitchType = "heiban" | "atamadaka" | "nakadaka" | "odaka" | "kifuku";
export const pitchTypes: PitchType[] = ["heiban", "atamadaka", "nakadaka", "odaka", "kifuku"];

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
  interface PromiseWithResolvers<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    /* oxlint-disable */
    reject: (reason?: any) => void;
  }

  interface PromiseConstructor {
    withResolvers<T>(): PromiseWithResolvers<T>;
  }

  var pycmd: (cmd?: string) => void;
  var AnkiDroidJS: {
    new (contract: { version: string; developer?: string }): AnkiDroidAPI;
    prototype: AnkiDroidAPI;
  };

  var KIKU:
    | ({
        aborter?: AbortController;
        dispose?: () => void;
        unload?: () => void;
        ankiDroidAPI?: AnkiDroidAPI;
        logger?: Logger;
        kikuCSSStyleSheet?: CSSStyleSheet;
        kikuCSSStyleSheetObserver?: MutationObserver;
        kikuPluginCSSStyleSheet?: CSSStyleSheet;
      } & CacheStore)
    | undefined;

  interface Window {
    renderErrorFallback?: (error: unknown) => void;
  }
}

export type CacheStore = {
  workerApi?: WorkerApi;
  kanjiInfo?: Map<string, KanjiInfo | undefined>;
};
