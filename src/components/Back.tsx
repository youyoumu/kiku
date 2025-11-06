import { createSignal, lazy, onMount, Suspense } from "solid-js";
import { Layout } from "./Layout";
import { useAnkiField, useBreakpoint, useConfig } from "./shared/Context";

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
  const { ankiFields } = useAnkiField<"back">();
  const [showSettings, setShowSettings] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [showImageModal, setShowImageModal] = createSignal<undefined | Node>();

  const tags = ankiFields.Tags.split(" ");
  const isNsfw = tags.map((tag) => tag.toLowerCase()).includes("nsfw");

  onMount(() => {
    setTimeout(() => {
      setReady(true);
      window.KIKU_STATE.relax = true;
    }, 50);
  });

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = ankiFields.Picture;
  const picture = tempDiv.querySelector("img");

  return (
    <Layout>
      {showSettings() && (
        <Lazy.Settings
          onBackClick={() => setShowSettings(false)}
          onCancelClick={() => setShowSettings(false)}
        />
      )}
      {!showSettings() && (
        <>
          <div class="flex justify-between flex-row h-5 min-h-5">
            {ready() && (
              <Lazy.BackHeader onSettingsClick={() => setShowSettings(true)} />
            )}
          </div>
          <div
            class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
            classList={{
              "animate-fade-in": window.KIKU_STATE.relax,
            }}
          >
            <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
              <div
                class={`${config.fontSizeBaseExpression} ${config.fontSizeSmExpression}`}
                innerHTML={
                  ankiFields.ExpressionFurigana
                    ? ankiFields["furigana:ExpressionFurigana"]
                    : ankiFields.Expression
                }
              ></div>
              <div
                class={`mt-6 flex gap-4 ${config.fontSizeBasePitch} ${config.fontSizeSmPitch}`}
              >
                {ankiFields.PitchPosition && ready() ? (
                  <Suspense fallback={<>&nbsp;</>}>
                    <Lazy.Pitches />
                  </Suspense>
                ) : (
                  ankiFields.PitchPosition && <>&nbsp;</>
                )}
              </div>
              <div
                class="flex gap-2"
                classList={{
                  "h-8 mt-2": bp.isAtLeast("sm"),
                }}
              >
                {ready() && (
                  <Lazy.AudioButtons
                    position={1}
                    expressionAudioRefSignal={expressionAudioRefSignal}
                    sentenceAudioRefSignal={sentenceAudioRefSignal}
                  />
                )}
              </div>
            </div>

            {ankiFields.Picture && (
              <div
                class="bg-base-200 rounded-lg relative overflow-hidden [&>img]:size-full [&>img]:filter 
               [&>img]:object-cover [&>img]:object-center [&>img]:brightness-50 [&>img]:absolute"
                classList={{
                  "[&>img]:blur-[16px]": isNsfw,
                  "[&>img]:blur-[4px]": !isNsfw,
                }}
              >
                {!bp.isAtLeast("sm") && picture?.cloneNode(true)}
                <div
                  class="relative h-full sm:[&_img]:h-full [&_img]:object-contain [&_img]:h-48 [&_img]:mx-auto 
                [&_img]:transition-[filter] [&_img]:hover:filter-none cursor-pointer "
                  classList={{
                    "[&_img]:filter [&_img]:blur-[16px] [&_img]:brightness-50":
                      isNsfw,
                  }}
                  on:click={() => picture && setShowImageModal(picture)}
                >
                  {picture}
                </div>
              </div>
            )}
          </div>
          {ready() && (
            <Lazy.BackBody
              onDefinitionPictureClick={(node) => setShowImageModal(node)}
            />
          )}
          {ready() && (
            <>
              <Lazy.BackFooter tags={tags} />
              <Lazy.AudioButtons
                position={2}
                expressionAudioRefSignal={expressionAudioRefSignal}
                sentenceAudioRefSignal={sentenceAudioRefSignal}
              />
            </>
          )}
        </>
      )}
      {ready() && (
        <Lazy.ImageModal
          show={!!showImageModal()}
          img={showImageModal()?.cloneNode()}
          on:click={() => setShowImageModal(undefined)}
        />
      )}
    </Layout>
  );
}
