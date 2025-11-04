import { createSignal } from "solid-js";
import type { AnkiFrontFields } from "../types";
import { useAnkiField, useConfig } from "./Context";
import { Layout } from "./Layout";
import { NotePlayIcon } from "./NotePlayIcon";

export function Front() {
  let expressionAudioRef: HTMLDivElement | undefined;
  let sentenceAudioRef: HTMLDivElement | undefined;

  const [config] = useConfig();
  const ankiFields = useAnkiField() as AnkiFrontFields;
  const [clicked, setClicked] = createSignal(false);

  const hiddenStyle = {
    position: "absolute",
    width: "0",
    height: "0",
    overflow: "hidden",
  } as const;

  return (
    <Layout>
      <div class="flex justify-end flex-row">
        <div class="flex gap-2 items-center relative hover:[&_>_#frequency]:block h-5 text-secondary-content/50"></div>
      </div>

      <div
        class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
        on:click={() => setClicked((prev) => !prev)}
      >
        <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
          <div
            class={`${config.fontSizeBaseExpression} ${config.fontSizeSmExpression}`}
            classList={{
              "border-b-2 border-dotted border-base-content/50":
                !!ankiFields.IsClickCard,
            }}
            innerHTML={
              !ankiFields.IsSentenceCard && !ankiFields.IsAudioCard
                ? ankiFields.Expression
                : "?"
            }
          ></div>
        </div>
      </div>

      {(ankiFields.IsAudioCard ||
        ankiFields.IsSentenceCard ||
        ankiFields.IsWordAndSentenceCard ||
        (ankiFields.IsClickCard && clicked())) && (
        <div class="flex flex-col gap-4 items-center text-center">
          <div
            class={`[&_b]:text-base-content-primary ${config.fontSizeBaseSentence} ${config.fontSizeSmSentence}`}
            innerHTML={ankiFields["kanji:Sentence"]}
          ></div>
        </div>
      )}

      {ankiFields.IsAudioCard && (
        <div class="flex gap-4 justify-center">
          <div
            style={hiddenStyle}
            ref={expressionAudioRef}
            innerHTML={ankiFields.ExpressionAudio}
          ></div>
          <div
            style={hiddenStyle}
            ref={sentenceAudioRef}
            innerHTML={ankiFields.SentenceAudio}
          ></div>
          <NotePlayIcon
            on:click={() => {
              expressionAudioRef?.querySelector("a")?.click();
            }}
          ></NotePlayIcon>
          <NotePlayIcon
            on:click={() => {
              sentenceAudioRef?.querySelector("a")?.click();
            }}
          ></NotePlayIcon>
        </div>
      )}

      {ankiFields.Hint && (
        <div
          class={`flex gap-2 items-center justify-center text-center border-t-1 ${config.fontSizeBaseHint} ${config.fontSizeSmHint}`}
        >
          <div innerHTML={ankiFields.Hint}></div>
        </div>
      )}
    </Layout>
  );
}
