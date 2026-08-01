import { createContext, createEffect, createMemo, createSignal, on, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { applyBoldFormatting, nodesToString, parseHtml } from "#/src/lib/dom";
import { useAnkiFieldContext } from "./AnkiFieldsContext";
import { useCardContext } from "./CardContext";
import { useGeneralContext } from "./GeneralContext";
import { isServer } from "solid-js/web";

export type GroupData = {
  sentenceField: string;
  sentenceTranslationField: string;
  pictureField: string;
  sentenceAudioField: string;
  miscInfoField: string;
  ids: string[];
};

const FieldGroupContext = createContext<{
  $group: () => GroupData;
  $index: () => number;
  $next: () => boolean;
  $prev: () => boolean;
}>();

export function FieldGroupContextProvider(props: { children: JSX.Element }) {
  const { $ankiFields, $isRootAnkiFields } = useAnkiFieldContext();
  const { $initialSide } = useCardContext();
  const { logger } = useGeneralContext();

  const $sentenceField = createMemo(() => {
    if (!$isRootAnkiFields()) return $ankiFields.Sentence;
    if ($initialSide() === "front") return $ankiFields["kanji:Sentence"];

    if ($ankiFields["furigana:SentenceFurigana"]) {
      return applyBoldFormatting(
        $ankiFields["kanji:Sentence"],
        $ankiFields["furigana:SentenceFurigana"],
      );
    }

    return $ankiFields["kanji:Sentence"];
  });
  const $sentenceTranslationField = createMemo(() => $ankiFields.SentenceTranslation);
  const $pictureField = createMemo(() => $ankiFields.Picture);
  const $sentenceAudioField = createMemo(() => $ankiFields.SentenceAudio);
  const $miscInfoField = createMemo(() => $ankiFields.MiscInfo);

  const [$index, $setIndex] = createSignal(0);

  const $defaultGroup = createMemo(() => ({
    sentenceField: $sentenceField(),
    sentenceTranslationField: $sentenceTranslationField(),
    pictureField: $pictureField(),
    sentenceAudioField: $sentenceAudioField(),
    miscInfoField: $miscInfoField(),
    ids: [],
  }));

  const $group = createMemo((): GroupData => {
    if (isServer) return $defaultGroup();
    const ids = new Set<string>();
    const addId = (id: string | undefined) => {
      if (id) ids.add(id);
    };

    logger.info(
      "[Groups] parsing fields for expression:",
      $ankiFields.Expression,
      "side:",
      $initialSide(),
    );

    // unindexed group will be assigned negative index
    // the n-th unindexed group of each fields will have index -n
    //
    // each fields should have the same amount of unindexed group
    // you can't have
    // field 1: <unindexed 1> <unindexed2> <unindexed3>
    // field 2: <unindexed 1> <unindexed3>
    // because there would be no way to know that it's the group 3
    // though it should be fine if there's one field with more fields, but in the same order
    let indexOfNextUnindexedGroup = -1;
    const sentenceFieldDoc = parseHtml($sentenceField());
    const sentenceFieldWithGroup = sentenceFieldDoc.querySelectorAll("[data-group-id]");
    sentenceFieldWithGroup.forEach((el) => {
      if ((el as HTMLElement).dataset.groupId == "unindexed") {
        (el as HTMLElement).dataset.groupId = indexOfNextUnindexedGroup.toString();
        indexOfNextUnindexedGroup -= 1;
      }
      addId((el as HTMLElement).dataset.groupId);
    });

    const sentenceFieldWithoutGroup = Array.from(sentenceFieldDoc.body.childNodes).filter(
      (el) => !(el as HTMLElement).dataset?.groupId,
    );
    const sentenceFieldWithoutGroupHtml = nodesToString(sentenceFieldWithoutGroup);

    indexOfNextUnindexedGroup = -1;
    const sentenceTranslationFieldDoc = parseHtml($sentenceTranslationField());
    const sentenceTranslationFieldWithGroup =
      sentenceTranslationFieldDoc.querySelectorAll("[data-group-id]");
    sentenceTranslationFieldWithGroup.forEach((el) => {
      if ((el as HTMLElement).dataset.groupId == "unindexed") {
        (el as HTMLElement).dataset.groupId = indexOfNextUnindexedGroup.toString();
        indexOfNextUnindexedGroup -= 1;
      }
      addId((el as HTMLElement).dataset.groupId);
    });

    const sentenceTranslationFieldWithoutGroup = Array.from(
      sentenceTranslationFieldDoc.body.childNodes,
    ).filter((el) => !(el as HTMLElement).dataset?.groupId);
    const sentenceTranslationFieldWithoutGroupHtml = nodesToString(
      sentenceTranslationFieldWithoutGroup,
    );

    indexOfNextUnindexedGroup = -1;
    const sentenceAudioFieldDoc = parseHtml($sentenceAudioField());
    const sentenceAudioFieldWithGroup = sentenceAudioFieldDoc.querySelectorAll("[data-group-id]");
    sentenceAudioFieldWithGroup.forEach((el) => {
      if ((el as HTMLElement).dataset.groupId == "unindexed") {
        (el as HTMLElement).dataset.groupId = indexOfNextUnindexedGroup.toString();
        indexOfNextUnindexedGroup -= 1;
      }
      addId((el as HTMLElement).dataset.groupId);
    });

    const sentenceAudioFieldWithoutGroup = Array.from(sentenceAudioFieldDoc.body.childNodes).filter(
      (el) => !(el as HTMLElement).dataset?.groupId,
    );
    const sentenceAudioFieldWithoutGroupHtml = nodesToString(sentenceAudioFieldWithoutGroup);

    indexOfNextUnindexedGroup = -1;
    const miscInfoFieldDoc = parseHtml($miscInfoField());
    const miscInfoFieldWithGroup = miscInfoFieldDoc.querySelectorAll("[data-group-id]");
    miscInfoFieldWithGroup.forEach((el) => {
      if ((el as HTMLElement).dataset.groupId == "unindexed") {
        (el as HTMLElement).dataset.groupId = indexOfNextUnindexedGroup.toString();
        indexOfNextUnindexedGroup -= 1;
      }
      addId((el as HTMLElement).dataset.groupId);
    });

    const miscInfoFieldWithoutGroup = Array.from(miscInfoFieldDoc.body.childNodes).filter(
      (el) => !(el as HTMLElement).dataset?.groupId,
    );
    const miscInfoFieldWithoutGroupHtml = nodesToString(miscInfoFieldWithoutGroup);

    // each group may contain multiple img. img without group id will be given group id 0
    indexOfNextUnindexedGroup = -1;
    const pictureFieldDoc = parseHtml($pictureField());
    const pictureFieldWithGroup = pictureFieldDoc.querySelectorAll("img");
    pictureFieldWithGroup.forEach((el) => {
      let id = (el as HTMLElement).dataset.groupId;
      if (!id) {
        id = "0";
        el.dataset.groupId = id;
      } else if (id == "unindexed") {
        id = indexOfNextUnindexedGroup.toString();
        el.dataset.groupId = id;
        indexOfNextUnindexedGroup -= 1;
      }
      addId(id);
    });

    // create img with no src if ungrouped fields has no img
    let dummyImg: HTMLImageElement | undefined;
    if (
      !Array.from(ids)
        .map(Number)
        .some((id) => id == 0) &&
      (sentenceFieldWithoutGroupHtml.trim() ||
        sentenceTranslationFieldWithoutGroupHtml.trim() ||
        sentenceAudioFieldWithoutGroupHtml.trim() ||
        miscInfoFieldWithoutGroupHtml.trim())
    ) {
      const img = document.createElement("img");
      img.dataset.groupId = "0";
      dummyImg = img;
      addId("0");
    }

    const idsArray = Array.from(ids);
    if (idsArray.length === 0) return $defaultGroup();

    const sorted = idsArray.map((id) => Number(id)).sort((a, b) => {
      // so that the ungrouped one is always last
      if (b == 0) {
        return -1;
      } else if (a == 0) {
        return 1;
      } else {
        // positive indexed group will be first, negative "unindexed" will come after
        return b - a;
      }
    });
    const index = $index();
    const selectedId = sorted[index] ?? sorted[0];
    logger.info("[Groups] selected:", {
      count: sorted.length,
      index,
      groupId: selectedId,
      ids: sorted,
    });

    const filterById = (nodes: Iterable<Node> | ArrayLike<Node>) =>
      Array.from(nodes)
        .filter((el) => (el as HTMLElement).dataset?.groupId === selectedId.toString())
        .map((el) => (el as HTMLElement).outerHTML)
        .join("");

    let sentenceField: string | undefined;
    let sentenceTranslationField: string | undefined;
    let sentenceAudioField: string | undefined;
    let miscInfoField: string | undefined;
    let pictureField: string | undefined;

    if (selectedId != 0) {
      sentenceField = filterById(sentenceFieldWithGroup);
      sentenceTranslationField = filterById(sentenceTranslationFieldWithGroup);
      sentenceAudioField = filterById(sentenceAudioFieldWithGroup);
      miscInfoField = filterById(miscInfoFieldWithGroup);

      const pictureFieldArray = Array.from(pictureFieldWithGroup);
      if (dummyImg) pictureFieldArray.push(dummyImg);
      pictureField = filterById(pictureFieldArray);
    } else {
      sentenceField = sentenceFieldWithoutGroupHtml;
      sentenceTranslationField = sentenceTranslationFieldWithoutGroupHtml;
      sentenceAudioField = sentenceAudioFieldWithoutGroupHtml;
      miscInfoField = miscInfoFieldWithoutGroupHtml;

      const pictureFieldArray = Array.from(pictureFieldWithGroup);
      if (dummyImg) pictureFieldArray.push(dummyImg);
      pictureField = filterById(pictureFieldArray);
    }

    logger.info("[Groups] sentenceField:", sentenceField);
    logger.info("[Groups] sentenceTranslationField:", sentenceTranslationField);
    logger.info("[Groups] sentenceAudioField:", sentenceAudioField);
    logger.info("[Groups] miscInfoField:", miscInfoField);
    logger.info("[Groups] pictureField:", pictureField);

    return {
      sentenceField: sentenceField ?? "",
      sentenceTranslationField: sentenceTranslationField ?? "",
      sentenceAudioField: sentenceAudioField ?? "",
      miscInfoField: miscInfoField ?? "",
      pictureField: pictureField ?? "",
      ids: idsArray,
    };
  });

  function $next() {
    let changed = false;
    $setIndex((prev) => {
      const newIndex = (prev + 1 + $group().ids.length) % $group().ids.length;
      if (newIndex !== prev) changed = true;
      return newIndex;
    });
    return changed;
  }

  function $prev() {
    let changed = false;
    $setIndex((prev) => {
      const newIndex = (prev - 1 + $group().ids.length) % $group().ids.length;
      if (newIndex !== prev) changed = true;
      return newIndex;
    });
    return changed;
  }

  createEffect(
    on(
      () => $ankiFields.CardID,
      () => $setIndex(0),
      { defer: true },
    ),
  );

  return (
    <FieldGroupContext.Provider
      value={{
        $group,
        $index,
        $next,
        $prev,
      }}
    >
      {props.children}
    </FieldGroupContext.Provider>
  );
}

export function useFieldGroupContext() {
  const fieldGroup = useContext(FieldGroupContext);
  if (!fieldGroup) throw new Error("Missing FieldGroupContext");
  return fieldGroup;
}
