import { createEffect, ErrorBoundary, Show } from "solid-js";
import h from "solid-js/h";
import { useCardContext } from "#/components/shared/CardContext";
import { useAnkiField } from "../shared/Context";
import { useFieldGroupContext } from "../shared/FieldGroupContext";
import { useGeneralContext } from "../shared/GeneralContext";

export default function Sentence() {
  const [$card, $setCard] = useCardContext();
  const { $group } = useFieldGroupContext();
  const [$general] = useGeneralContext();
  const { ankiFields } = useAnkiField();

  createEffect(() => {
    if ($card.sentenceFieldRef && $group.sentenceField) {
      const ruby = $card.sentenceFieldRef.querySelectorAll("ruby");
      ruby.forEach((el) => {
        el.classList.add(..."[&_rt]:invisible hover:[&_rt]:visible".split(" "));
      });
    }
  });

  function DefaultSentence() {
    return (
      <div
        class={`[&_b]:text-base-content-primary sentence font-secondary animate-fade-in`}
        ref={(ref) => $setCard("sentenceFieldRef", ref)}
        innerHTML={$group.sentenceField}
      ></div>
    );
  }

  return (
    <ErrorBoundary fallback={<DefaultSentence />}>
      <Show when={$general.plugin?.Sentence} fallback={<DefaultSentence />}>
        {(get) => {
          const Sentence = get();
          return (
            <Sentence
              ctx={{
                h,
                ankiFields,
                ankiDroidAPI: () => KIKU_STATE.ankiDroidAPI,
              }}
              DefaultSentence={DefaultSentence}
            />
          );
        }}
      </Show>
    </ErrorBoundary>
  );
}
