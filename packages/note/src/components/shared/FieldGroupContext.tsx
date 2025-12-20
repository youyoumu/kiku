import { createContext, createEffect, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore, type SetStoreFunction, type Store } from "solid-js/store";
import type { AnkiFields, AnkiFrontFields } from "#/types";
import { parseHtml } from "#/util/general";
import { useAnkiFieldContext } from "./AnkiFieldsContext";
import { useCardContext } from "./CardContext";

export type GroupStore = {
  sentenceField: string;
  pictureField: string;
  sentenceAudioField: string;
  index: number;
  ids: string[];
};

const FieldGroupContext = createContext<{
  $group: Store<GroupStore>;
  $setGroup: SetStoreFunction<GroupStore>;
  $next: () => void;
  $prev: () => void;
  ankiFields: AnkiFields | AnkiFrontFields;
}>();

function nodesToString(nodes: Node[]) {
  return nodes
    .map((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        return (node as Element).outerHTML;
      }
      return node.textContent ?? "";
    })
    .join("");
}

export function FieldGroupContextProvider(props: { children: JSX.Element }) {
  const { ankiFields } = useAnkiFieldContext();
  const [$card] = useCardContext();

  const sentenceField = () => {
    if ($card.side === "front") {
      return ankiFields["kanji:Sentence"];
    }
    if ($card.nested) return ankiFields.Sentence;
    return ankiFields["furigana:SentenceFurigana"]
      ? ankiFields["furigana:SentenceFurigana"]
      : ankiFields["kanji:Sentence"];
  };
  const pictureField = ankiFields.Picture;
  const sentenceAudioField = ankiFields.SentenceAudio;
  const [$group, $setGroup] = createStore<GroupStore>({
    sentenceField: sentenceField(),
    pictureField,
    sentenceAudioField,
    index: 0,
    ids: [],
  });
  const ids = new Set<string>();
  const addIds = (id: string | undefined) => {
    if (id) ids.add(id);
    $setGroup("ids", Array.from(ids));
  };

  createEffect(() => {
    const sentenceFieldDoc = parseHtml(sentenceField());
    const sentenceFieldWithGroup =
      sentenceFieldDoc.querySelectorAll("[data-group-id]");
    sentenceFieldWithGroup.forEach((el) => {
      const id = (el as HTMLSpanElement).dataset.groupId;
      addIds(id);
    });

    const sentenceFieldWithoutGroup = Array.from(
      sentenceFieldDoc.body.childNodes,
    ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);
    const sentenceFieldWithoutGroupHtml = nodesToString(
      sentenceFieldWithoutGroup,
    );

    // each img has their own separate page. img without group id will be given group id <= 0
    const pictureFieldDoc = parseHtml(pictureField);
    const pictureFieldWithGroup = pictureFieldDoc.querySelectorAll("img");
    pictureFieldWithGroup.forEach((el, i) => {
      let id = (el as HTMLSpanElement).dataset.groupId;
      if (!id) {
        id = (i * -1).toString();
        el.dataset.groupId = id;
      }
      addIds(id);
    });

    const sentenceAudioFieldDoc = parseHtml(sentenceAudioField);
    const sentenceAudioFieldWithGroup =
      sentenceAudioFieldDoc.querySelectorAll("[data-group-id]");
    sentenceAudioFieldWithGroup.forEach((el) => {
      const id = (el as HTMLSpanElement).dataset.groupId;
      addIds(id);
    });

    const sentenceAudioFieldWithoutGroup = Array.from(
      sentenceAudioFieldDoc.body.childNodes,
    ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);
    const sentenceAudioFieldWithoutGroupHtml = nodesToString(
      sentenceAudioFieldWithoutGroup,
    );

    // create img with no src if ungrouped fields has no img
    let dummyImg: HTMLImageElement | undefined;
    if (
      !Array.from($group.ids)
        .map(Number)
        .some((id) => id <= 0) &&
      (sentenceFieldWithoutGroupHtml.trim() ||
        sentenceAudioFieldWithoutGroupHtml.trim())
    ) {
      const img = document.createElement("img");
      img.dataset.groupId = "0";
      dummyImg = img;
      addIds("0");
    }

    if ($group.ids.length > 0) {
      const sorted = $group.ids.map((id) => Number(id)).sort((a, b) => b - a);
      const id = sorted[$group.index];
      let sentenceField: string | undefined;
      let pictureField: string | undefined;
      let sentenceAudioField: string | undefined;
      if (id > 0) {
        sentenceField = Array.from(sentenceFieldWithGroup).find(
          (el) => (el as HTMLSpanElement).dataset.groupId === id.toString(),
        )?.outerHTML;

        const pictureFieldArray = Array.from(pictureFieldWithGroup);
        if (dummyImg) pictureFieldArray.push(dummyImg);
        pictureField = pictureFieldArray.find((el) => {
          return (el as HTMLSpanElement).dataset.groupId === id.toString();
        })?.outerHTML;
        sentenceAudioField = Array.from(sentenceAudioFieldWithGroup).find(
          (el) => (el as HTMLSpanElement).dataset.groupId === id.toString(),
        )?.outerHTML;
      } else {
        sentenceField = sentenceFieldWithoutGroupHtml;
        pictureField = Array.from(pictureFieldWithGroup).find((el) => {
          return (el as HTMLSpanElement).dataset.groupId === id.toString();
        })?.outerHTML;
        sentenceAudioField = sentenceAudioFieldWithoutGroupHtml;
      }
      $setGroup("sentenceField", sentenceField ?? "");
      $setGroup("pictureField", pictureField ?? "");
      $setGroup("sentenceAudioField", sentenceAudioField ?? "");

      KIKU_STATE.logger.info("[Groups] sentenceField:", sentenceField);
      KIKU_STATE.logger.info("[Groups] pictureField:", pictureField);
      KIKU_STATE.logger.info(
        "[Groups] sentenceAudioField:",
        sentenceAudioField,
      );
    }
  });

  function $next() {
    $setGroup("index", (prev) => {
      const newIndex = (prev + 1 + $group.ids.length) % $group.ids.length;
      return newIndex;
    });
  }

  function $prev() {
    $setGroup("index", (prev) => {
      const newIndex = (prev - 1 + $group.ids.length) % $group.ids.length;
      return newIndex;
    });
  }

  return (
    <FieldGroupContext.Provider
      value={{
        $group,
        $setGroup,
        $next,
        $prev,
        ankiFields,
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

const RootFieldGroupConext = createContext<{
  $group: Store<GroupStore>;
  $setGroup: SetStoreFunction<GroupStore>;
  $next: () => void;
  $prev: () => void;
  ankiFields: AnkiFields | AnkiFrontFields;
}>();

export function RootFieldGroupContextProvider(props: {
  children: JSX.Element;
}) {
  const value = useFieldGroupContext();

  return (
    <RootFieldGroupConext.Provider value={value}>
      {props.children}
    </RootFieldGroupConext.Provider>
  );
}

export function useRootFieldGroupContext() {
  const fieldGroup = useContext(RootFieldGroupConext);
  if (!fieldGroup) throw new Error("Missing RootFieldGroupContext");
  return fieldGroup;
}
