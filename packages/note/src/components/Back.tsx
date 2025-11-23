import { lazy, Match, onMount, Suspense, Switch } from "solid-js";
import { unwrap } from "solid-js/store";
import { isServer } from "solid-js/web";
import {
  CardStoreContextProvider,
  useCardContext,
} from "#/components/shared/CardContext";
import { type AnkiFields, ankiFieldsSkeleton } from "#/types";
import type { DatasetProp } from "#/util/config";
import { env, extractKanji } from "#/util/general";
import { useNavigationTransition } from "#/util/hooks";
import { getPlugin } from "#/util/plugin";
import { WorkerClient } from "#/worker/client";
import { Layout } from "./Layout";
import { useConfigContext } from "./shared/ConfigContext";
import { AnkiFieldContextProvider, useAnkiField } from "./shared/Context";
import {
  FieldGroupContextProvider,
  useFieldGroupContext,
} from "./shared/FieldGroupContext";
import { useGeneralContext } from "./shared/GeneralContext";

// biome-ignore format: this looks nicer
const Lazy = {
  Settings: lazy(async () => ({ default: (await import("./_kiku_lazy")).Settings, })),
  Header: lazy(async () => ({ default: (await import("./_kiku_lazy")).Header, })),
  BackFooter: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackFooter, })),
  AudioButtons: lazy(async () => ({ default: (await import("./_kiku_lazy")).AudioButtons, })),
  PictureModal: lazy(async () => ({ default: (await import("./_kiku_lazy")).PictureModal, })),
  BackBody: lazy(async () => ({ default: (await import("./_kiku_lazy")).BackBody, })),
  Pitches: lazy(async () => ({ default: (await import("./_kiku_lazy")).Pitches, })),
  PicturePagination: lazy(async () => ({ default: (await import("./_kiku_lazy")).PicturePagination, })),
  KanjiList: lazy(async () => ({ default: (await import("./_kiku_lazy")).KanjiList, })),
  UseAnkiDroid: lazy(async () => ({ default: (await import("./_kiku_lazy")).UseAnkiDroid, })),
};

export function Back(props: { onExitNested?: () => void }) {
  const navigate = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const [$config] = useConfigContext();
  const { ankiFields } = useAnkiField<"back">();
  const [$general, $setGeneral] = useGeneralContext();

  const tags = ankiFields.Tags.split(" ");

  onMount(() => {
    setTimeout(() => {
      $setCard("ready", true);
      KIKU_STATE.relax = true;
      getPlugin().then((plugin) => {
        $setGeneral("plugin", plugin);
      });

      async function setKanji() {
        try {
          const kanjiList = extractKanji(
            ankiFields.ExpressionFurigana
              ? ankiFields["furigana:ExpressionFurigana"]
              : ankiFields.Expression,
          );
          const worker = new WorkerClient({
            env: env,
            config: unwrap($config),
            assetsPath: import.meta.env.DEV ? "" : KIKU_STATE.assetsPath,
          });
          const nex = await worker.nex;
          const kanji = await nex.querySharedAndSimilar(kanjiList);

          $setCard("kanji", kanji);
          $setCard("kanjiStatus", "success");
          $setCard("worker", worker);

          nex
            .manifest()
            .then((manifest) => $setCard("manifest", manifest))
            .catch(() => {
              KIKU_STATE.logger.warn("Failed to load manifest");
            });
        } catch (e) {
          $setCard("kanjiStatus", "error");
          KIKU_STATE.logger.error(
            "Failed to load kanji information:",
            e instanceof Error ? e.message : "",
          );
        }
      }

      if (!$card.nested) {
        setKanji();
      }
    }, 100);

    const tags = ankiFields.Tags.split(" ");
    $setCard("isNsfw", tags.map((tag) => tag.toLowerCase()).includes("nsfw"));
  });

  const pitchFieldDataset: () => DatasetProp = () => ({
    "data-has-pitch": isServer
      ? "{{#PitchPosition}}true{{/PitchPosition}}"
      : ankiFields.PitchPosition
        ? "true"
        : "",
  });

  const expressionInnerHtml = () => {
    if ($card.nested) {
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
      {$card.ready && !$card.nested && <Lazy.UseAnkiDroid />}
      <Switch>
        <Match when={$card.page === "settings" && !$card.nested && $card.ready}>
          <Lazy.Settings
            onBackClick={() => {
              navigate("main", "back");
            }}
            onCancelClick={() => {
              navigate("main", "back");
            }}
          />
        </Match>
        <Match when={$card.page === "kanji" && !$card.nested && $card.ready}>
          <Lazy.KanjiList
            onBackClick={() => {
              if ($card.selectedSimilarKanji) {
                navigate(
                  () => $setCard("selectedSimilarKanji", undefined),
                  "back",
                );
              } else {
                navigate("main", "back");
              }
            }}
            onNextClick={(noteId) => {
              const shared = Object.values($card.kanji).flatMap(
                (data) => data.shared,
              );
              const similar = Object.values($card.kanji).flatMap((data) =>
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

              $setCard("nestedAnkiFields", ankiFields);
              navigate("nested", "forward");
            }}
          />
        </Match>
        <Match when={$card.page === "nested" && !$card.nested && $card.ready}>
          <AnkiFieldContextProvider ankiFields={$card.nestedAnkiFields}>
            <CardStoreContextProvider nested side="back">
              <FieldGroupContextProvider>
                <Back
                  onExitNested={() => {
                    navigate("kanji", "back");
                  }}
                />
              </FieldGroupContextProvider>
            </CardStoreContextProvider>
          </AnkiFieldContextProvider>
        </Match>
        <Match when={$card.page === "main"}>
          <div class="flex justify-between flex-row h-5 min-h-5">
            {$card.ready && (
              <Lazy.Header
                side="back"
                onSettingsClick={() => {
                  navigate("settings", "forward");
                }}
                onBackClick={props.onExitNested}
                onKanjiClick={
                  Object.keys($card.kanji).length > 0 &&
                  Object.values($card.kanji).flatMap((data) => [
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
              class="flex rounded-lg gap-4 flex-col sm:flex-row"
              classList={{
                "animate-fade-in": KIKU_STATE.relax,
              }}
            >
              <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center sm:min-h-56">
                <div
                  class="expression font-secondary text-center"
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
                  {ankiFields.PitchPosition && $card.ready ? (
                    <Suspense fallback={<span>&nbsp;</span>}>
                      <Lazy.Pitches />
                    </Suspense>
                  ) : isServer ? (
                    "{{#PitchPosition}}<span>&nbsp;</span>{{/PitchPosition}}"
                  ) : (
                    ankiFields.PitchPosition && <span>&nbsp;</span>
                  )}
                </div>
                <div class="hidden sm:block sm:h-8 sm:mt-2">
                  {$card.ready && (
                    <div class="animate-fade-in-sm flex gap-2">
                      <Lazy.AudioButtons position={1} />
                    </div>
                  )}
                </div>
              </div>
              <PictureSection />
            </div>
            <div class="flex justify-between text-base-content-soft items-center gap-2 animate-fade-in h-5 sm:h-8">
              {$card.ready && <Lazy.PicturePagination />}
            </div>
          </div>
          {$card.ready && (
            <Lazy.BackBody
              onDefinitionPictureClick={(picture) => {
                $setCard("imageModal", picture);
              }}
            />
          )}
          {$card.ready && (
            <>
              <Lazy.BackFooter tags={tags} />
              <Lazy.AudioButtons position={2} />
            </>
          )}
        </Match>
      </Switch>
      {$card.ready && (
        <Lazy.PictureModal
          img={$card.imageModal}
          on:click={() => $setCard("imageModal", undefined)}
        />
      )}
    </Layout>
  );
}

function PictureSection() {
  const [$card, $setCard] = useCardContext();
  const { $group } = useFieldGroupContext();

  const pictureFieldDataset: () => DatasetProp = () => ({
    "data-transition": $card.ready ? "true" : undefined,
    "data-tags": "{{Tags}}",
    "data-nsfw": $card.isNsfw ? "true" : "false",
  });

  return (
    <div class="sm:max-w-1/2 bg-base-200 flex sm:items-center rounded-lg relative overflow-hidden justify-center">
      <div
        class="picture-field-background"
        innerHTML={isServer ? undefined : $group.pictureField}
      >
        {isServer ? "{{Picture}}" : undefined}
      </div>
      <div
        class="picture-field"
        on:click={() => {
          $setCard("imageModal", $group.pictureField);
        }}
        {...pictureFieldDataset()}
        innerHTML={isServer ? undefined : $group.pictureField}
      >
        {isServer ? "{{Picture}}" : undefined}
      </div>
    </div>
  );
}
