import { parseHtml, nodesToString } from "#/src/lib/dom";
import { random } from "#/src/lib/es";
import type { AnkiNote } from "#/src/lib/types";

export type ContextField = {
  noteId?: number;
  Sentence: string;
  SentenceTranslation: string;
  SentenceFurigana: string;
  SentenceAudio: string;
  MiscInfo: string;
  Picture: string;
};

/** Concatenates two ContextField values, sorting grouped HTML elements so newer group-ids appear first */
export function mergeContext(base: ContextField, extra: ContextField): ContextField {
  const normalizedBase = normalizeFields(base);
  const normalizedExtra = normalizeFields(extra);

  // if one of them is empty, delete both
  const getSentenceFurigana = () => {
    if (!normalizedBase.SentenceFurigana || !normalizedExtra.SentenceFurigana) return "";
    return normalizedBase.SentenceFurigana + normalizedExtra.SentenceFurigana;
  };

  const merged = {
    Sentence: normalizedBase.Sentence + normalizedExtra.Sentence,
    SentenceTranslation: normalizedBase.SentenceTranslation + normalizedExtra.SentenceTranslation,
    SentenceFurigana: getSentenceFurigana(),
    SentenceAudio: normalizedBase.SentenceAudio + normalizedExtra.SentenceAudio,
    MiscInfo: normalizedBase.MiscInfo + normalizedExtra.MiscInfo,
    Picture: normalizedBase.Picture + normalizedExtra.Picture,
  };

  const doc = {
    sentence: parseHtml(merged.Sentence),
    sentenceTranslation: parseHtml(merged.SentenceTranslation),
    sentenceFurigana: parseHtml(merged.SentenceFurigana),
    sentenceAudio: parseHtml(merged.SentenceAudio),
    miscInfo: parseHtml(merged.MiscInfo),
    picture: parseHtml(merged.Picture),
  };

  const withGroup = {
    sentence: doc.sentence.querySelectorAll("[data-group-id]"),
    sentenceTranslation: doc.sentenceTranslation.querySelectorAll("[data-group-id]"),
    sentenceFurigana: doc.sentenceFurigana.querySelectorAll("[data-group-id]"),
    sentenceAudio: doc.sentenceAudio.querySelectorAll("[data-group-id]"),
    miscInfo: doc.miscInfo.querySelectorAll("[data-group-id]"),
    picture: doc.picture.querySelectorAll("img[data-group-id]"),
  };

  function sortGroup(items: NodeListOf<Element>) {
    return Array.from(items).sort((a, b) => {
      const aId = Number((a as HTMLSpanElement).dataset.groupId);
      const bId = Number((b as HTMLSpanElement).dataset.groupId);

      // "unindexed" ids will be NaN
      const aIsNaN = Number.isNaN(aId);
      const bIsNaN = Number.isNaN(bId);

      if (aIsNaN && !bIsNaN) {
        return 1;
      } else if (!aIsNaN && bIsNaN) {
        return -1;
      } else if (aIsNaN && bIsNaN) {
        return 0;
      }
      return bId - aId;
    });
  }

  merged.Sentence = nodesToString(sortGroup(withGroup.sentence));
  merged.SentenceTranslation = nodesToString(sortGroup(withGroup.sentenceTranslation));
  merged.SentenceFurigana = nodesToString(sortGroup(withGroup.sentenceFurigana));
  merged.SentenceAudio = nodesToString(sortGroup(withGroup.sentenceAudio));
  merged.MiscInfo = nodesToString(sortGroup(withGroup.miscInfo));
  merged.Picture = nodesToString(sortGroup(withGroup.picture));

  return merged;
}

/** Assigns a `data-group-id` to ungrouped content so duplicates can be detected and removed during merge */
export function normalizeFields(fields: ContextField): ContextField {
  const newId = fields.noteId ?? Date.now() + random(0, 1000);

  const doc = {
    sentence: parseHtml(fields.Sentence),
    sentenceTranslation: parseHtml(fields.SentenceTranslation),
    sentenceFurigana: parseHtml(fields.SentenceFurigana),
    sentenceAudio: parseHtml(fields.SentenceAudio),
    miscInfo: parseHtml(fields.MiscInfo),
    picture: parseHtml(fields.Picture),
  };

  const withGroup = {
    sentence: Array.from(doc.sentence.querySelectorAll("[data-group-id]")),
    sentenceTranslation: Array.from(doc.sentenceTranslation.querySelectorAll("[data-group-id]")),
    sentenceFurigana: Array.from(doc.sentenceFurigana.querySelectorAll("[data-group-id]")),
    sentenceAudio: Array.from(doc.sentenceAudio.querySelectorAll("[data-group-id]")),
    miscInfo: Array.from(doc.miscInfo.querySelectorAll("[data-group-id]")),
    picture: Array.from(doc.picture.querySelectorAll("img[data-group-id]")),
  };

  //oxfmt-ignore
  const withoutGroup = {
    sentence: Array.from(doc.sentence.body.childNodes).filter((el) => !(el as HTMLSpanElement).dataset?.groupId,),
    sentenceTranslation: Array.from(doc.sentenceTranslation.body.childNodes).filter((el) => !(el as HTMLSpanElement).dataset?.groupId,),
    sentenceFurigana: Array.from(doc.sentenceFurigana.body.childNodes).filter((el) => !(el as HTMLSpanElement).dataset?.groupId,),
    sentenceAudio: Array.from(doc.sentenceAudio.body.childNodes).filter((el) => !(el as HTMLSpanElement).dataset?.groupId,),
    miscInfo: Array.from(doc.miscInfo.body.childNodes).filter((el) => !(el as HTMLSpanElement).dataset?.groupId,),
    picture: Array.from(doc.picture.querySelectorAll("img:not([data-group-id])")),
  };

  function wrapInSpan(nodes: ChildNode[]) {
    if (!nodes.length) return "";
    const span = document.createElement("span");
    span.dataset.groupId = newId.toString();
    span.append(...nodes);
    return span.outerHTML;
  }

  function assignId(nodes: ChildNode[]) {
    nodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        el.setAttribute("data-group-id", newId.toString());
      }
    });
    return nodes;
  }

  const Sentence = nodesToString(withGroup.sentence) + wrapInSpan(withoutGroup.sentence);
  const SentenceTranslation =
    nodesToString(withGroup.sentenceTranslation) + wrapInSpan(withoutGroup.sentenceTranslation);
  const SentenceFurigana =
    nodesToString(withGroup.sentenceFurigana) + wrapInSpan(withoutGroup.sentenceFurigana);
  const SentenceAudio =
    nodesToString(withGroup.sentenceAudio) + wrapInSpan(withoutGroup.sentenceAudio);
  const MiscInfo = nodesToString(withGroup.miscInfo) + wrapInSpan(withoutGroup.miscInfo);
  const Picture = nodesToString(withGroup.picture) + nodesToString(assignId(withoutGroup.picture));

  return {
    Sentence,
    SentenceTranslation,
    SentenceFurigana,
    SentenceAudio,
    MiscInfo,
    Picture,
  };
}

/** Parses merged HTML fields into human-readable text grouped by `data-group-id`, reporting any duplicates */
export function parseMergedIntoReadable(fields: ContextField) {
  function extractGroupedText(
    field: string,
    selector: string,
    value: (node: Element) => string | undefined | null,
  ) {
    const doc = parseHtml(field);
    const seen = new Set<string>();
    const duplicates = new Set<string>();

    const lines = Array.from(doc.querySelectorAll(selector))
      .map((node) => {
        const groupId = node.getAttribute("data-group-id");
        if (!groupId) return null;
        // Don't check for duplicate if it's unindexed
        if (groupId != "unindexed") {
          if (seen.has(groupId)) duplicates.add(groupId);
          else seen.add(groupId);
        }
        return `${groupId}: ${value(node)}`;
      })
      .filter(Boolean) as string[];

    return {
      text: lines.join("\n"),
      duplicates: Array.from(duplicates),
    };
  }

  // oxfmt-ignore
  const result = {
    sentence: extractGroupedText(fields.Sentence, "[data-group-id]", (n) => n.textContent),
    sentenceTranslation: extractGroupedText(fields.SentenceTranslation, "[data-group-id]", (n) => n.textContent,),
    sentenceFurigana: extractGroupedText(fields.SentenceFurigana, "[data-group-id]", (n) => n.textContent,),
    sentenceAudio: extractGroupedText(fields.SentenceAudio, "[data-group-id]", (n) => n.textContent,),
    miscInfo: extractGroupedText(fields.MiscInfo, "[data-group-id]", (n) => n.textContent),
    picture: extractGroupedText(fields.Picture, "img[data-group-id]", (n) => n.getAttribute("src")),
  };
  const { sentence, sentenceTranslation, sentenceFurigana, sentenceAudio, miscInfo, picture } =
    result;

  return {
    Sentence: sentence.text,
    SentenceTranslation: sentenceTranslation.text,
    SentenceFurigana: sentenceFurigana.text,
    SentenceAudio: sentenceAudio.text,
    MiscInfo: miscInfo.text,
    Picture: picture.text,

    duplicates: {
      Sentence: sentence.duplicates,
      SentenceTranslation: sentenceTranslation.duplicates,
      SentenceFurigana: sentenceFurigana.duplicates,
      SentenceAudio: sentenceAudio.duplicates,
      MiscInfo: miscInfo.duplicates,
      Picture: picture.duplicates,
    },
  };
}

/** Maps an AnkiNote's relevant fields into the ContextField shape used for merging */
export function toContextField(note: AnkiNote | undefined): ContextField {
  return {
    noteId: note?.noteId,
    Sentence: note?.fields.Sentence?.value ?? "",
    SentenceTranslation: note?.fields.SentenceTranslation?.value ?? "",
    SentenceFurigana: note?.fields.SentenceFurigana?.value ?? "",
    SentenceAudio: note?.fields.SentenceAudio?.value ?? "",
    MiscInfo: note?.fields.MiscInfo?.value ?? "",
    Picture: note?.fields.Picture?.value ?? "",
  };
}

/** Removes system tags ("leech", "marked", "potential_leech") unless they belong to the target note */
export function filterTags(tags: string[], targetTags: string[]): string[] {
  const unwantedTags = ["leech", "marked", "potential_leech"];
  return tags.filter((tag) => targetTags.includes(tag) || !unwantedTags.includes(tag));
}

/** Strips internal Anki fields (furigana:/kana:/kanji: variants, Tags, CardID, __IS_ROOT__) from the update payload */
export function removeAnkiInternalFields(fields: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([key]) =>
        !key.startsWith("furigana:") &&
        !key.startsWith("kana:") &&
        !key.startsWith("kanji:") &&
        key !== "Tags" &&
        key !== "CardID" &&
        key !== "__IS_ROOT__",
    ),
  );
}
