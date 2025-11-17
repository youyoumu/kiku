import { createEffect, For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useCardStore } from "#/components/shared/CardContext";
import { useAnkiField, useConfig } from "../shared/Context";
import { useFieldGroup } from "../shared/FieldGroupContext";
import { PlayIcon } from "./Icons";

function AudioTag(props: { text: string }) {
  // Find all `[sound:filename.mp3]` occurrences
  const matches = () => [...props.text.matchAll(/\[sound:([^\]]+)\]/g)];
  const sounds = () => matches().map((m) => m[1]);
  KIKU_STATE.logger.info("Using sounds:", sounds);

  return (
    <Show when={sounds().length > 0}>
      <div class="flex flex-wrap gap-2">
        <For each={sounds()}>
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
      class="bg-primary rounded-full text-primary-content p-1 w-8 h-8 cursor-pointer"
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
  const { group } = useFieldGroup();
  const [config] = useConfig();
  const hiddenStyle = {
    width: "0",
    height: "0",
    overflow: "hidden",
    position: "absolute",
  } as const;

  createEffect(() => {
    group.sentenceAudioField;
    const anchors = card.sentenceAudioRef?.querySelectorAll("a");
    if (anchors?.length) {
      setCard("sentenceAudios", Array.from(anchors));
      KIKU_STATE.logger.info(
        "Number of detected anchor in sentence audios",
        anchors.length,
      );
    }

    const audios = card.sentenceAudioRef?.querySelectorAll("audio");
    if (audios?.length) {
      setCard("sentenceAudios", Array.from(audios));
      KIKU_STATE.logger.info(
        "Number of detected audio in sentence audios",
        audios?.length,
      );
    }
  });

  let autoPlay = true;
  createEffect(() => {
    group.sentenceAudioField;
    card.expressionAudioRef?.querySelectorAll("audio").forEach((el) => {
      el.volume = config.volume / 100;
    });
    card.sentenceAudioRef?.querySelectorAll("audio").forEach((el) => {
      el.volume = config.volume / 100;
    });

    if (card.nested && autoPlay) {
      autoPlay = false;
      const audio = card.expressionAudioRef?.querySelector("audio");
      if (audio) {
        audio.play();
        audio.onpause = () => {
          const audio = card.sentenceAudioRef?.querySelectorAll("audio")[0];
          if (audio) {
            audio.play();
          }
        };
      }
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
          innerHTML={card.nested ? undefined : group.sentenceAudioField}
        >
          {card.nested && <AudioTag text={group.sentenceAudioField} />}
        </div>
        <NotePlayIcons />
      </>
    );

  if (props.position === 2)
    return (
      <Portal mount={KIKU_STATE.root}>
        <div class="absolute bottom-4 left-4 flex sm:hidden flex-col gap-2 items-center animate-fade-in-sm">
          <NotePlayIcons />
        </div>
      </Portal>
    );
}
