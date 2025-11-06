import { createSignal, lazy, onMount, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import {
  type AnkiBackFields,
  ankiFieldsSkeleton,
  exampleFields6,
} from "#/types";
import { Layout } from "./Layout";
import { AnkiFieldContextProvider, useConfig } from "./shared/Context";

// biome-ignore format: this looks nicer
const Lazy = {
  Settings: lazy(async () => ({ default: (await import("./_kiku_lazy")).Settings, })),
  BackHeader: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackHeader, })),
  BackFooter: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackFooter, })),
  AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy")).AudioButtons, })),
  ImageModal: lazy(async () => ({ default: (await import("./_kiku_lazy")).ImageModal, })),
  BackBody: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackBody, })),
  Pitches: lazy(async () => ({ default: (await import("./_kiku_lazy")).Pitches, })),
};

export function Back() {
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();

  const [config] = useConfig();
  const [showSettings, setShowSettings] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [imageModal, setImageModal] = createSignal<string>();

  let divs: NodeListOf<Element> | Element[] | undefined = isServer
    ? undefined
    : document.querySelectorAll("#anki-fields > div");
  if (import.meta.env.DEV && !isServer) {
    divs = Object.entries(exampleFields6).map(([key, value]) => {
      const div = document.createElement("div");
      div.dataset.field = key;
      div.innerHTML = value;
      return div;
    });
  }
  const ankiFields$: AnkiBackFields = divs
    ? Object.fromEntries(
        Array.from(divs).map((el) => [
          (el as HTMLDivElement).dataset.field,
          el.innerHTML.trim(),
        ]),
      )
    : ankiFieldsSkeleton;

  const tags = ankiFields$.Tags.split(" ");
  const isNsfw = tags.map((tag) => tag.toLowerCase()).includes("nsfw");

  onMount(() => {
    setTimeout(() => {
      setReady(true);
      globalThis.KIKU_STATE.relax = true;
    }, 1000);
  });

  return (
    <Layout>
      {showSettings() && (
        <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
          <Lazy.Settings
            onBackClick={() => setShowSettings(false)}
            onCancelClick={() => setShowSettings(false)}
          />
        </AnkiFieldContextProvider>
      )}
      {!showSettings() && (
        <>
          <div class="flex justify-between flex-row h-5 min-h-5">
            {ready() && (
              <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
                <Lazy.BackHeader
                  onSettingsClick={() => setShowSettings(true)}
                />
              </AnkiFieldContextProvider>
            )}
          </div>
          <div
            class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
            classList={{
              "animate-fade-in": globalThis.KIKU_STATE.relax,
            }}
          >
            <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <div
                class={`${config.fontSizeBaseExpression} ${config.fontSizeSmExpression}`}
                innerHTML={
                  isServer
                    ? undefined
                    : ankiFields$.ExpressionFurigana
                      ? ankiFields$["furigana:ExpressionFurigana"]
                      : ankiFields$.Expression
                }
              >
                {isServer
                  ? "{{#ExpressionFurigana}}{{furigana:ExpressionFurigana}}{{/ExpressionFurigana}}{{^ExpressionFurigana}}{{Expression}}{{/ExpressionFurigana}}"
                  : undefined}
              </div>
              <div
                class={`mt-6 flex gap-4 ${config.fontSizeBasePitch} ${config.fontSizeSmPitch}`}
              >
                {ankiFields$.PitchPosition && ready() ? (
                  <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
                    <Suspense fallback={<span>&nbsp;</span>}>
                      <Lazy.Pitches />
                    </Suspense>
                  </AnkiFieldContextProvider>
                ) : isServer ? (
                  "{{#PitchPosition}}<span>&nbsp;</span>{{/PitchPosition}}"
                ) : (
                  ankiFields$.PitchPosition && <span>&nbsp;</span>
                )}
              </div>
              <div class="flex gap-2 sm:h-8 sm:mt-2">
                {ready() && (
                  <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
                    <Lazy.AudioButtons
                      position={1}
                      expressionAudioRefSignal={expressionAudioRefSignal}
                      sentenceAudioRefSignal={sentenceAudioRefSignal}
                    />
                  </AnkiFieldContextProvider>
                )}
              </div>
            </div>
            <div class="bg-base-200 rounded-lg relative overflow-hidden">
              <div
                class="picture-field-background"
                innerHTML={isServer ? undefined : ankiFields$.Picture}
              >
                {isServer ? "{{Picture}}" : undefined}
              </div>
              <div
                class="picture-field"
                data-nsfw={isNsfw ? "true" : undefined}
                on:click={() => setImageModal(ankiFields$.Picture)}
                innerHTML={isServer ? undefined : ankiFields$.Picture}
              >
                {isServer ? "{{Picture}}" : undefined}
              </div>
            </div>
          </div>
          {ready() && (
            <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
              <Lazy.BackBody
                onDefinitionPictureClick={(picture) => {
                  setImageModal(picture);
                }}
              />
            </AnkiFieldContextProvider>
          )}
          {ready() && (
            <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
              <Lazy.BackFooter tags={tags} />
              <Lazy.AudioButtons
                position={2}
                expressionAudioRefSignal={expressionAudioRefSignal}
                sentenceAudioRefSignal={sentenceAudioRefSignal}
              />
            </AnkiFieldContextProvider>
          )}
        </>
      )}
      {ready() && (
        <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
          <Lazy.ImageModal
            img={imageModal()}
            on:click={() => setImageModal(undefined)}
          />
        </AnkiFieldContextProvider>
      )}
    </Layout>
  );
}
