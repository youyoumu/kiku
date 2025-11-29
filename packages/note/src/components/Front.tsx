import { createEffect, createSignal, lazy, onMount } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import { useCardContext } from "#/components/shared/CardContext";
import type { DatasetProp } from "#/util/config";
import { Layout } from "./Layout";
import { useAnkiFieldContext } from "./shared/AnkiFieldsContext";
import { useConfigContext } from "./shared/ConfigContext";
import { useFieldGroupContext } from "./shared/FieldGroupContext";

// biome-ignore format: this looks nicer
const Lazy = {
  AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy")).AudioButtons, })),
  Header: lazy(async () => ({ default: (await import("./_kiku_lazy")).Header, })),
  PicturePagination: lazy(async () => ({ default: (await import("./_kiku_lazy")).PicturePagination, })),
  UseAnkiDroid: lazy(async () => ({ default: (await import("./_kiku_lazy")).UseAnkiDroid, })),
  Sentence: lazy(async () => ({ default: (await import("./_kiku_lazy")).Sentence, })),
};

export function Front() {
  const [$card, $setCard] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"front">();
  const [clicked, setClicked] = createSignal(false);
  const [hideExpression, setHideExpression] = createSignal(false);
  const { $group } = useFieldGroupContext();
  const [$config] = useConfigContext();

  onMount(() => {
    setTimeout(() => {
      $setCard("ready", true);
    }, 100);

    if ($config.modHidden) {
      setTimeout(() => {
        setHideExpression(true);
      }, $config.modHiddenDuration);
    }
  });

  createEffect(() => {
    if (
      ankiFields.IsAudioCard &&
      $card.sentenceFieldRef &&
      $group.sentenceField
    ) {
      $card.sentenceFieldRef.innerHTML =
        $card.sentenceFieldRef.innerHTML.replaceAll(
          //TODO: this doesn't handle conjugation
          ankiFields.Expression,
          "<span class='text-base-content-primary'>[...]<span>",
        );
    }
  });

  const hidden = () => {
    if (isServer) return true;
    if (
      ankiFields.IsSentenceCard ||
      ankiFields.IsWordAndSentenceCard ||
      ankiFields.IsAudioCard
    ) {
      return false;
    }
    if (ankiFields.IsClickCard && clicked()) {
      return false;
    }
    return true;
  };

  const hintFieldDataset: () => DatasetProp = () => ({
    "data-has-hint": isServer
      ? "{{#Hint}}true{{/Hint}}"
      : ankiFields.Hint
        ? "true"
        : "",
  });

  return (
    <Layout>
      {$card.ready && !$card.nested && <Lazy.UseAnkiDroid />}
      {$card.ready && (
        <Portal mount={KIKU_STATE.root}>
          <Lazy.Header />
        </Portal>
      )}
      <div class="flex flex-col gap-4">
        <div
          class="flex rounded-lg gap-4 sm:min-h-56 flex-col sm:flex-row"
          on:click={() => {
            setClicked((prev) => !prev);
            setHideExpression(false);
          }}
          on:touchend={(e) => e.stopPropagation()}
        >
          <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
            <div
              class="expression font-secondary vertical-rl"
              classList={{
                "border-b-2 border-dotted border-base-content-soft":
                  !!ankiFields.IsClickCard,
                "transition-opacity duration-[1000ms] opacity-0":
                  hideExpression(),
              }}
              innerHTML={
                isServer
                  ? undefined
                  : !ankiFields.IsSentenceCard && !ankiFields.IsAudioCard
                    ? ankiFields.Expression
                    : "?"
              }
            >
              {isServer
                ? `{{#IsSentenceCard}} <span>?</span> {{/IsSentenceCard}} {{#IsAudioCard}} <span>?</span> {{/IsAudioCard}} {{^IsSentenceCard}} {{^IsAudioCard}} {{Expression}} {{/IsAudioCard}} {{/IsSentenceCard}}`
                : undefined}
            </div>
          </div>
        </div>
        <div class="justify-between text-base-content-soft items-center gap-2 animate-fade-in h-5 sm:h-8 flex">
          {$card.ready && !hidden() && <Lazy.PicturePagination />}
        </div>
      </div>
      <div
        class="flex flex-col gap-4 items-center text-center justify-center"
        classList={{
          "transition-opacity duration-[1000ms] opacity-0": hideExpression(),
        }}
      >
        {$card.ready && !hidden() && <Lazy.Sentence />}
      </div>
      {$card.ready && ankiFields.IsAudioCard && (
        <div class="flex gap-2 justify-center animate-fade-in-sm">
          <Lazy.AudioButtons position={1} />
        </div>
      )}
      <div
        class={`flex gap-2 items-center justify-center text-center border-t-1 hint text-base-content-calm hint-field border-base-content-soft p-2`}
        {...hintFieldDataset()}
      >
        <div innerHTML={isServer ? undefined : ankiFields.Hint}>
          {isServer ? "{{Hint}}" : undefined}
        </div>
      </div>
    </Layout>
  );
}
