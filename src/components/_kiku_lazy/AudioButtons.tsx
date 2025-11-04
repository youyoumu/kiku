import type { Signal } from "solid-js";
import type { AnkiBackFields } from "#/types";
import { isMobile } from "#/util/general";
import { useAnkiField } from "../shared/Context";
import { PlayIcon } from "./Icons";

export function NotePlayIcon(props: { "on:click"?: () => void }) {
  return (
    <PlayIcon
      class="bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer"
      on:click={props["on:click"]}
    />
  );
}

export default function BackPlayButton(props: {
  expressionAudioRefSignal: Signal<HTMLDivElement | undefined>;
  sentenceAudioRefSignal: Signal<HTMLDivElement | undefined>;
  position: 1 | 2 | 3;
}) {
  const ankiFields = useAnkiField() as AnkiBackFields;
  const [expressionAudioRef, setExpressionAudioRef] =
    props.expressionAudioRefSignal;
  const [sentenceAudioRef, setSentenceAudioRef] = props.sentenceAudioRefSignal;
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
    position: "absolute",
  } as const;

  if (props.position === 1 || props.position === 3)
    return (
      <>
        <div
          style={hiddenStyle}
          ref={setExpressionAudioRef}
          innerHTML={ankiFields.ExpressionAudio}
        ></div>
        <div
          style={hiddenStyle}
          ref={setSentenceAudioRef}
          innerHTML={ankiFields.SentenceAudio}
        ></div>
        {(!isMobile() || props.position === 3) && (
          <>
            <NotePlayIcon
              on:click={() => {
                expressionAudioRef()?.querySelector("a")?.click();
              }}
            ></NotePlayIcon>
            <NotePlayIcon
              on:click={() => {
                sentenceAudioRef()?.querySelector("a")?.click();
              }}
            ></NotePlayIcon>
          </>
        )}
      </>
    );

  if (props.position === 2)
    return (
      isMobile() && (
        <div class="absolute bottom-4 left-4 flex flex-col gap-2 items-center">
          <NotePlayIcon
            on:click={() => {
              expressionAudioRef()?.querySelector("a")?.click();
            }}
          ></NotePlayIcon>
          <NotePlayIcon
            on:click={() => {
              sentenceAudioRef()?.querySelector("a")?.click();
            }}
          ></NotePlayIcon>
        </div>
      )
    );
}
