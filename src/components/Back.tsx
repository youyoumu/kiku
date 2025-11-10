import { createEffect, lazy, onMount, Suspense } from "solid-js";
import { isServer } from "solid-js/web";
import type { AnkiNote } from "#/types";
import type { DatasetProp } from "#/util/config";
import { extractKanji } from "#/util/general";
import { usePictureField } from "#/util/hooks";
import { worker } from "#/worker/workerClient";
import { Layout } from "./Layout";
import { useAnkiField, useCardStore } from "./shared/Context";

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
};

export function Back() {
  const [card, setCard] = useCardStore();
  const { ankiFields } = useAnkiField<"back">();
  usePictureField();
  const tags = ankiFields.Tags.split(" ");

  onMount(() => {
    setTimeout(() => {
      setCard("ready", true);
      globalThis.KIKU_STATE.relax = true;
    }, 100);

    const tags = ankiFields.Tags.split(" ");
    setCard("isNsfw", tags.map((tag) => tag.toLowerCase()).includes("nsfw"));

    async function findKanjiNotes() {
      const kanjiList = extractKanji(
        ankiFields.ExpressionFurigana
          ? ankiFields["furigana:ExpressionFurigana"]
          : ankiFields.Expression,
      );
      const result = await worker.query(kanjiList);
      console.log("✅ Total found:", result.totalFound);
      setCard(
        "kanji",
        result.notes.reduce(
          (acc, note) => {
            kanjiList.forEach((k) => {
              if (!acc[k]) acc[k] = { shared: [], similar: [] };
              acc[k].shared.push(note);
            });
            return acc;
          },
          {} as Record<string, { shared: AnkiNote[]; similar: AnkiNote[] }>,
        ),
      );
    }
    findKanjiNotes();
    console.log(card.kanji);
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

  return (
    <Layout>
      {card.showSettings && (
        <Lazy.Settings
          onBackClick={() => setCard("showSettings", false)}
          onCancelClick={() => setCard("showSettings", false)}
        />
      )}
      {!card.showSettings && (
        <>
          <div class="flex justify-between flex-row h-5 min-h-5">
            {card.ready && (
              <Lazy.Header
                side="back"
                onSettingsClick={() => setCard("showSettings", true)}
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
                  innerHTML={
                    isServer
                      ? undefined
                      : ankiFields.ExpressionFurigana
                        ? ankiFields["furigana:ExpressionFurigana"]
                        : ankiFields.Expression
                  }
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
        </>
      )}
      {card.ready && (
        <Lazy.ImageModal
          img={card.imageModal}
          on:click={() => setCard("imageModal", undefined)}
        />
      )}
    </Layout>
  );
}
