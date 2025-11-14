import { createEffect, createSignal, onMount } from "solid-js";
import { useAnkiField, useCardStore } from "#/components/shared/Context";

export function useSentenceField() {
  const [card] = useCardStore();
  const [sentences, setSentences] = createSignal<HTMLSpanElement[]>([]);

  onMount(() => {
    if (card.sentenceFieldRef) {
      const ruby = card.sentenceFieldRef.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }

    if (card.sentenceFieldRef) {
      const spans = Array.from(
        card.sentenceFieldRef.querySelectorAll("span"),
      ).filter((el) => el.parentNode === card.sentenceFieldRef);
      spans.forEach((span, index) => {
        span.dataset.index = index.toString();
      });
      KIKU_STATE.logger.info(
        "Number of detected spans on sentence:",
        spans.length,
      );
      setSentences(spans);
    }
  });

  createEffect(() => {
    const sentencesIndex =
      card.pictures.length > 1 ? card.pictureIndex : undefined;
    if (typeof sentencesIndex === "number") {
      sentences().forEach((span) => {
        span.style.display =
          span.dataset.index === sentencesIndex.toString() ? "block" : "none";
      });
    }
  });

  return [sentences, setSentences] as const;
}

export function usePictureField() {
  const [card, setCard] = useCardStore();
  const { ankiFields } = useAnkiField();
  onMount(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = ankiFields.Picture;
    const imgs = Array.from(tempDiv.querySelectorAll("img"));
    imgs.forEach((img) => {
      img.dataset.index = imgs.indexOf(img).toString();
    });
    setCard("pictures", imgs);
    if (card.pictureFieldRef) {
      card.pictureFieldRef.replaceChildren(...imgs);
    }
    KIKU_STATE.logger.info("Number of detected picture:", imgs.length);
  });
}
