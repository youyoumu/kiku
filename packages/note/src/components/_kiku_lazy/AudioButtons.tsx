import { For, onMount, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useAnkiField, useCardStore } from "../shared/Context";
import { PlayIcon } from "./Icons";

function AudioTag(props: { text: string }) {
  // Find all `[sound:filename.mp3]` occurrences
  const matches = [...props.text.matchAll(/\[sound:([^\]]+)\]/g)];
  const sounds = matches.map((m) => m[1]);
  KIKU_STATE.logger.info("Using sounds:", sounds);

  return (
    <Show when={sounds.length > 0}>
      <div class="flex flex-wrap gap-2">
        <For each={sounds}>
          {(src) => {
            return <audio src={src} preload="none" />;
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
      on:touchend={(e) => e.stopPropagation()}
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
    if (aaa) {
      if (aaa.length && !card.sentenceAudios) {
        setCard("sentenceAudios", Array.from(aaa));
      }
      KIKU_STATE.logger.info(
        "Number of detected anchor in sentence audios",
        aaa.length,
      );
    }

    const audios = card.sentenceAudioRef?.querySelectorAll("audio");
    if (audios) {
      if (audios.length && !card.sentenceAudios) {
        setCard("sentenceAudios", Array.from(audios));
      }
      KIKU_STATE.logger.info(
        "Number of detected audio in sentence audios",
        audios?.length,
      );
    }
  });

  const NotePlayIcons = () => {
    return (
      <>
        {ankiFields.ExpressionAudio && (
          <NotePlayIcon
            color="primary"
            on:click={() => {
              card.expressionAudioRef?.querySelector("a")?.click();
              card.expressionAudioRef?.querySelector("audio")?.play();
            }}
          ></NotePlayIcon>
        )}
        {card.sentenceAudios?.map((el) => {
          return (
            <NotePlayIcon
              color="secondary"
              on:click={() => {
                el.click();
                if (el instanceof HTMLAudioElement) el.play();
              }}
            ></NotePlayIcon>
          );
        })}
      </>
    );
  };

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
          {card.nested && <AudioTag text={ankiFields.SentenceAudio} />}
        </div>
        <NotePlayIcons />
      </>
    );

  if (props.position === 2)
    return (
      <Portal mount={KIKU_STATE.root}>
        <div class="absolute bottom-4 left-4 flex sm:hidden flex-col gap-2 items-center">
          <NotePlayIcons />
        </div>
      </Portal>
    );
}
