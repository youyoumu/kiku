import { For, onMount, Show } from "solid-js";
import { useAnkiField, useCardStore } from "../shared/Context";
import { PlayIcon } from "./Icons";

function AudioTag(props: { text: string }) {
  // Find all `[sound:filename.mp3]` occurrences
  const matches = [...props.text.matchAll(/\[sound:([^\]]+)\]/g)];
  const sounds = matches.map((m) => m[1]);

  const handleClick = (audio: HTMLAudioElement | undefined, e: MouseEvent) => {
    e.preventDefault();
    if (audio) {
      audio.currentTime = 0;
      void audio.play();
    }
  };

  return (
    <Show when={sounds.length > 0}>
      <div class="flex flex-wrap gap-2">
        <For each={sounds}>
          {(src) => {
            let audioRef: HTMLAudioElement | undefined;
            return (
              <a href="#" onClick={(e) => handleClick(audioRef, e)}>
                <audio ref={audioRef} src={src} preload="none" />
              </a>
            );
          }}
        </For>
      </div>
    </Show>
  );
}

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

export default function AudioButtons(props: { position: 1 | 2 }) {
  const { ankiFields } = useAnkiField<"back">();
  const [card, setCard] = useCardStore();
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
    position: "absolute",
  } as const;

  onMount(() => {
    const aaa = card.sentenceAudioRef?.querySelectorAll("a");
    if (aaa && !card.sentenceAudios) setCard("sentenceAudios", Array.from(aaa));
  });

  if (props.position === 1)
    return (
      <>
        <div
          style={hiddenStyle}
          ref={(ref) => setCard("expressionAudioRef", ref)}
          innerHTML={card.nested ? undefined : ankiFields.ExpressionAudio}
        >
          {card.nested && <AudioTag text={ankiFields.ExpressionAudio} />}
        </div>
        <div
          style={hiddenStyle}
          ref={(ref) => setCard("sentenceAudioRef", ref)}
          innerHTML={card.nested ? undefined : ankiFields.SentenceAudio}
        >
          {card.nested && (
            <AudioTag text={ankiFields.SentenceAudio.repeat(2)} />
          )}
        </div>
        {ankiFields.ExpressionAudio && (
          <NotePlayIcon
            color="primary"
            on:click={() => {
              card.expressionAudioRef?.querySelector("a")?.click();
            }}
          ></NotePlayIcon>
        )}
        {card.sentenceAudios?.map((el) => {
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
    );

  if (props.position === 2)
    return (
      <div class="absolute bottom-4 left-4 flex sm:hidden flex-col gap-2 items-center">
        {ankiFields.ExpressionAudio && (
          <NotePlayIcon
            color="primary"
            on:click={() => {
              card.expressionAudioRef?.querySelector("a")?.click();
            }}
          ></NotePlayIcon>
        )}
        {card.sentenceAudios?.map((el) => {
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
    );
}
