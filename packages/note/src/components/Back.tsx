import { lazy, Match, onMount, Suspense, Switch } from "solid-js";
import { isServer, Portal } from "solid-js/web";
import {
  CardStoreContextProvider,
  useCardContext,
} from "#/components/shared/CardContext";
import type { DatasetProp } from "#/util/config";
import { useKanji, useNavigationTransition } from "#/util/hooks";
import { getPlugin } from "#/util/plugin";
import { Layout } from "./Layout";
import {
  AnkiFieldContextProvider,
  useAnkiFieldContext,
} from "./shared/AnkiFieldsContext";
import { CtxContextProvider } from "./shared/CtxContext";
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
  KanjiPage: lazy(async () => ({ default: (await import("./_kiku_lazy")).KanjiPage, })),
  UseAnkiDroid: lazy(async () => ({ default: (await import("./_kiku_lazy")).UseAnkiDroid, })),
};

export function Back(props: { onExitNested?: () => void }) {
  const navigate = useNavigationTransition();
  const [$card, $setCard] = useCardContext();
  const { ankiFields } = useAnkiFieldContext<"back">();
  const [$general, $setGeneral] = useGeneralContext();

  const tags = ankiFields.Tags.split(" ");

  useKanji();
  onMount(() => {
    setTimeout(() => {
      $setCard("ready", true);
      KIKU_STATE.relax = true;
      getPlugin().then((plugin) => {
        $setGeneral("plugin", plugin);
      });
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
      <Portal mount={KIKU_STATE.root}>
        {$card.ready && <Lazy.Header onExitNested={props.onExitNested} />}
      </Portal>
      <Switch>
        <Match when={$card.page === "settings" && !$card.nested && $card.ready}>
          <Lazy.Settings />
        </Match>
        <Match when={$card.page === "kanji" && !$card.nested && $card.ready}>
          <Lazy.KanjiPage />
        </Match>
        <Match when={$card.page === "nested" && !$card.nested && $card.ready}>
          <AnkiFieldContextProvider ankiFields={$card.nestedAnkiFields}>
            <CardStoreContextProvider nested side="back">
              <FieldGroupContextProvider>
                <CtxContextProvider>
                  <Back
                    onExitNested={() => {
                      navigate("kanji", "back");
                    }}
                  />
                </CtxContextProvider>
              </FieldGroupContextProvider>
            </CardStoreContextProvider>
          </AnkiFieldContextProvider>
        </Match>
        <Match when={$card.page === "main"}>
          <div class="flex flex-col gap-4">
            <div
              class="flex rounded-lg gap-4 flex-col sm:flex-row"
              classList={{
                "animate-fade-in": KIKU_STATE.relax,
              }}
            >
              <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center sm:min-h-56">
                <div
                  class="expression font-secondary text-center vertical-rl"
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
            {$card.ready && <PicturePaginationSection />}
          </div>
          {$card.ready && (
            <Lazy.BackBody
              onDefinitionPictureClick={(picture) => {
                $setCard("pictureModal", picture);
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
          img={$card.pictureModal}
          on:click={() => $setCard("pictureModal", undefined)}
        />
      )}
    </Layout>
  );
}

function PicturePaginationSection() {
  const { $group } = useFieldGroupContext();

  return (
    <div
      class="flex justify-between text-base-content-soft items-center gap-2 animate-fade-in h-5 sm:h-8"
      classList={{
        hidden: $group.ids.length <= 1,
      }}
    >
      <Lazy.PicturePagination />
    </div>
  );
}

function PictureSection() {
  const [$card, $setCard] = useCardContext();
  const { $group } = useFieldGroupContext();
  const { ankiFields } = useAnkiFieldContext<"back">();

  const pictureFieldDataset: () => DatasetProp = () => ({
    "data-transition": $card.ready ? "true" : undefined,
    "data-tags": "{{Tags}}",
    "data-nsfw": $card.isNsfw ? "true" : "false",
  });

  const dataSet1: () => DatasetProp = () => ({
    "data-has-picture": isServer
      ? "{{#Picture}}true{{/Picture}}"
      : ankiFields.Picture
        ? "true"
        : "",
  });

  return (
    <div
      class="sm:max-w-1/2 bg-base-200 flex sm:items-center rounded-lg relative overflow-hidden justify-center picture-field-container"
      {...dataSet1()}
    >
      <div
        class="picture-field-background"
        innerHTML={isServer ? undefined : $group.pictureField}
      >
        {isServer ? "{{Picture}}" : undefined}
      </div>
      <div
        class="picture-field"
        on:click={() => {
          $setCard("pictureModal", $group.pictureField);
        }}
        {...pictureFieldDataset()}
        innerHTML={isServer ? undefined : $group.pictureField}
      >
        {isServer ? "{{Picture}}" : undefined}
      </div>
    </div>
  );
}
