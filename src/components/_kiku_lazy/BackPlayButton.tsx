import type { Signal } from "solid-js";
import type { AnkiBackFields } from "#/types";
import { isMobile } from "#/util/general";
import { useAnkiField } from "../shared/Context";
import { NotePlayIcon } from "../shared/NotePlayIcon";

export default function BackPlayButton(props: {
  expressionAudioRefSignal: Signal<HTMLDivElement | undefined>;
  sentenceAudioRefSignal: Signal<HTMLDivElement | undefined>;
  position: 1 | 2;
}) {
  const ankiFields = useAnkiField() as AnkiBackFields;
  const [expressionAudioRef, setExpressionAudioRef] =
    props.expressionAudioRefSignal;
  const [sentenceAudioRef, setSentenceAudioRef] = props.sentenceAudioRefSignal;
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
  } as const;

  if (props.position === 1)
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
        {!isMobile() && (
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
