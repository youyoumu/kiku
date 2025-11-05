import { useAnkiField, useConfig } from "../shared/Context";
import { InfoIcon } from "./Icons";

export default function BackFooter(props: { tags: string[] }) {
  const { ankiFields, ankiFieldNodes } = useAnkiField<"back">();
  const [config] = useConfig();

  return (
    <>
      {ankiFields.MiscInfo && (
        <div
          class={`flex gap-2 items-center justify-center bg-base-200 p-2 rounded-lg animate-fade-in ${config.fontSizeBaseMiscInfo} ${config.fontSizeSmMiscInfo}`}
        >
          <InfoIcon class="h-5 w-5 text-base-content-calm" />
          <div class="text-base-content-calm">
            {Array.from(ankiFieldNodes.MiscInfo).map((node) =>
              node.cloneNode(true),
            )}
          </div>
        </div>
      )}
      <div class="flex gap-2 items-center justify-center animate-fade-in">
        {props.tags.map((tag) => {
          return <div class="badge badge-secondary">{tag}</div>;
        })}
      </div>
    </>
  );
}
