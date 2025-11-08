import { createSignal, lazy, onMount } from "solid-js";
import { isServer } from "solid-js/web";
import type { AnkiFields } from "#/types";
import type { DatasetProp } from "#/util/config";
import { getAnkiFields } from "#/util/general";
import { Layout } from "./Layout";
import { AnkiFieldContextProvider } from "./shared/Context";

// biome-ignore format: this looks nicer
const Lazy = {
  AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy")).AudioButtons, })),
  Header: lazy(async () => ({ default: (await import("./_kiku_lazy")).Header, })),
};

export function Front() {
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();

  const [ready, setReady] = createSignal(false);
  const [clicked, setClicked] = createSignal(false);

  const ankiFields$ = getAnkiFields<"front">();

  onMount(() => {
    setTimeout(() => {
      setReady(true);
    }, 100);
  });

  // biome-ignore format: this looks nicer
  const sentenceFrontProp: DatasetProp = {
    "data-is-audio-card": isServer ? "{{IsAudioCard}}" : undefined,
    "data-is-sentence-card": isServer ? "{{IsSentenceCard}}" : undefined,
    "data-is-word-and-sentence-card": isServer ? "{{IsWordAndSentenceCard}}" : undefined ,
    "data-is-click-card" :isServer ? "{{IsClickCard}}" : undefined,
    "data-clicked": clicked() ? "true" : undefined
  }

  return (
    <Layout>
      <div class="flex justify-between flex-row h-5 min-h-5">
        {ready() && (
          <AnkiFieldContextProvider
            value={{ ankiFields: ankiFields$ as AnkiFields }}
          >
            <Lazy.Header side="front" />
          </AnkiFieldContextProvider>
        )}
      </div>
      <div
        class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
        on:click={() => setClicked((prev) => !prev)}
      >
        <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
          <div
            class="expression"
            classList={{
              "border-b-2 border-dotted border-base-content-soft":
                !!ankiFields$.IsClickCard,
            }}
            innerHTML={
              isServer
                ? undefined
                : !ankiFields$.IsSentenceCard && !ankiFields$.IsAudioCard
                  ? ankiFields$.Expression
                  : "?"
            }
          >
            {isServer
              ? `{{#IsSentenceCard}} <span>?</span> {{/IsSentenceCard}} {{#IsAudioCard}} <span>?</span> {{/IsAudioCard}} {{^IsSentenceCard}} {{^IsAudioCard}} {{Expression}} {{/IsAudioCard}} {{/IsSentenceCard}}`
              : undefined}
          </div>
        </div>
      </div>

      <div class="sentence-front" {...sentenceFrontProp}>
        <div
          class={`[&_b]:text-base-content-primary sentence`}
          innerHTML={isServer ? undefined : ankiFields$["kanji:Sentence"]}
        >
          {isServer ? "{{kanji:Sentence}}" : undefined}
        </div>
      </div>

      {ready() && ankiFields$.IsAudioCard && (
        <div class="flex gap-4 justify-center">
          <AnkiFieldContextProvider
            value={{ ankiFields: ankiFields$ as AnkiFields }}
          >
            <Lazy.AudioButtons
              position={3}
              expressionAudioRefSignal={expressionAudioRefSignal}
              sentenceAudioRefSignal={sentenceAudioRefSignal}
            />
          </AnkiFieldContextProvider>
        </div>
      )}

      {ankiFields$.Hint && (
        <div
          class={`flex gap-2 items-center justify-center text-center border-t-1 hint`}
        >
          <div innerHTML={isServer ? undefined : ankiFields$.Hint}>
            {isServer ? "{{Hint}}" : undefined}
          </div>
        </div>
      )}
    </Layout>
  );
}
