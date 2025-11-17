import { createContext, createEffect, useContext } from "solid-js";
import type { JSX } from "solid-js/jsx-runtime";
import { createStore } from "solid-js/store";
import { useSentenceField } from "#/util/hooks";
import { useAnkiField } from "./Context";

export type GroupStore = {
  sentenceField: string;
  pictureField: string;
  sentenceAudioField: string;
  index: number;
};

const FieldGroupContext = createContext<{
  group: GroupStore;
  setGroup: (group: GroupStore) => void;
  nextGroup: () => void;
  prevGroup: () => void;
  groupIds: Set<string>;
}>();

export function FieldGroupContextProvider(props: { children: JSX.Element }) {
  const { ankiFields } = useAnkiField();
  const sentenceField = useSentenceField();
  const pictureField = ankiFields.Picture;
  const sentenceAudioField = ankiFields.SentenceAudio;
  const [groupStore, setGroupStore] = createStore<GroupStore>({
    sentenceField: sentenceField(),
    pictureField,
    sentenceAudioField,
    index: 0,
  });

  const groupIds = new Set<string>();

  createEffect(() => {
    const tempDivSentenceField = document.createElement("div");
    tempDivSentenceField.innerHTML = sentenceField();
    const sentenceFieldWithGroup =
      tempDivSentenceField.querySelectorAll("[data-group-id]");
    sentenceFieldWithGroup.forEach((el) => {
      const id = (el as HTMLSpanElement).dataset.groupId;
      if (id) groupIds.add(id);
    });
    const sentenceFieldWithoutGroup = Array.from(
      tempDivSentenceField.childNodes,
    ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);
    const sentenceFieldWithoutGroupHtml = sentenceFieldWithoutGroup
      .map((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return (node as Element).outerHTML;
        }
        return node.textContent ?? "";
      })
      .join("");

    const tempDivPictureField = document.createElement("div");
    tempDivPictureField.innerHTML = pictureField;
    const pictureFieldWithGroup = tempDivPictureField.querySelectorAll("img");
    pictureFieldWithGroup.forEach((el, i) => {
      const id = (el as HTMLSpanElement).dataset.groupId;
      if (id) {
        groupIds.add(id);
      } else {
        const id = (i * -1).toString();
        el.dataset.groupId = id;
        groupIds.add(id);
      }
    });

    const tempDivSentenceAudioField = document.createElement("div");
    tempDivSentenceAudioField.innerHTML = sentenceAudioField;
    const sentenceAudioFieldWithGroup =
      tempDivSentenceAudioField.querySelectorAll("[data-group-id]");
    sentenceAudioFieldWithGroup.forEach((el) => {
      const id = (el as HTMLSpanElement).dataset.groupId;
      if (id) groupIds.add(id);
    });

    const sentenceAudioFieldWithoutGroup = Array.from(
      tempDivSentenceAudioField.childNodes,
    ).filter((el) => !(el as HTMLSpanElement).dataset?.groupId);
    const sentenceAudioFieldWithoutGroupHtml = sentenceAudioFieldWithoutGroup
      .map((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          return (node as Element).outerHTML;
        }
        return node.textContent ?? "";
      })
      .join("");

    if (groupIds.size > 0) {
      const sorted = Array.from(groupIds)
        .map((id) => Number(id))
        .sort((a, b) => b - a);
      const id = sorted[groupStore.index];
      let sentenceField: string | undefined;
      let pictureField: string | undefined;
      let sentenceAudioField: string | undefined;
      if (id > 0) {
        sentenceField = Array.from(sentenceFieldWithGroup).find(
          (el) => (el as HTMLSpanElement).dataset.groupId === id.toString(),
        )?.outerHTML;
        pictureField = Array.from(pictureFieldWithGroup).find((el) => {
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
      console.log(sentenceField, pictureField, sentenceAudioField);
      setGroupStore("sentenceField", sentenceField ?? "");
      setGroupStore("pictureField", pictureField ?? "");
      setGroupStore("sentenceAudioField", sentenceAudioField ?? "");
    }
  });

  function next() {
    setGroupStore("index", (prev) => {
      const newIndex = (prev + 1 + groupIds.size) % groupIds.size;
      return newIndex;
    });
  }

  function prev() {
    setGroupStore("index", (prev) => {
      const newIndex = (prev - 1 + groupIds.size) % groupIds.size;
      return newIndex;
    });
  }

  return (
    <FieldGroupContext.Provider
      value={{
        group: groupStore,
        setGroup: setGroupStore,
        nextGroup: next,
        prevGroup: prev,
        groupIds,
      }}
    >
      {props.children}
    </FieldGroupContext.Provider>
  );
}

export function useFieldGroup() {
  const fieldGroup = useContext(FieldGroupContext);
  if (!fieldGroup) throw new Error("Missing FieldGroupContext");
  return fieldGroup;
}
