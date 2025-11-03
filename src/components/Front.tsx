import { createSignal } from "solid-js";
import type { AnkiFrontFields } from "../types";
import { Layout } from "./Layout";
import { NotePlayIcon } from "./NotePlayIcon";

export function Front(props: { ankiFields: AnkiFrontFields }) {
  let expressionAudioRef: HTMLDivElement | undefined;
  let sentenceAudioRef: HTMLDivElement | undefined;
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
            class="text-5xl sm:text-6xl"
            classList={{
              "border-b-2 border-dotted border-base-content/50":
                !!props.ankiFields.IsClickCard,
            }}
            innerHTML={
              !props.ankiFields.IsSentenceCard && !props.ankiFields.IsAudioCard
                ? props.ankiFields.Expression
                : "?"
            }
          ></div>
        </div>
      </div>

      {(props.ankiFields.IsAudioCard ||
        props.ankiFields.IsSentenceCard ||
        props.ankiFields.IsWordAndSentenceCard ||
        (props.ankiFields.IsClickCard && clicked())) && (
        <div class="flex flex-col gap-4 items-center text-center">
          <div
            class="text-2xl sm:text-4xl [&_b]:text-primary"
            innerHTML={props.ankiFields["kanji:Sentence"]}
          ></div>
        </div>
      )}

      {props.ankiFields.IsAudioCard && (
        <div class="flex gap-4 justify-center">
          <div
            style={hiddenStyle}
            ref={expressionAudioRef}
            innerHTML={props.ankiFields.ExpressionAudio}
          ></div>
          <div
            style={hiddenStyle}
            ref={sentenceAudioRef}
            innerHTML={props.ankiFields.SentenceAudio}
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
    </Layout>
  );
}
