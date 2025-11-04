import { InfoIcon } from "lucide-solid";
import type { AnkiBackFields } from "#/types";
import { useAnkiField, useConfig } from "../shared/Context";

export default function BackFooter(props: { tags: string[] }) {
  const ankiFields = useAnkiField() as AnkiBackFields;
  const [config] = useConfig();

  return (
    <>
      {ankiFields.MiscInfo && (
        <div
          class={`flex gap-2 items-center justify-center bg-base-200 p-2 rounded-lg ${config.fontSizeBaseMiscInfo} ${config.fontSizeSmMiscInfo}`}
        >
          <InfoIcon class="h-5 w-5" />
          <div innerHTML={ankiFields.MiscInfo}></div>
        </div>
      )}
      <div class="flex gap-2 items-center justify-center">
        {props.tags.map((tag) => {
          return <div class="badge badge-secondary">{tag}</div>;
        })}
      </div>
    </>
  );
}
