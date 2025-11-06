import { createSignal, lazy, onMount, Suspense } from "solid-js";
import {
  type AnkiBackFields,
  ankiFieldsSkeleton,
  exampleFields6,
} from "#/types";
import { Layout } from "./Layout";
import {
  AnkiFieldContextProvider,
  useBreakpoint,
  useConfig,
} from "./shared/Context";

const Lazy = {
  Settings: lazy(async () => ({
    default: (await import("./_kiku_lazy")).Settings,
  })),
  BackHeader: lazy(async () => ({
    default: (await import("./_kiku_lazy")).BackHeader,
  })),
  BackFooter: lazy(async () => ({
    default: (await import("./_kiku_lazy")).BackFooter,
  })),
  AudioButtons: lazy(async () => ({
    default: (await import("./_kiku_lazy")).AudioButtons,
  })),
  ImageModal: lazy(async () => ({
    default: (await import("./_kiku_lazy")).ImageModal,
  })),
  BackBody: lazy(async () => ({
    default: (await import("./_kiku_lazy")).BackBody,
  })),
  Pitches: lazy(async () => ({
    default: (await import("./_kiku_lazy")).Pitches,
  })),
};

export function Back() {
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();

  const [config] = useConfig();
  const bp = useBreakpoint();
  const [showSettings, setShowSettings] = createSignal(false);
  const [ankiFields, setAnkiFields] =
    createSignal<AnkiBackFields>(ankiFieldsSkeleton);
  const [ready, setReady] = createSignal(false);
  const [picture, setPicture] = createSignal<string | undefined>();
  const [imageModal, setImageModal] = createSignal<string>();

  const pictureInnerHtml = () =>
    import.meta.env.DEV ? ankiFields().Picture : undefined;

  const tags = () => ankiFields().Tags.split(" ") ?? [];
  const isNsfw = () =>
    tags()
      .map((tag) => tag.toLowerCase())
      .includes("nsfw");

  onMount(() => {
    setTimeout(() => {
      setReady(true);
      globalThis.KIKU_STATE.relax = true;
    }, 2000);

    setTimeout(() => {
      let divs: NodeListOf<Element> | Element[] =
        document.querySelectorAll("#anki-fields > div");
      if (import.meta.env.DEV) {
        divs = Object.entries(exampleFields6).map(([key, value]) => {
          const div = document.createElement("div");
          div.dataset.field = key;
          div.innerHTML = value;
          return div;
        });
      }
      const ankiFields$ = Object.fromEntries(
        Array.from(divs).map((el) => [
          (el as HTMLDivElement).dataset.field,
          el.innerHTML.trim(),
        ]),
      ) as AnkiBackFields;
      setAnkiFields(ankiFields$);

      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = ankiFields().Picture;
      setPicture(tempDiv.querySelector("img")?.outerHTML ?? "");
    }, 1000);
  });

  return (
    <Layout>
      {showSettings() && (
        <AnkiFieldContextProvider value={{ ankiFields: ankiFields() }}>
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
              <AnkiFieldContextProvider value={{ ankiFields: ankiFields() }}>
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
                  ankiFields().ExpressionFurigana
                    ? ankiFields()["furigana:ExpressionFurigana"]
                    : ankiFields().Expression
                }
              ></div>
              <div
                class={`mt-6 flex gap-4 ${config.fontSizeBasePitch} ${config.fontSizeSmPitch}`}
              >
                {ankiFields().PitchPosition && ready() ? (
                  <AnkiFieldContextProvider
                    value={{ ankiFields: ankiFields() }}
                  >
                    <Suspense fallback={<>&nbsp;</>}>
                      <Lazy.Pitches />
                    </Suspense>
                  </AnkiFieldContextProvider>
                ) : (
                  ankiFields().PitchPosition && <>&nbsp;</>
                )}
              </div>
              <div
                class="flex gap-2"
                classList={{
                  "h-8 mt-2": bp.isAtLeast("sm"),
                }}
              >
                {ready() && (
                  <AnkiFieldContextProvider
                    value={{ ankiFields: ankiFields() }}
                  >
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
                class="[&_img]:scale-110 [&_img]:size-full [&_img]:filter [&_img]:object-cover [&_img]:object-center [&_img]:brightness-50 [&_img]:absolute [&_img]:blur-[16px]"
                innerHTML={
                  import.meta.env.DEV ? ankiFields().Picture : undefined
                }
              >
                {import.meta.env.DEV ? undefined : "{{Picture}}"}
              </div>
              <div
                class="relative h-full sm:[&_img]:h-full [&_img]:object-contain [&_img]:h-48 [&_img]:mx-auto [&_img]:transition-[filter] [&_img]:hover:filter-none cursor-pointer"
                classList={{
                  "[&_img]:filter [&_img]:blur-[16px] [&_img]:brightness-50":
                    isNsfw(),
                }}
                on:click={() => picture && setImageModal(picture())}
                innerHTML={
                  import.meta.env.DEV ? ankiFields().Picture : undefined
                }
              >
                {import.meta.env.DEV ? undefined : "{{Picture}}"}
              </div>
            </div>
          </div>
          {ready() && (
            <AnkiFieldContextProvider value={{ ankiFields: ankiFields() }}>
              <Lazy.BackBody
                onDefinitionPictureClick={(picture) => {
                  setImageModal(picture);
                }}
              />
            </AnkiFieldContextProvider>
          )}
          {ready() && (
            <AnkiFieldContextProvider value={{ ankiFields: ankiFields() }}>
              <Lazy.BackFooter tags={tags()} />
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
        <AnkiFieldContextProvider value={{ ankiFields: ankiFields() }}>
          <Lazy.ImageModal
            img={imageModal()}
            on:click={() => setImageModal(undefined)}
          />
        </AnkiFieldContextProvider>
      )}
    </Layout>
  );
}
