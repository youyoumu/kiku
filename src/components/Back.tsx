import { createSignal, lazy, onMount, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import type { DatasetProp } from "#/util/config";
import { getAnkiFields } from "#/util/general";
import { Layout } from "./Layout";
import { AnkiFieldContextProvider } from "./shared/Context";

// biome-ignore format: this looks nicer
const Lazy = {
  Settings: lazy(async () => ({ default: (await import("./_kiku_lazy")).Settings, })),
  Header: lazy(async () => ({ default: (await import("./_kiku_lazy")).Header, })),
  BackFooter: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackFooter, })),
  AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy")).AudioButtons, })),
  ImageModal: lazy(async () => ({ default: (await import("./_kiku_lazy")).ImageModal, })),
  BackBody: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackBody, })),
  Pitches: lazy(async () => ({ default: (await import("./_kiku_lazy")).Pitches, })),
};

export function Back() {
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();

  const [showSettings, setShowSettings] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [imageModal, setImageModal] = createSignal<string>();

  const ankiFields$ = getAnkiFields<"back">();

  const [isNsfw, setIsNsfw] = createSignal(false);
  const tags = ankiFields$.Tags.split(" ");

  onMount(() => {
    setTimeout(() => {
      setReady(true);
      globalThis.KIKU_STATE.relax = true;
    }, 100);

    const tags = ankiFields$.Tags.split(" ");
    setIsNsfw(tags.map((tag) => tag.toLowerCase()).includes("nsfw"));
  });

  const pictureFieldDataset: () => DatasetProp = () => ({
    "data-transition": ready() ? "true" : undefined,
    "data-tags": "{{Tags}}",
    "data-nsfw": isNsfw() ? "true" : "false",
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
                <Lazy.Header
                  side="back"
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
                class="expression"
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
              <div class={`mt-6 flex gap-4 pitch`}>
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
                on:click={() => setImageModal(ankiFields$.Picture)}
                {...pictureFieldDataset()}
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
