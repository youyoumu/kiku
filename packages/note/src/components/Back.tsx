import { createEffect, lazy, Match, onMount, Suspense, Switch } from "solid-js";
import { unwrap } from "solid-js/store";
import { isServer } from "solid-js/web";
import { type AnkiFields, ankiFieldsSkeleton } from "#/types";
import type { DatasetProp } from "#/util/config";
import { env, extractKanji } from "#/util/general";
import { useNavigationTransition, usePictureField } from "#/util/hooks";
import { WorkerClient } from "#/worker/client";
import { Layout } from "./Layout";
import {
  AnkiFieldContextProvider,
  CardStoreContextProvider,
  useAnkiField,
  useCardStore,
  useConfig,
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
  UseAnkiDroid: lazy(async () => ({ default: (await import("./_kiku_lazy")).UseAnkiDroid, })),
};

export function Back(props: { onExitNested?: () => void }) {
  const navigate = useNavigationTransition();
  const [card, setCard] = useCardStore();
  const [config] = useConfig();
  const { ankiFields } = useAnkiField<"back">();
  usePictureField();

  const tags = ankiFields.Tags.split(" ");

  onMount(() => {
    setTimeout(() => {
      setCard("ready", true);
      KIKU_STATE.relax = true;

      async function setKanji() {
        try {
          const kanjiList = extractKanji(
            ankiFields.ExpressionFurigana
              ? ankiFields["furigana:ExpressionFurigana"]
              : ankiFields.Expression,
          );
          const worker = new WorkerClient({
            env: env,
            config: unwrap(config),
            assetsPath: import.meta.env.DEV ? "" : KIKU_STATE.assetsPath,
          });
          const nex = await worker.nex;
          const kanji = await nex.querySharedAndSimilar(kanjiList);

          setCard("kanji", kanji);
          setCard("kanjiStatus", "success");
          setCard("worker", worker);

          nex
            .manifest()
            .then((manifest) => setCard("manifest", manifest))
            .catch(() => {
              KIKU_STATE.logger.warn("Failed to load manifest");
            });
        } catch (e) {
          setCard("kanjiStatus", "error");
          KIKU_STATE.logger.error(
            "Failed to load kanji information:",
            e instanceof Error ? e.message : "",
          );
        }
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

  const pitchFieldDataset: () => DatasetProp = () => ({
    "data-has-pitch": isServer
      ? "{{#PitchPosition}}true{{/PitchPosition}}"
      : ankiFields.PitchPosition
        ? "true"
        : "",
  });

  const expressionInnerHtml = () => {
    if (card.nested) {
      if (ankiFields.Expression && ankiFields.ExpressionReading) {
        return `<ruby>${ankiFields.Expression}<rt>${ankiFields.ExpressionReading}</rt></ruby>`;
      }
      if (ankiFields.Expression) return ankiFields.Expression;
      return ankiFields.ExpressionReading;
    }
    return isServer
      ? undefined
      : ankiFields.ExpressionFurigana
        ? ankiFields["furigana:ExpressionFurigana"]
        : ankiFields.Expression;
  };

  return (
    <Layout>
      {card.ready && !card.nested && <Lazy.UseAnkiDroid />}
      <Switch>
        <Match when={card.screen === "settings" && !card.nested && card.ready}>
          <Lazy.Settings
            onBackClick={() => {
              navigate("main", "back");
            }}
            onCancelClick={() => {
              navigate("main", "back");
            }}
          />
        </Match>
        <Match when={card.screen === "kanji" && !card.nested && card.ready}>
          <Lazy.KanjiList
            onBackClick={() => {
              if (card.selectedSimilarKanji) {
                navigate("kanji", "back", () => {
                  return setCard("selectedSimilarKanji", undefined);
                });
              } else {
                navigate("main", "back");
              }
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
              navigate("nested", "forward");
            }}
          />
        </Match>
        <Match when={card.screen === "nested" && !card.nested && card.ready}>
          <AnkiFieldContextProvider ankiFields={card.nestedAnkiFields}>
            <CardStoreContextProvider nested side="back">
              <Back
                onExitNested={() => {
                  navigate("kanji", "back");
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
                onSettingsClick={() => {
                  navigate("settings", "forward");
                }}
                onBackClick={props.onExitNested}
                onKanjiClick={
                  Object.keys(card.kanji).length > 0 &&
                  Object.values(card.kanji).flatMap((data) => [
                    ...data.shared,
                    ...Object.values(data.similar),
                  ]).length > 0
                    ? () => {
                        navigate("kanji", "forward");
                      }
                    : undefined
                }
              />
            )}
          </div>
          <div class="flex flex-col gap-4">
            <div
              class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
              classList={{
                "animate-fade-in": KIKU_STATE.relax,
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
                <div
                  class={`mt-6 flex gap-4 pitch pitch-field`}
                  {...pitchFieldDataset()}
                >
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
