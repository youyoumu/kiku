import type { Signal } from "solid-js";
import { isMobile } from "#/util/general";
import { useAnkiField } from "../shared/Context";
import { PlayIcon } from "./Icons";

export function NotePlayIcon(props: { "on:click"?: () => void }) {
  return (
    <PlayIcon
      class="bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer animate-fade-in-sm"
      on:click={props["on:click"]}
    />
  );
}

export default function BackPlayButton(props: {
  expressionAudioRefSignal: Signal<HTMLDivElement | undefined>;
  sentenceAudioRefSignal: Signal<HTMLDivElement | undefined>;
  position: 1 | 2 | 3;
}) {
  const { ankiFields, ankiFieldNodes } = useAnkiField<"back">();
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
        <div style={hiddenStyle} ref={setExpressionAudioRef}>
          {Array.from(ankiFieldNodes.ExpressionAudio).map((node) =>
            node.cloneNode(true),
          )}
        </div>
        <div style={hiddenStyle} ref={setSentenceAudioRef}>
          {Array.from(ankiFieldNodes.SentenceAudio).map((node) =>
            node.cloneNode(true),
          )}
        </div>
        {(!isMobile() || props.position === 3) && (
          <>
            {ankiFields.ExpressionAudio && (
              <NotePlayIcon
                on:click={() => {
                  expressionAudioRef()?.querySelector("a")?.click();
                }}
              ></NotePlayIcon>
            )}
            {ankiFields.SentenceAudio && (
              <NotePlayIcon
                on:click={() => {
                  sentenceAudioRef()?.querySelector("a")?.click();
                }}
              ></NotePlayIcon>
            )}
          </>
        )}
      </>
    );

  if (props.position === 2)
    return (
      isMobile() && (
        <div class="absolute bottom-4 left-4 flex flex-col gap-2 items-center">
          {ankiFields.ExpressionAudio && (
            <NotePlayIcon
              on:click={() => {
                expressionAudioRef()?.querySelector("a")?.click();
              }}
            ></NotePlayIcon>
          )}
          {ankiFields.SentenceAudio && (
            <NotePlayIcon
              on:click={() => {
                sentenceAudioRef()?.querySelector("a")?.click();
              }}
            ></NotePlayIcon>
          )}
        </div>
      )
    );
}
