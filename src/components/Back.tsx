import { createEffect, lazy, Match, onMount, Suspense, Switch } from "solid-js";
import { isServer } from "solid-js/web";
import { type AnkiFields, ankiFieldsSkeleton } from "#/types";
import type { DatasetProp } from "#/util/config";
import { extractKanji } from "#/util/general";
import { usePictureField } from "#/util/hooks";
import { WorkerClient } from "#/worker/client";
import { Layout } from "./Layout";
import {
  AnkiFieldContextProvider,
  CardStoreContextProvider,
  useAnkiField,
  useCardStore,
} from "./shared/Context";

// biome-ignore format: this looks nicer
const Lazy = {
  Settings: lazy(async () => ({ default: (await import("./_kiku_lazy")).Settings, })),
  Header: lazy(async () => ({ default: (await import("./_kiku_lazy")).Header, })),
  BackFooter: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackFooter, })),
  AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy")).AudioButtons, })),
  ImageModal: lazy(async () => ({ default: (await import("./_kiku_lazy")).ImageModal, })),
  BackBody: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackBody, })),
  Pitches: lazy(async () => ({ default: (await import("./_kiku_lazy")).Pitches, })),
  PicturePagination: lazy(async () => ({ default: (await import("./_kiku_lazy")).PicturePagination, })),
  KanjiList: lazy(async () => ({ default: (await import("./_kiku_lazy")).KanjiList, })),
};

export function Back(props: { onExitNested?: () => void }) {
  const [card, setCard] = useCardStore();
  const { ankiFields } = useAnkiField<"back">();
  usePictureField();
  const tags = ankiFields.Tags.split(" ");

  onMount(() => {
    setTimeout(() => {
      setCard("ready", true);
      globalThis.KIKU_STATE.relax = true;

      async function setKanji() {
        const kanjiList = extractKanji(
          ankiFields.ExpressionFurigana
            ? ankiFields["furigana:ExpressionFurigana"]
            : ankiFields.Expression,
        );
        const worker = new WorkerClient();
        const kanji = await worker.invoke({
          type: "querySharedAndSimilar",
          payload: kanjiList,
        });

        setCard("kanji", kanji);
        setCard("kanjiLoading", false);
      }
      if (!card.nested) {
        setKanji();
      }
    }, 100);

    const tags = ankiFields.Tags.split(" ");
    setCard("isNsfw", tags.map((tag) => tag.toLowerCase()).includes("nsfw"));
  });

  createEffect(() => {
    card.pictures.forEach((img) => {
      img.style.display =
        img.dataset.index === card.pictureIndex.toString() ? "block" : "none";
    });
  });

  const pictureFieldDataset: () => DatasetProp = () => ({
    "data-transition": card.ready ? "true" : undefined,
    "data-tags": "{{Tags}}",
    "data-nsfw": card.isNsfw ? "true" : "false",
  });

  const expressionInnerHtml = () => {
    if (card.nested) return ankiFields.Expression;
    return isServer
      ? undefined
      : ankiFields.ExpressionFurigana
        ? ankiFields["furigana:ExpressionFurigana"]
        : ankiFields.Expression;
  };

  return (
    <Layout>
      <Switch>
        <Match when={card.screen === "settings" && !card.nested}>
          <Lazy.Settings
            onBackClick={() => setCard("screen", "main")}
            onCancelClick={() => setCard("screen", "main")}
          />
        </Match>
        <Match when={card.screen === "kanji" && !card.nested}>
          <Lazy.KanjiList
            onBackClick={() => {
              if (card.selectedSimilarKanji) {
                return setCard("selectedSimilarKanji", undefined);
              }
              setCard("screen", "main");
            }}
            onNextClick={(noteId) => {
              const shared = Object.values(card.kanji).flatMap(
                (data) => data.shared,
              );
              const similar = Object.values(card.kanji).flatMap((data) =>
                Object.values(data.similar).flat(),
              );
              const notes = [...shared, ...similar];
              const note = notes.find((note) => note.noteId === noteId);
              if (!note) throw new Error("Note not found");
              const ankiFields: AnkiFields = {
                ...ankiFieldsSkeleton,
                ...Object.fromEntries(
                  Object.entries(note.fields).map(([key, value]) => {
                    return [key, value.value];
                  }),
                ),
                Tags: note.tags.join(" "),
              };

              setCard("nestedAnkiFields", ankiFields);
              setCard("screen", "nested");
            }}
          />
        </Match>
        <Match when={card.screen === "nested" && !card.nested}>
          <AnkiFieldContextProvider ankiFields={card.nestedAnkiFields}>
            <CardStoreContextProvider nested>
              <Back
                onExitNested={() => {
                  setCard("screen", "kanji");
                }}
              />
            </CardStoreContextProvider>
          </AnkiFieldContextProvider>
        </Match>
        <Match when={card.screen === "main"}>
          <div class="flex justify-between flex-row h-5 min-h-5">
            {card.ready && (
              <Lazy.Header
                side="back"
                onSettingsClick={() => setCard("screen", "settings")}
                onBackClick={props.onExitNested}
                onKanjiClick={
                  Object.keys(card.kanji).length > 0 &&
                  Object.values(card.kanji).flatMap((data) => [
                    ...data.shared,
                    ...Object.values(data.similar),
                  ]).length > 0
                    ? () => setCard("screen", "kanji")
                    : undefined
                }
              />
            )}
          </div>
          <div class="flex flex-col gap-4">
            <div
              class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
              classList={{
                "animate-fade-in": globalThis.KIKU_STATE.relax,
              }}
            >
              <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
                <div
                  class="expression font-secondary"
                  innerHTML={expressionInnerHtml()}
                >
                  {isServer
                    ? "{{#ExpressionFurigana}}{{furigana:ExpressionFurigana}}{{/ExpressionFurigana}}{{^ExpressionFurigana}}{{Expression}}{{/ExpressionFurigana}}"
                    : undefined}
                </div>
                <div class={`mt-6 flex gap-4 pitch`}>
                  {ankiFields.PitchPosition && card.ready ? (
                    <Suspense fallback={<span>&nbsp;</span>}>
                      <Lazy.Pitches />
                    </Suspense>
                  ) : isServer ? (
                    "{{#PitchPosition}}<span>&nbsp;</span>{{/PitchPosition}}"
                  ) : (
                    ankiFields.PitchPosition && <span>&nbsp;</span>
                  )}
                </div>
                <div class="hidden sm:flex gap-2 sm:h-8 sm:mt-2">
                  {card.ready && <Lazy.AudioButtons position={1} />}
                </div>
              </div>
              <div class="bg-base-200 rounded-lg relative overflow-hidden">
                <div
                  class="picture-field-background"
                  innerHTML={isServer ? undefined : ankiFields.Picture}
                >
                  {isServer ? "{{Picture}}" : undefined}
                </div>
                <div
                  ref={(ref) => setCard("pictureFieldRef", ref)}
                  class="picture-field"
                  on:click={() => setCard("imageModal", ankiFields.Picture)}
                  {...pictureFieldDataset()}
                  innerHTML={isServer ? undefined : ankiFields.Picture}
                >
                  {isServer ? "{{Picture}}" : undefined}
                </div>
              </div>
            </div>
            <div class="flex justify-between text-base-content-soft items-center gap-2 animate-fade-in h-5 sm:h-8">
              {card.ready && <Lazy.PicturePagination />}
            </div>
          </div>
          {card.ready && (
            <Lazy.BackBody
              onDefinitionPictureClick={(picture) => {
                setCard("imageModal", picture);
              }}
              sentenceIndex={(sentenceLength) => {
                if (card.pictures.length !== sentenceLength) return undefined;
                return card.pictures.length > 1 ? card.pictureIndex : undefined;
              }}
            />
          )}
          {card.ready && (
            <>
              <Lazy.BackFooter tags={tags} />
              <Lazy.AudioButtons position={2} />
            </>
          )}
        </Match>
      </Switch>
      {card.ready && (
        <Lazy.ImageModal
          img={card.imageModal}
          on:click={() => setCard("imageModal", undefined)}
        />
      )}
    </Layout>
  );
}
