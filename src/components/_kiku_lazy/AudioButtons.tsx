import { createSignal, onMount, type Signal } from "solid-js";
import { useAnkiField, useBreakpoint } from "../shared/Context";
import { PlayIcon } from "./Icons";

export function NotePlayIcon(props: {
  "on:click"?: () => void;
  color: "primary" | "secondary";
}) {
  return (
    <PlayIcon
      class="bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer animate-fade-in-sm"
      classList={{
        "bg-primary text-primary-content": props.color === "primary",
        "bg-secondary text-secondary-content": props.color === "secondary",
      }}
      on:click={props["on:click"]}
    />
  );
}

export default function BackPlayButton(props: {
  expressionAudioRefSignal: Signal<HTMLDivElement | undefined>;
  sentenceAudioRefSignal: Signal<HTMLDivElement | undefined>;
  position: 1 | 2 | 3;
}) {
  const bp = useBreakpoint();
  const { ankiFields } = useAnkiField<"back">();
  const [expressionAudioRef, setExpressionAudioRef] =
    props.expressionAudioRefSignal;
  const [sentenceAudioRef, setSentenceAudioRef] = props.sentenceAudioRefSignal;
  const [sentenceAudios, setSentenceAudios] = createSignal<HTMLAnchorElement[]>(
    [],
  );
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
    position: "absolute",
  } as const;

  onMount(() => {
    const aaa = sentenceAudioRef()?.querySelectorAll("a");
    setSentenceAudios(Array.from(aaa ?? []));
  });

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
        {(bp.isAtLeast("sm") || props.position === 3) && (
          <>
            {ankiFields.ExpressionAudio && (
              <NotePlayIcon
                color="primary"
                on:click={() => {
                  expressionAudioRef()?.querySelector("a")?.click();
                }}
              ></NotePlayIcon>
            )}
            {sentenceAudios().map((el) => {
              return (
                <NotePlayIcon
                  color="secondary"
                  on:click={() => {
                    el.click();
                  }}
                ></NotePlayIcon>
              );
            })}
          </>
        )}
      </>
    );

  if (props.position === 2)
    return (
      !bp.isAtLeast("sm") && (
        <div class="absolute bottom-4 left-4 flex flex-col gap-2 items-center">
          {ankiFields.ExpressionAudio && (
            <NotePlayIcon
              color="primary"
              on:click={() => {
                expressionAudioRef()?.querySelector("a")?.click();
              }}
            ></NotePlayIcon>
          )}
          {sentenceAudios().map((el) => {
            return (
              <NotePlayIcon
                color="secondary"
                on:click={() => {
                  el.click();
                }}
              ></NotePlayIcon>
            );
          })}
        </div>
      )
    );
}
