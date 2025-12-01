import { createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import type { DatasetProp } from "#/util/config";
import { useAnkiFieldContext } from "./shared/AnkiFieldsContext";
import { useCardContext } from "./shared/CardContext";
import { useFieldGroupContext } from "./shared/FieldGroupContext";

export function PictureSection() {
  const [$card, $setCard] = useCardContext();
  const { $group } = useFieldGroupContext();
  const { ankiFields } = useAnkiFieldContext();
  const [clicked, setClicked] = createSignal(false);

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
      on:click={() => {
        setClicked((prev) => !prev);
      }}
      {...dataSet1()}
    >
      <div
        class="picture-field-background"
        style={{
          opacity: clicked() ? 1 : undefined,
        }}
        innerHTML={isServer ? undefined : $group.pictureField}
      >
        {isServer ? "{{Picture}}" : undefined}
      </div>
      <div
        class="picture-field"
        style={{
          opacity: clicked() ? 1 : undefined,
        }}
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
