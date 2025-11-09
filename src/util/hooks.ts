import { createEffect, createSignal, onMount } from "solid-js";
import { useCardStore } from "#/components/shared/Context";

export const useSentenceField = () => {
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
};
