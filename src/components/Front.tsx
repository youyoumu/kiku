import { createSignal, lazy, onMount } from "solid-js";
import { Layout } from "./Layout";
import { useAnkiField, useConfig } from "./shared/Context";

const Lazy = {
  AudioButtons: lazy(async () => ({
    default: (await import("./_kiku_lazy")).AudioButtons,
  })),
  CacheJoyoKanji: lazy(async () => ({
    default: (await import("./_kiku_lazy")).CacheJoyoKanji,
  })),
};

export function Front() {
  const expressionAudioRefSignal = createSignal<HTMLDivElement | undefined>();
  const sentenceAudioRefSignal = createSignal<HTMLDivElement | undefined>();

  const [config] = useConfig();
  const { ankiFields, ankiFieldNodes } = useAnkiField<"front">();

  const [ready, setReady] = createSignal(false);
  const [clicked, setClicked] = createSignal(false);

  onMount(() => {
    setTimeout(() => {
      setReady(true);
    }, 50);
  });

  return (
    <>
      <Lazy.CacheJoyoKanji />
      <Layout>
        <div class="flex justify-end flex-row">
          <div class="flex gap-2 items-center relative hover:[&_>_#frequency]:block h-5"></div>
        </div>

        <div
          class="flex rounded-lg gap-4 sm:h-56 flex-col sm:flex-row"
          on:click={() => setClicked((prev) => !prev)}
        >
          <div class="flex-1 bg-base-200 p-4 rounded-lg flex flex-col items-center justify-center">
            <div
              class={`${config.fontSizeBaseExpression} ${config.fontSizeSmExpression}`}
              classList={{
                "border-b-2 border-dotted border-base-content-soft":
                  !!ankiFields.IsClickCard,
              }}
            >
              {!ankiFields.IsSentenceCard && !ankiFields.IsAudioCard
                ? Array.from(ankiFieldNodes.Expression)
                : "?"}
            </div>
          </div>
        </div>

        {(ankiFields.IsAudioCard ||
          ankiFields.IsSentenceCard ||
          ankiFields.IsWordAndSentenceCard ||
          (ankiFields.IsClickCard && clicked())) && (
          <div class="flex flex-col gap-4 items-center text-center">
            <div
              class={`[&_b]:text-base-content-primary ${config.fontSizeBaseSentence} ${config.fontSizeSmSentence}`}
            >
              {Array.from(ankiFieldNodes["kanji:Sentence"])}
            </div>
          </div>
        )}

        {ready() && ankiFields.IsAudioCard && (
          <div class="flex gap-4 justify-center">
            <Lazy.AudioButtons
              position={3}
              expressionAudioRefSignal={expressionAudioRefSignal}
              sentenceAudioRefSignal={sentenceAudioRefSignal}
            />
          </div>
        )}

        {ankiFields.Hint && (
          <div
            class={`flex gap-2 items-center justify-center text-center border-t-1 ${config.fontSizeBaseHint} ${config.fontSizeSmHint}`}
          >
            <div>{Array.from(ankiFieldNodes.Hint)}</div>
          </div>
        )}
      </Layout>
    </>
  );
}
