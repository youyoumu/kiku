import { createSignal, lazy, onMount } from "solid-js";
import type { AnkiBackFields } from "../types";
import { isMobile } from "../util/general";
import { Layout } from "./Layout";
import { useAnkiField, useConfig } from "./shared/Context";

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
};

export function Back() {
  let sentenceEl: HTMLDivElement | undefined;
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const [config] = useConfig();

  const ankiFields = useAnkiField() as AnkiBackFields;
  const [definitionPage, setDefinitionPage] = createSignal(
    ankiFields.SelectionText ? 0 : 1,
  );
  const [showSettings, setShowSettings] = createSignal(false);
  const [ready, setReady] = createSignal(false);
  const [showImageModal, setShowImageModal] = createSignal(false);

  const tags = ankiFields.Tags.split(" ");
  const isNsfw = tags.map((tag) => tag.toLowerCase()).includes("nsfw");

  onMount(() => {
    if (sentenceEl) {
      const ruby = sentenceEl.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }
    setTimeout(() => {
      setReady(true);
    }, 150);
  });

  const temp = document.createElement("div");
  temp.innerHTML = ankiFields.Picture ?? "";
  const img = temp.querySelector("img");

  const pages = [
    ankiFields.SelectionText,
    ankiFields.MainDefinition,
    ankiFields.Glossary,
  ];
  const availablePagesCount = pages.filter((page) => page?.trim()).length;
  const page = () => pages[definitionPage()];
  const pageType = () => {
    if (definitionPage() === 0) return "Selection text";
    if (definitionPage() === 1) return "Main definition";
    if (definitionPage() === 2) return "Glossary";
  };

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
          <div class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row">
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
                class={`${config.fontSizeBasePitch} ${config.fontSizeSmPitch}`}
              >
                {/* TODO: pitch  */}
              </div>
              <div
                class="flex gap-2"
                classList={{
                  "h-8 pt-4": !isMobile(),
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

            <div
              class="sm:[&_img]:h-full [&_img]:rounded-lg [&_img]:object-contain [&_img]:h-48 [&_img]:mx-auto bg-base-200 rounded-lg transition-[filter] hover:filter-none cursor-pointer"
              classList={{
                "filter blur-[16px] brightness-50": isNsfw,
              }}
              on:click={() => setShowImageModal(true)}
            >
              {img}
            </div>
          </div>
          <div class="flex sm:flex-col gap-8 flex-col-reverse">
            <div class="flex flex-col gap-4 items-center text-center">
              <div
                class={`[&_b]:text-base-content-primary ${config.fontSizeBaseSentence} ${config.fontSizeSmSentence}`}
                ref={sentenceEl}
                innerHTML={
                  ankiFields["furigana:SentenceFurigana"] ??
                  ankiFields["furigana:Sentence"]
                }
              ></div>
            </div>
            {availablePagesCount > 0 && (
              <div>
                {availablePagesCount > 1 && (
                  <div class="text-end text-base-content/50">{pageType()}</div>
                )}
                <div class="relative bg-base-200 p-4 border-s-4 border-primary text-base sm:text-xl rounded-lg [&_ol]:list-inside [&_ul]:list-inside">
                  <div innerHTML={page()}></div>
                  {availablePagesCount > 1 && ready() && (
                    <>
                      <button
                        class="cursor-pointer w-8 h-full absolute top-0 left-0 hover:bg-base-content/10"
                        on:click={() => {
                          setDefinitionPage((prev) => {
                            let next = (prev - 1 + pages.length) % pages.length;
                            for (let i = 0; i < pages.length; i++) {
                              if (pages[next]?.trim()) break;
                              next = (next - 1 + pages.length) % pages.length;
                            }
                            return next;
                          });
                        }}
                      ></button>
                      <button
                        class="cursor-pointer w-8 h-full absolute top-0 right-0 hover:bg-base-content/10"
                        on:click={() => {
                          setDefinitionPage((prev) => {
                            let next = (prev + 1) % pages.length;
                            for (let i = 0; i < pages.length; i++) {
                              if (pages[next]?.trim()) break;
                              next = (next + 1) % pages.length;
                            }
                            return next;
                          });
                        }}
                      ></button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
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
      {ready() && img && (
        <Lazy.ImageModal
          show={showImageModal()}
          img={img.cloneNode()}
          on:click={() => setShowImageModal(false)}
        />
      )}
    </Layout>
  );
}
