import { createEffect, createSignal, onMount } from "solid-js";
import { useAnkiField } from "../shared/Context";

export function SentenceBack() {
  let sentenceEl: HTMLDivElement | undefined;
  const { ankiFields } = useAnkiField<"back">();
  const [sentences, setSentences] = createSignal<HTMLSpanElement[]>([]);

  onMount(() => {
    if (sentenceEl) {
      const ruby = sentenceEl.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }

    if (sentenceEl) {
      const spans = Array.from(sentenceEl.querySelectorAll("span")).filter(
        (el) => el.parentNode === sentenceEl,
      );
      spans.forEach((span, index) => {
        span.dataset.index = index.toString();
      });
      setSentences(spans);
    }
  });

  createEffect(() => {
    //TODO: props
    // const sentencesIndex = props.sentenceIndex?.(sentences().length);
    // if (typeof sentencesIndex === "number") {
    //   sentences().forEach((span) => {
    //     span.style.display =
    //       span.dataset.index === sentencesIndex.toString() ? "block" : "none";
    //   });
    // }
  });

  return (
    <div
      class={`[&_b]:text-base-content-primary sentence font-secondary flex-1`}
      ref={sentenceEl}
      innerHTML={
        ankiFields["furigana:SentenceFurigana"]
          ? ankiFields["furigana:SentenceFurigana"]
          : ankiFields["kanji:Sentence"]
      }
    ></div>
  );
}
