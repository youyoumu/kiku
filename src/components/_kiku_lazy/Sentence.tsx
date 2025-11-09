import { createEffect, createSignal, onMount } from "solid-js";
import { useAnkiField, useCardStore } from "../shared/Context";

export function SentenceBack() {
  const { ankiFields } = useAnkiField<"back">();
  const [card, setCard] = useCardStore();
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

  return (
    <div
      class={`[&_b]:text-base-content-primary sentence font-secondary flex-1`}
      ref={(ref) => setCard("sentenceFieldRef", ref)}
      innerHTML={
        ankiFields["furigana:SentenceFurigana"]
          ? ankiFields["furigana:SentenceFurigana"]
          : ankiFields["kanji:Sentence"]
      }
    ></div>
  );
}
