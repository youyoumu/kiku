import { createEffect, createSignal, lazy, onMount, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import type { DatasetProp } from "#/util/config";
import { getAnkiFields } from "#/util/general";
import { ArrowLeftIcon } from "./_kiku_lazy/Icons";
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
  ArrowLeftIcon: lazy(async () => ({ default: (await import("./_kiku_lazy")).ArrowLeftIcon, })),
};

export function Back() {
  let pictureFieldEl: HTMLDivElement | undefined;
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudiosSignal = createSignal<HTMLAnchorElement[]>();

  const [showSettings, setShowSettings] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [imageModal, setImageModal] = createSignal<string>();
  const [pictureIndex, setPictureIndex] = createSignal(0);
  const [pictures, setPictures] = createSignal<HTMLImageElement[]>([]);

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

    if (pictureFieldEl) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ankiFields$.Picture;
      const imgs = Array.from(tempDiv.querySelectorAll("img"));
      imgs.forEach((img) => {
        img.dataset.index = imgs.indexOf(img).toString();
      });
      setPictures(imgs);
      pictureFieldEl.replaceChildren(...imgs);
    }
  });

  createEffect(() => {
    pictures().forEach((img) => {
      img.style.display =
        img.dataset.index === pictureIndex().toString() ? "block" : "none";
    });
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
          <div>
            <div
              class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
              classList={{
                "animate-fade-in": globalThis.KIKU_STATE.relax,
              }}
            >
              <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
                <div
                  class="expression font-secondary"
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
                    <AnkiFieldContextProvider
                      value={{ ankiFields: ankiFields$ }}
                    >
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
                <div class="hidden sm:flex gap-2 sm:h-8 sm:mt-2">
                  {ready() && (
                    <AnkiFieldContextProvider
                      value={{ ankiFields: ankiFields$ }}
                    >
                      <Lazy.AudioButtons
                        position={1}
                        expressionAudioRefSignal={expressionAudioRefSignal}
                        sentenceAudioRefSignal={sentenceAudioRefSignal}
                        sentenceAudiosSignal={sentenceAudiosSignal}
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
                  ref={pictureFieldEl}
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
              <div class="flex justify-between py-1 text-base-content-soft items-center gap-2 animate-fade-in h-5 sm:h-8">
                {pictures().length > 1 && (
                  <>
                    <Lazy.ArrowLeftIcon
                      class="cursor-pointer size-5 sm:size-8 hover:scale-110 transition-transform"
                      on:click={() => {
                        setPictureIndex((prev) => {
                          const newIndex =
                            (prev - 1 + pictures().length) % pictures().length;
                          const a = sentenceAudiosSignal[0]();
                          a?.[newIndex]?.click();
                          return newIndex;
                        });
                      }}
                    ></Lazy.ArrowLeftIcon>
                    {`${pictureIndex() + 1} / ${pictures().length}`}
                    <Lazy.ArrowLeftIcon
                      class="cursor-pointer size-5 sm:size-8 rotate-180 hover:scale-110 transition-transform"
                      on:click={() => {
                        setPictureIndex((prev) => {
                          const newIndex = (prev + 1) % pictures().length;
                          const a = sentenceAudiosSignal[0]();
                          a?.[newIndex]?.click();
                          return newIndex;
                        });
                      }}
                    ></Lazy.ArrowLeftIcon>
                  </>
                )}
              </div>
            )}
          </div>
          {ready() && (
            <AnkiFieldContextProvider value={{ ankiFields: ankiFields$ }}>
              <Lazy.BackBody
                onDefinitionPictureClick={(picture) => {
                  setImageModal(picture);
                }}
                sentenceIndex={(sentenceLength) => {
                  if (pictures().length !== sentenceLength) return undefined;
                  return pictures().length > 1 ? pictureIndex() : undefined;
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
                sentenceAudiosSignal={sentenceAudiosSignal}
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
